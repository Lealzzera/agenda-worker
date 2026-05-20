import { buildServer } from "./core/server";

async function start() {
  const app = buildServer();

  try {
    await app.listen({ port: 3333, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
