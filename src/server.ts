import { buildServer } from "./core/server";
import { env } from "./env";
import { startAiReplyWorker } from "./modules/ai/ai-reply.worker";

async function start() {
  const app = buildServer();

  startAiReplyWorker().catch((error) => {
    app.log.error(error, "Failed to start AI reply worker");
  });
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
