import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

const env = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
const WS_HOST = env.WS_HOST || env.API_HOST || env.SERVER_HOST; // optional override via app.json
const PUBLIC_SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;

type ParsedServer = { host: string; port?: string; pathPrefix?: string };

const parseServerUri = (uri?: string): ParsedServer | null => {
  if (!uri || typeof uri !== "string") return null;
  try {
    // Prefer URL parser if available
    const u = new URL(uri);
    const pathPrefix = u.pathname && u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : undefined;
    return { host: u.hostname, port: u.port || undefined, pathPrefix };
  } catch (e) {
    // Fallback: minimal regex parse
    const m = uri.match(/^https?:\/\/([^\/:]+)(?::(\d+))?(\/.*)?$/);
    if (!m) return null;
    const pathPrefix = m[3] && m[3] !== "/" ? m[3].replace(/\/$/, "") : undefined;
    return { host: m[1], port: m[2], pathPrefix };
  }
};

const resolveServer = (): ParsedServer => {
  const parsed = parseServerUri(PUBLIC_SERVER_URI);
  if (parsed) return parsed;
  // On Android emulator use the host loopback
  if (Platform.OS === "android" && !Device.isDevice) return { host: "10.0.2.2", port: "8080" };
  // Prefer configured host if provided
  if (WS_HOST && typeof WS_HOST === "string") return { host: WS_HOST, port: "8080" };
  // Fallback
  return { host: "localhost", port: "8080" };
};

export const getApiBaseUrl = async (): Promise<string> => {
  const { host, port } = resolveServer();
  return port ? `http://${host}:${port}` : `http://${host}`;
};

export const getWebSocketUrl = (): string => {
  const { host, port } = resolveServer();
  return port ? `ws://${host}:${port}` : `ws://${host}`;
};
