import { detectLocalHost } from "./getLocalIP";

const WS_PORT = "8081"; // websocket port
const API_PORT = "3000"; // main API port

export const getWebSocketUrl = (): string => {
  const host = detectLocalHost();
  const url = `ws://${host}:${WS_PORT}`;
  console.log("🔌 WebSocket URL:", url);
  return url;
};

export const getApiBaseUrl = (): string => {
  const host = detectLocalHost();
  const url = `http://${host}:${API_PORT}`;
  console.log("📡 API Base URL:", url);
  return url;
};
