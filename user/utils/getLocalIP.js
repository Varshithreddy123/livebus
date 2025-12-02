import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

export const detectLocalHost = () => {
  // 1️⃣ Android Emulator always maps laptop → 10.0.2.2
  if (Platform.OS === "android" && !Device.isDevice) {
    return "10.0.2.2";
  }

  // 2️⃣ Physical device → auto detect LAN IP from Expo
  const expoDebugHost =
    Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri;

  if (expoDebugHost) {
    // hostUri example: "10.109.150.94:8081"
    return expoDebugHost.split(":")[0];
  }

  // 3️⃣ Fallback if nothing found
  return "10.0.2.2";
};
