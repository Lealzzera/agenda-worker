import { env } from "@/env";

export type WahaSessionEngine = "WEBJS" | "NOWEB" | "GOWS";

export type WahaSessionStatus =
  | "STARTING"
  | "SCAN_QR_CODE"
  | "WORKING"
  | "FAILED"
  | "STOPPED";

export interface IWahaSessionInfo {
  name: string;
  status: WahaSessionStatus;
  engine?: { engine: WahaSessionEngine };
  me?: {
    id: string;
    pushName?: string;
  };
}

export interface IWahaWebhookConfig {
  url: string;
  events: string[];
}

export interface IStartWahaSessionInput {
  name: string;
  engine?: WahaSessionEngine;
  webhook?: IWahaWebhookConfig;
}

export interface ISendTextInput {
  session: string;
  phoneNumber: string;
  text: string;
}

export class WahaError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "WahaError";
  }
}

export class WhatsAppService {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor() {
    this.baseUrl = env.WAHA_URL.replace(/\/+$/, "");
    this.apiKey = env.WAHA_API_KEY;
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["X-Api-Key"] = this.apiKey;
    }

    return headers;
  }

  private async request<TResponse = unknown>(
    method: string,
    path: string,
    body?: unknown,
    { expectJson = true }: { expectJson?: boolean } = {},
  ): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        payload = await response.text();
      }
      throw new WahaError(
        `WAHA ${method} ${path} failed: ${response.status} ${response.statusText}`,
        response.status,
        payload,
      );
    }

    if (!expectJson || response.status === 204) {
      return undefined as TResponse;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as TResponse;
    }
    return (await response.text()) as unknown as TResponse;
  }

  /**
   * Normaliza um n\u00famero de telefone (apenas d\u00edgitos) no formato esperado pelo WAHA: 5511999999999@c.us
   */
  buildChatId(phoneNumber: string): string {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    if (!digitsOnly) {
      throw new Error("Invalid phone number for WhatsApp chatId");
    }
    return `${digitsOnly}@c.us`;
  }

  async startSession(input: IStartWahaSessionInput): Promise<IWahaSessionInfo> {
    const payload: Record<string, unknown> = {
      name: input.name,
      config: {
        engine: input.engine ?? "WEBJS",
        ...(input.webhook
          ? {
              webhooks: [
                {
                  url: input.webhook.url,
                  events: input.webhook.events,
                },
              ],
            }
          : {}),
      },
    };
    return this.request<IWahaSessionInfo>("POST", "/api/sessions", payload);
  }

  /**
   * Pausa a sess\u00e3o no WAHA mantendo as credenciais de pareamento.
   * Usar no logout / beforeunload \u2014 pr\u00f3ximo start reautentica sem QR novo.
   */
  async stopSession(sessionName: string): Promise<void> {
    await this.request(
      "POST",
      `/api/sessions/${encodeURIComponent(sessionName)}/stop`,
      undefined,
      { expectJson: false },
    );
  }

  /**
   * Reinicia uma sess\u00e3o que j\u00e1 existe no WAHA (mesmo nome).
   * Reaproveita as credenciais, n\u00e3o pede QR novamente.
   */
  async startExistingSession(sessionName: string): Promise<void> {
    await this.request(
      "POST",
      `/api/sessions/${encodeURIComponent(sessionName)}/start`,
      undefined,
      { expectJson: false },
    );
  }

  /**
   * Apaga a sess\u00e3o e todas as credenciais de pareamento no WAHA.
   * Usar em "desvincular WhatsApp" \u2014 pr\u00f3xima conex\u00e3o exige QR novamente.
   */
  async logoutSession(sessionName: string): Promise<void> {
    await this.request(
      "DELETE",
      `/api/sessions/${encodeURIComponent(sessionName)}`,
      undefined,
      { expectJson: false },
    );
  }

  async getSession(sessionName: string): Promise<IWahaSessionInfo | null> {
    try {
      return await this.request<IWahaSessionInfo>(
        "GET",
        `/api/sessions/${encodeURIComponent(sessionName)}`,
      );
    } catch (err) {
      if (err instanceof WahaError && err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  async getSessions(): Promise<IWahaSessionInfo[]> {
    return this.request<IWahaSessionInfo[]>("GET", "/api/sessions");
  }

  /**
   * Retorna o QR em data URI (data:image/png;base64,...) pronto pra <img src="...">.
   * Retorna null quando a sess\u00e3o n\u00e3o est\u00e1 em SCAN_QR_CODE (j\u00e1 pareada, stopped, etc).
   */
  async getQrCode(sessionName: string): Promise<string | null> {
    try {
      const raw = await this.request<
        | { mimetype?: string; data?: string; value?: string }
        | string
      >(
        "GET",
        `/api/${encodeURIComponent(sessionName)}/auth/qr?format=raw`,
      );

      // Log temporário pra diagnosticar o que o WAHA tá retornando
      console.log(
        "[WAHA] QR raw response:",
        typeof raw === "string" ? raw.slice(0, 200) : JSON.stringify(raw),
      );

      // WAHA devolve { mimetype, data }, mas algumas versões usam { value } ou string pura
      const data =
        typeof raw === "string"
          ? raw
          : (raw?.data ?? raw?.value);
      const mimetype =
        typeof raw === "string" ? "image/png" : (raw?.mimetype ?? "image/png");

      if (!data) return null;
      return `data:${mimetype};base64,${data}`;
    } catch (err) {
      console.log(
        "[WAHA] QR error:",
        err instanceof WahaError
          ? { status: err.status, body: err.body, message: err.message }
          : err,
      );
      if (
        err instanceof WahaError &&
        (err.status === 404 || err.status === 422)
      ) {
        return null;
      }
      throw err;
    }
  }

  async sendText({ session, phoneNumber, text }: ISendTextInput): Promise<void> {
    await this.request("POST", "/api/sendText", {
      session,
      chatId: this.buildChatId(phoneNumber),
      text,
    });
  }
}
