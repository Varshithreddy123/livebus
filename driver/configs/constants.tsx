import { Driving, SmallCard, SmartCar, Wallet } from "@/utils/icons";
import Images from "../utils/images";
import color from "@/themes/app.colors";
import React from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";

import Constants from "expo-constants";

// Get IP from environment or use default (192.168.137.1 - your Wi-Fi IP)
const env = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
const DEFAULT_IP = "192.168.137.1"; // Your Wi-Fi adapter IP
const WS_HOST = env.WEBSOCKET_URL?.replace("ws://", "").split(":")[0] || env.WS_HOST || DEFAULT_IP;
const API_HOST = env.API_HOST || env.SERVER_HOST || DEFAULT_IP;
const API_PORT = env.PORT || "3000";
const WS_PORT = env.WS_PORT || "8081";

export const getWebSocketUrl = () => {
  // Android Emulator: always use 10.0.2.2
  if (Platform.OS === "android" && !Device.isDevice) {
    return `ws://10.0.2.2:${WS_PORT}`;
  }
  // Physical Device: use configured host
  return `ws://${WS_HOST}:${WS_PORT}`;
};

export const getApiBaseUrl = () => {
  // Android Emulator: always use 10.0.2.2
  if (Platform.OS === "android" && !Device.isDevice) {
    return `http://10.0.2.2:${API_PORT}`;
  }
  // Physical Device: use configured host
  return `http://${API_HOST}:${API_PORT}`;
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

export const rideData = [
  { id: "1", totalEarning: "Ind 1200", title: "Total Earning" },
  { id: "2", totalEarning: "12", title: "Complete Ride" },
  { id: "3", totalEarning: "1", title: "Pending Ride" },
  { id: "4", totalEarning: "04", title: "Cancel Ride" },
];

// Commented out mock data for testing with real data
// export const recentRidesData: recentRidesTypes[] = [
//   {
//     id: "1",
//     user: { name: "Arjun Nair" },
//     rating: "5",
//     earning: "150",
//     pickup: "KSRTC Bus Stand, Thiruvananthapuram, Kerala",
//     dropoff: "MG Road, Ernakulam, Kerala",
//     time: "15 Aug 10:30 am",
//     distance: "220km",
//     charge: "150",
//     currentLocationName: "KSRTC Bus Stand, Thiruvananthapuram, Kerala",
//     destinationLocationName: "MG Road, Ernakulam, Kerala",
//     createdAt: "2024-08-15T10:30:00.000Z",
//   },
//   {
//     id: "2",
//     user: { name: "Priya Menon" },
//     rating: "4.8",
//     earning: "120",
//     pickup: "Central Railway Station, Kozhikode, Kerala",
//     dropoff: "Calicut University, Malappuram, Kerala",
//     time: "16 Aug 02:15 pm",
//     distance: "25km",
//     charge: "120",
//     currentLocationName: "Central Railway Station, Kozhikode, Kerala",
//     destinationLocationName: "Calicut University, Malappuram, Kerala",
//     createdAt: "2024-08-16T14:15:00.000Z",
//   },
//   {
//     id: "3",
//     user: { name: "Vijay Kumar" },
//     rating: "4.9",
//     earning: "180",
//     pickup: "Kannur Bus Stand, Kannur, Kerala",
//     dropoff: "Mysore Road, Bangalore, Karnataka",
//     time: "17 Aug 08:45 am",
//     distance: "280km",
//     charge: "180",
//     currentLocationName: "Kannur Bus Stand, Kannur, Kerala",
//     destinationLocationName: "Mysore Road, Bangalore, Karnataka",
//     createdAt: "2024-08-17T08:45:00.000Z",
//   },
//   {
//     id: "4",
//     user: { name: "Anjali Rajan" },
//     rating: "5",
//     earning: "95",
//     pickup: "Alappuzha Boat Jetty, Alappuzha, Kerala",
//     dropoff: "Vypeen Island, Kochi, Kerala",
//     time: "18 Aug 11:20 am",
//     distance: "65km",
//     charge: "95",
//     currentLocationName: "Alappuzha Boat Jetty, Alappuzha, Kerala",
//     destinationLocationName: "Vypeen Island, Kochi, Kerala",
//     createdAt: "2024-08-18T11:20:00.000Z",
//   },
//   {
//     id: "5",
//     user: { name: "Suresh Pillai" },
//     rating: "4.7",
//     earning: "200",
//     pickup: "Thrissur Railway Station, Thrissur, Kerala",
//     dropoff: "Palakkad Junction, Palakkad, Kerala",
//     time: "19 Aug 03:50 pm",
//     distance: "75km",
//     charge: "200",
//     currentLocationName: "Thrissur Railway Station, Thrissur, Kerala",
//     destinationLocationName: "Palakkad Junction, Palakkad, Kerala",
//     createdAt: "2024-08-19T15:50:00.000Z",
//   },
// ];

export const rideIcons = [
  <Wallet colors={color.primary} />,
  <SmartCar />,
  <SmallCard color={color.primary} />,
  <Driving color={color.primary} />,
];

export const recentRidesData: recentRidesTypes[] = [
  {
    id: "1",
    user: { name: "Arjun Nair" },
    rating: "5",
    earning: "150",
    pickup: "KSRTC Bus Stand, Thiruvananthapuram, Kerala",
    dropoff: "MG Road, Ernakulam, Kerala",
    time: "15 Aug 10:30 am",
    distance: "220km",
    charge: "150",
    currentLocationName: "KSRTC Bus Stand, Thiruvananthapuram, Kerala",
    destinationLocationName: "MG Road, Ernakulam, Kerala",
    createdAt: "2024-08-15T10:30:00.000Z",
  },
  {
    id: "2",
    user: { name: "Priya Menon" },
    rating: "4.8",
    earning: "120",
    pickup: "Central Railway Station, Kozhikode, Kerala",
    dropoff: "Calicut University, Malappuram, Kerala",
    time: "16 Aug 02:15 pm",
    distance: "25km",
    charge: "120",
    currentLocationName: "Central Railway Station, Kozhikode, Kerala",
    destinationLocationName: "Calicut University, Malappuram, Kerala",
    createdAt: "2024-08-16T14:15:00.000Z",
  },
  {
    id: "3",
    user: { name: "Vijay Kumar" },
    rating: "4.9",
    earning: "180",
    pickup: "Kannur Bus Stand, Kannur, Kerala",
    dropoff: "Mysore Road, Bangalore, Karnataka",
    time: "17 Aug 08:45 am",
    distance: "280km",
    charge: "180",
    currentLocationName: "Kannur Bus Stand, Kannur, Kerala",
    destinationLocationName: "Mysore Road, Bangalore, Karnataka",
    createdAt: "2024-08-17T08:45:00.000Z",
  },
  {
    id: "4",
    user: { name: "Anjali Rajan" },
    rating: "5",
    earning: "95",
    pickup: "Alappuzha Boat Jetty, Alappuzha, Kerala",
    dropoff: "Vypeen Island, Kochi, Kerala",
    time: "18 Aug 11:20 am",
    distance: "65km",
    charge: "95",
    currentLocationName: "Alappuzha Boat Jetty, Alappuzha, Kerala",
    destinationLocationName: "Vypeen Island, Kochi, Kerala",
    createdAt: "2024-08-18T11:20:00.000Z",
  },
  {
    id: "5",
    user: { name: "Suresh Pillai" },
    rating: "4.7",
    earning: "200",
    pickup: "Thrissur Railway Station, Thrissur, Kerala",
    dropoff: "Palakkad Junction, Palakkad, Kerala",
    time: "19 Aug 03:50 pm",
    distance: "75km",
    charge: "200",
    currentLocationName: "Thrissur Railway Station, Thrissur, Kerala",
    destinationLocationName: "Palakkad Junction, Palakkad, Kerala",
    createdAt: "2024-08-19T15:50:00.000Z",
  },
];
