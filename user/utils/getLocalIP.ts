import { Platform } from "react-native";
import * as Device from "expo-device";

const HOTSPOT_IP = "10.16.88.94"; // Your laptop Wi-Fi hotspot IP from ipconfig

export const detectLocalHost = (): string => {
  // 1️⃣ Android Emulator always maps laptop → 10.0.2.2
  if (Platform.OS === "android" && !Device.isDevice) {
    return "10.0.2.2";
  }

  // 2️⃣ Physical device → use hotspot IP
  if (Platform.OS === "android" && Device.isDevice) {
    return HOTSPOT_IP;
  }

  // 3️⃣ iOS simulator
  if (Platform.OS === "ios" && !Device.isDevice) {
    return "localhost";
  }

  // 4️⃣ iOS physical device
  if (Platform.OS === "ios" && Device.isDevice) {
    return HOTSPOT_IP;
  }

  // Fallback
  return HOTSPOT_IP;
};
