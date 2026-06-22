import { redisConnection } from "@/queues/redis-connection";
import { AiReplyJob } from "@/types/types";
import { Queue } from "bullmq";

export const AI_REPLY_QUEUE_NAME = "whatsapp-messages-pending-reply";

const AI_REPLY_DEBOUNCE_MS = 15000;

let aiReplyQueue: Queue<AiReplyJob> | null = null;
const pendingAiReplyJobs = new Map<
  string,
  {
    data: AiReplyJob;
    timeout: NodeJS.Timeout;
  }
>();

async function getAiReplyQueue() {
  if (aiReplyQueue) {
    return aiReplyQueue;
  }

  aiReplyQueue = new Queue<AiReplyJob>(AI_REPLY_QUEUE_NAME, {
    connection: redisConnection,
  });

  return aiReplyQueue;
}

export function scheduleAiReplyJob(data: AiReplyJob) {
  const jobId = buildDebouncedJobId(data);
  const pendingJob = pendingAiReplyJobs.get(jobId);
  const jobData = pendingJob
    ? mergePendingMessages(pendingJob.data, data)
    : data;

  if (pendingJob) {
    clearTimeout(pendingJob.timeout);
  }

  const timeout = setTimeout(() => {
    pendingAiReplyJobs.delete(jobId);
    enqueueAiReplyJob(jobId, jobData).catch((error) => {
      console.error("Failed to enqueue debounced AI reply job", {
        jobId,
        error,
      });
    });
  }, AI_REPLY_DEBOUNCE_MS);

  pendingAiReplyJobs.set(jobId, {
    data: jobData,
    timeout,
  });
}

function buildDebouncedJobId(data: AiReplyJob) {
  return `${data.clinicId}:${data.session}:${data.chatId}`;
}

async function enqueueAiReplyJob(jobId: string, data: AiReplyJob) {
  const queue = await getAiReplyQueue();
  const bullMqJobId = buildBullMqJobId(jobId);

  await queue.add("reply", data, {
    jobId: bullMqJobId,
    attempts: 3,
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

function buildBullMqJobId(jobId: string) {
  return `${jobId.replace(/:/g, "_")}_${Date.now()}`;
}

function mergePendingMessages(previousJob: AiReplyJob, nextJob: AiReplyJob) {
  const previousMessage = previousJob.message.trim();
  const nextMessage = nextJob.message.trim();

  return {
    ...nextJob,
    message: [previousMessage, nextMessage].filter(Boolean).join(" "),
    contactName: nextJob.contactName ?? previousJob.contactName,
  };
}

export async function closeAiReplyQueue() {
  if (!aiReplyQueue) {
    return;
  }

  for (const pendingJob of pendingAiReplyJobs.values()) {
    clearTimeout(pendingJob.timeout);
  }

  pendingAiReplyJobs.clear();
  await aiReplyQueue.close();
  aiReplyQueue = null;
}
