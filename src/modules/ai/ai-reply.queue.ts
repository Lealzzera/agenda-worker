import { redisConnection } from "@/queues/redis-connection";
import { AiReplyJob } from "./ai-reply-job";

export const AI_REPLY_QUEUE_NAME = "ai-reply";

let aiReplyQueue: {
  add: (
    name: string,
    data: AiReplyJob,
    options?: Record<string, unknown>,
  ) => Promise<unknown>;
  close: () => Promise<void>;
} | null = null;

async function getAiReplyQueue() {
  if (aiReplyQueue) {
    return aiReplyQueue;
  }

  const { Queue } = await import("bullmq");
  aiReplyQueue = new Queue(AI_REPLY_QUEUE_NAME, {
    connection: redisConnection,
  });

  return aiReplyQueue!;
}

export async function enqueueAiReplyJob(data: AiReplyJob) {
  console.log("DATA BULLMQ ------>", data);
  const queue = await getAiReplyQueue();

  await queue.add("reply", data, {
    jobId:
      data.messageId ??
      `${data.clinicId}:${data.session}:${data.chatId}:${Date.now()}`,
    attempts: 3,
    delay: 3000,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: {
      age: 60 * 60,
      count: 1000,
    },
    removeOnFail: {
      age: 60 * 60 * 24,
      count: 1000,
    },
  });
}

export async function closeAiReplyQueue() {
  if (!aiReplyQueue) {
    return;
  }

  await aiReplyQueue.close();
  aiReplyQueue = null;
}
