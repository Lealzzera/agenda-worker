import { env } from "@/env";
import { redisConnection } from "@/queues/redis-connection";
import { buildClinicAiContext } from "./ai-context.service";
import { AiReplyJob } from "./ai-reply-job";
import { AI_REPLY_QUEUE_NAME } from "./ai-reply.queue";
import { createOpenAiTextResponse } from "./openai-client";
import { sendWahaAiMessage } from "./waha-ai-message.service";

const AI_REPLY_INSTRUCTIONS = `
Você é o atendente virtual de uma clínica.
Responda em português do Brasil, com tom educado, claro e objetivo.
Use somente as informações da clínica e da mensagem do paciente.
Se não souber uma informação, diga que vai encaminhar para a equipe da clínica.
Não invente horários, valores, serviços, políticas ou diagnósticos.
Não dê orientação médica definitiva.
caso o cliente queira marcar um horário, você peça o nome do paciente, serviço desejado data e hora.
após o fornecimento desses dados você deve chamar essa rota: http://localhost:3333/api/v1/appointments
método POST, você irá mandar o clinicId, customerPhoneNumber, appointmentDate, time, notes e status.
Esses campos mencionados devem ser um objeto no seguinte formato:
{
  clinicId: string,
  customerPhoneNumber: string,
  appointmentDate: string,
  time: string,
  notes: string,
  status: string
}

preste atenção no formato do customerPhoneNumber, ele deve ser no formato 55XXXXXXXXXXX, o time precisa ser no formato HH:MM,
appointmentDate precisa ser no formato YYYY-MM-DD e o status para todos os novos agendamentos deve ser "PENDING".
`.trim();

type BullMqJob<T> = {
  id?: string;
  data: T;
};

type BullMqWorker<T> = {
  on: (
    event: "completed" | "failed",
    handler: (job: BullMqJob<T> | undefined, error: Error) => void,
  ) => void;
  close: () => Promise<void>;
};

let aiReplyWorker: BullMqWorker<AiReplyJob> | null = null;

export async function startAiReplyWorker() {
  if (!env.AI_WORKER_ENABLED || aiReplyWorker) {
    return aiReplyWorker;
  }

  const { Worker } = await import("bullmq");

  aiReplyWorker = new Worker(
    AI_REPLY_QUEUE_NAME,
    async (job: BullMqJob<AiReplyJob>) => {
      const clinicContext = await buildClinicAiContext(job.data.clinicId);
      const input = `
Contexto da clínica:
${clinicContext}

Paciente: ${job.data.contactName ?? "Paciente"}
Mensagem recebida:
${job.data.message}
`.trim();

      const aiReply = await createOpenAiTextResponse({
        instructions: AI_REPLY_INSTRUCTIONS,
        input,
      });

      await sendWahaAiMessage({
        session: job.data.session,
        chatId: job.data.chatId,
        text: aiReply,
      });
    },
    {
      connection: redisConnection,
      concurrency: 3,
    },
  );

  aiReplyWorker!.on("completed", (job) => {
    console.log("AI reply job completed", { jobId: job?.id });
  });

  aiReplyWorker!.on("failed", (job, error) => {
    console.error("AI reply job failed", {
      jobId: job?.id,
      error,
    });
  });

  return aiReplyWorker;
}

export async function stopAiReplyWorker() {
  if (!aiReplyWorker) {
    return;
  }

  await aiReplyWorker.close();
  aiReplyWorker = null;
}
