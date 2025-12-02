import http from "http";
import { app } from "./app";

const DEFAULT_PORT = 3000;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;

const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`✅ Express HTTP server listening on http://0.0.0.0:${port}`);
});

server.on("error", (err: any) => {
  console.error("❌ Express server error:", err && err.message ? err.message : err);
  if (err && err.code === "EADDRINUSE") {
    console.error(`⚠️  Port ${port} is already in use.`);
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});