import { env } from "@/env";

interface IWhatsAppSendMessage {
    session: string;
    chatId: string;
    text: string;
}

interface IWhatsAppSession {
    name: string;
    config: {
        engine: string;
    };
}

export class WhatsAppService {
    private readonly baseUrl: string;
    private readonly apiKey?: string;

    constructor() {
        this.baseUrl = env.WAHA_URL;
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

    async startSession(session: IWhatsAppSession): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/sessions`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                name: session.name,
                config: session.config,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to start WAHA session: ${response.statusText}`);
        }
    }

    async stopSession(sessionName: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/sessions`, {
            method: "DELETE",
            headers: this.headers,
            body: JSON.stringify({ name: sessionName }),
        });

        if (!response.ok) {
            throw new Error(`Failed to stop WAHA session: ${response.statusText}`);
        }
    }

    async sendMessage({ session, chatId, text }: IWhatsAppSendMessage): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/sendText`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                session,
                chatId,
                text,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
        }
    }

    async getQrCode(session: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/sessions/${session}/qr`, {
            method: "GET",
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to get QR code: ${response.statusText}`);
        }

        return response.text();
    }

    async getSessions(): Promise<Array<{ name: string; status: string }>> {
        const response = await fetch(`${this.baseUrl}/api/sessions`, {
            method: "GET",
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to get sessions: ${response.statusText}`);
        }

        return response.json();
    }
}
