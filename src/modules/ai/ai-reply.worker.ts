import { env } from "@/env";
import { buildAiReplyPrompt } from "@/helpers/prompt-builder";
import { redisConnection } from "@/queues/redis-connection";
import { AiReplyJob } from "@/types/types";
import type { Worker as BullMqWorker, Job } from "bullmq";

import { aiToolsList, executeAiSchedulingTool } from "@/helpers/ai-tools-list";
import { isWhatsappConversationAiEnabled } from "@/modules/whatsapp-conversations/is-whatsapp-conversation-ai-enabled";
import {
  appendAiConversationTurn,
  buildAiConversationKey,
  getAiConversationHistory,
} from "./ai-conversation-memory";
import { AI_REPLY_QUEUE_NAME } from "./ai-reply.queue";
import { createOpenAiTextResponse } from "./openai-client";
import { sendWahaAiMessage } from "./waha-ai-message.service";

let aiReplyWorker: BullMqWorker<AiReplyJob> | null = null;

export async function startAiReplyWorker() {
  if (!env.AI_WORKER_ENABLED || aiReplyWorker) {
    return aiReplyWorker;
  }

  const { Worker } = await import("bullmq");

  aiReplyWorker = new Worker<AiReplyJob>(
    AI_REPLY_QUEUE_NAME,
    async (job: Job<AiReplyJob>) => {
      console.log("AI reply job started", {
        jobId: job.id,
        clinicId: job.data.clinicId,
        chatId: job.data.chatId,
      });

      const conversationKey = buildAiConversationKey({
        clinicId: job.data.clinicId,
        session: job.data.session,
        chatId: job.data.chatId,
      });

      const aiEnabled = await isWhatsappConversationAiEnabled({
        clinicId: job.data.clinicId,
        session: job.data.session,
        chatId: job.data.chatId,
      });

      if (!aiEnabled) {
        console.log("AI reply job skipped because AI is disabled", {
          jobId: job.id,
          clinicId: job.data.clinicId,
          chatId: job.data.chatId,
        });
        return;
      }

      const conversationHistory = getAiConversationHistory(conversationKey);

      const { instructions, input } = await buildAiReplyPrompt({
        job: job.data,
        currentDate: new Date(),
        conversationHistory,
      });

      const aiReply = await createOpenAiTextResponse({
        instructions,
        input,
        tools: [...aiToolsList],
        executeTool: executeAiSchedulingTool,
      });

      await sendWahaAiMessage({
        session: job.data.session,
        chatId: job.data.chatId,
        text: aiReply,
      });

      appendAiConversationTurn({
        conversationKey,
        role: "user",
        content: job.data.message,
      });
      appendAiConversationTurn({
        conversationKey,
        role: "assistant",
        content: aiReply,
      });
    },
    {
      connection: redisConnection,
      concurrency: 3,
    },
  );

  aiReplyWorker.on("completed", (job) => {
    console.log("AI reply job completed", { jobId: job.id });
  });

  aiReplyWorker.on("failed", (job, error) => {
    console.error("AI reply job failed", {
      jobId: job?.id,
      error,
    });
  });

  console.log("AI reply worker started", { queueName: AI_REPLY_QUEUE_NAME });

  return aiReplyWorker;
}

export async function stopAiReplyWorker() {
  if (!aiReplyWorker) {
    return;
  }

  await aiReplyWorker.close();
  aiReplyWorker = null;
}
