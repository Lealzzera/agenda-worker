import {
  startAiReplyWorker,
  stopAiReplyWorker,
} from "@/modules/ai/ai-reply.worker";

startAiReplyWorker()
  .then(() => {
    console.log("AI reply worker running");
  })
  .catch((error) => {
    console.error("Failed to start AI reply worker", error);
    process.exit(1);
  });

async function shutdown() {
  await stopAiReplyWorker();
  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
