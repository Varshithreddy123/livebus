import Images from "../utils/images";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

// Resolve host from env to avoid hardcoding IPs
const env = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
const DEFAULT_IP = "192.168.137.1"; // Your Wi-Fi adapter IP
const PC_LAN_IP = env.WEBSOCKET_URL?.replace("ws://", "").split(":")[0] || env.WS_HOST || env.API_HOST || env.SERVER_HOST || DEFAULT_IP;
const API_PORT = env.PORT || "3000";
const WS_PORT = env.WS_PORT || "8081";

export const getWebSocketUrl = () => {
  if (Platform.OS === "android" && !Device.isDevice) {
    return `ws://10.0.2.2:${WS_PORT}`;
  }
  return `ws://${PC_LAN_IP}:${WS_PORT}`;
};

export const getApiBaseUrl = () => {
  if (Platform.OS === "android" && !Device.isDevice) {
    return `http://10.0.2.2:${API_PORT}`;
  }
  return `http://${PC_LAN_IP}:${API_PORT}`;
};

export const slides = [
  {
    id: 0,
    image: Images.destination,
    text: "Choose Your Destination",
    description: "First choose your destination where you want to go!",
  },
  {
    id: 1,
    image: Images.trip,
    text: "Wait for your driver",
    description: "Just wait for a while now until your driver is picking you!",
  },
  {
    id: 2,
    image: Images.bookRide,
    text: "Enjoy Your Trip",
    description:
      "Now enjoy your trip, pay your driver after reaching the destination!",
  },
];

// Commented out mock data for testing with real data
// export const recentRidesData = [
//   {
//     id: "1",
//     driver: { name: "Arjun Nair" },
//     charge: "150",
//     cratedAt: "2024-08-15",
//     distance: "220km",
//     currentLocationName: "KSRTC Bus Stand, Thiruvananthapuram, Kerala",
//     destinationLocationName: "MG Road, Ernakulam, Kerala",
//   },
//   {
//     id: "2",
//     driver: { name: "Priya Menon" },
//     charge: "120",
//     cratedAt: "2024-08-16",
//     distance: "25km",
//     currentLocationName: "Central Railway Station, Kozhikode, Kerala",
//     destinationLocationName: "Calicut University, Malappuram, Kerala",
//   },
//   {
//     id: "3",
//     driver: { name: "Vijay Kumar" },
//     charge: "180",
//     cratedAt: "2024-08-17",
//     distance: "280km",
//     currentLocationName: "Kannur Bus Stand, Kannur, Kerala",
//     destinationLocationName: "Mysore Road, Bangalore, Karnataka",
//   },
//   {
//     id: "4",
//     driver: { name: "Anjali Rajan" },
//     charge: "95",
//     cratedAt: "2024-08-18",
//     distance: "65km",
//     currentLocationName: "Alappuzha Boat Jetty, Alappuzha, Kerala",
//     destinationLocationName: "Vypeen Island, Kochi, Kerala",
//   },
//   {
//     id: "5",
//     driver: { name: "Suresh Pillai" },
//     charge: "200",
//     cratedAt: "2024-08-19",
//     distance: "75km",
//     currentLocationName: "Thrissur Railway Station, Thrissur, Kerala",
//     destinationLocationName: "Palakkad Junction, Palakkad, Kerala",
//   },
// ];

// Don't create global WebSocket instance - create it per component as needed
// export const ws = new WebSocket(getWebSocketUrl()); // REMOVED - causes connection issues
