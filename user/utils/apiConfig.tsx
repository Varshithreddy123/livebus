import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

const env = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
const WS_HOST = env.WS_HOST || env.API_HOST || env.SERVER_HOST; // optional override via app.json

const resolveHost = (): string => {
  // On Android emulator use the host loopback
  if (Platform.OS === "android" && !Device.isDevice) return "10.0.2.2";
  // Prefer configured host if provided
  if (WS_HOST && typeof WS_HOST === "string") return WS_HOST;
  // Fallback: try development machine via localhost (works for same device)
  return "localhost";
};

export const getApiBaseUrl = async (): Promise<string> => {
  const host = resolveHost();
  return `http://${host}:8080`;
};

export const getWebSocketUrl = (): string => {
  const host = resolveHost();
  return `ws://${host}:8080`;
};
