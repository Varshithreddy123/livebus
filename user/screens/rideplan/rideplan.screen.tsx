import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import styles from "./styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { external } from "@/styles/external.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { router } from "expo-router";
import { Clock, LeftArrow, PickLocation, PickUpLocation } from "@/utils/icons";
import color from "@/themes/app.colors";
import DownArrow from "@/assets/icons/downArrow";
import PlaceHolder from "@/assets/icons/placeHolder";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import _ from "lodash";
import axios from "axios";
import * as Location from "expo-location";
import { Toast } from "react-native-toast-notifications";
import moment from "moment";
import { parseDuration } from "@/utils/time/parse.duration";
import Button from "@/components/common/button";
import { useGetUserData } from "@/hooks/useGetUserData";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { getWebSocketUrl } from "@/utils/apiConfig";

export default function RidePlanScreen() {
  const { userData: user } = useGetUserData();
  const ws = useRef<any>(null);
  const notificationListener = useRef<any>();
  const [wsConnected, setWsConnected] = useState(false);
  const [places, setPlaces] = useState<any>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<any>({
    latitude: 9.0825,
    longitude: 76.4910,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });

  // Initialize with Amrita School of Engineering as default, will update with user's actual location
  const [currentLocation, setCurrentLocation] = useState<any>({
    latitude: 9.0825,
    longitude: 76.4910,
  });
  const [distance, setDistance] = useState<any>(null);
  const [locationSelected, setlocationSelected] = useState(false);
  const [selectedVehcile, setselectedVehcile] = useState("Car");
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycling: null,
    transit: null,
  });
  const [keyboardAvoidingHeight, setkeyboardAvoidingHeight] = useState(false);
  const [driverLists, setdriverLists] = useState<any[]>([]);
  const [selectedDriver, setselectedDriver] = useState<any>();
  const [driverLoader, setdriverLoader] = useState(false); // Set to false to show mock data immediately
  const [marker, setMarker] = useState<any>(null);

  // Estimate arrival time helper - defined early so it's available for mock data generation
  const getEstimatedArrivalTime = (travelTime: any) => {
    const now = moment();
    let travelMinutes = 0;

    if (travelTime) {
      try {
        travelMinutes = parseDuration(travelTime);
        if (!isFinite(travelMinutes) || travelMinutes <= 0) travelMinutes = 0;
      } catch (e) {
        travelMinutes = 0;
      }
    }

    // If no explicit travel minutes available, estimate using distance (km)
    if ((!travelTime || travelMinutes === 0) && distance) {
      const avgSpeedKmh = 30; // 30 km/h average
      travelMinutes = Math.max(Math.round((distance / avgSpeedKmh) * 60), 5);
    }

    // Final fallback
    if (travelMinutes === 0) travelMinutes = 10;

    const arrivalTime = now.clone().add(travelMinutes, "minutes");
    return arrivalTime.format("hh:mm A");
  };

  // Mock drivers (shown when no live drivers available) - calculates distance dynamically
  const generateMockDrivers = () => {
    const baseDistance = distance ? Math.max(1, distance) : 2.5; // Use calculated distance or default
    const baseLat = currentLocation?.latitude || 9.0825;
    const baseLng = currentLocation?.longitude || 76.4910;
    return [
      {
        id: 1,
        name: "Rahul Kumar",
        car: "RideWave X",
        vehicle_type: "Bus",
        rate: "4",
        dropoffTime: getEstimatedArrivalTime(null),
        rating: 4.8,
        reviews: 342,
        distance: (baseDistance * 1.1).toFixed(1),
        driverDistance: (baseDistance * 0.3).toFixed(1),
        latitude: baseLat + 0.01,
        longitude: baseLng + 0.01,
        from: "Current Location",
        to: "Destination",
      },
      {
        id: 2,
        name: "Priya Sharma",
        car: "RideWave Pro",
        vehicle_type: "Bus",
        rate: "5",
        dropoffTime: getEstimatedArrivalTime(null),
        rating: 4.9,
        reviews: 521,
        distance: (baseDistance * 1.0).toFixed(1),
        driverDistance: (baseDistance * 0.2).toFixed(1),
        latitude: baseLat - 0.005,
        longitude: baseLng + 0.005,
        from: "Current Location",
        to: "Destination",
      },
      {
        id: 3,
        name: "Amit Patel",
        car: "RideWave Plus",
        vehicle_type: "Bus",
        rate: "6",
        dropoffTime: getEstimatedArrivalTime(null),
        rating: 4.7,
        reviews: 289,
        distance: (baseDistance * 1.3).toFixed(1),
        driverDistance: (baseDistance * 0.5).toFixed(1),
        latitude: baseLat + 0.008,
        longitude: baseLng - 0.008,
        from: "Current Location",
        to: "Destination",
      },
      {
        id: 4,
        name: "Neha Singh",
        car: "RideWave X",
        vehicle_type: "Car",
        rate: "4.8",
        dropoffTime: getEstimatedArrivalTime(null),
        rating: 4.6,
        reviews: 156,
        distance: (baseDistance * 1.2).toFixed(1),
        driverDistance: (baseDistance * 0.4).toFixed(1),
        latitude: baseLat - 0.003,
        longitude: baseLng - 0.003,
        from: "Current Location",
        to: "Destination",
      },
      {
        id: 5,
        name: "City Bus Service",
        car: "RideWave Bus",
        vehicle_type: "Bus",
        rate: "5",
        dropoffTime: getEstimatedArrivalTime(null),
        rating: 4.5,
        reviews: 1205,
        distance: (baseDistance * 0.8).toFixed(1),
        driverDistance: (baseDistance * 0.1).toFixed(1),
        latitude: baseLat + 0.002,
        longitude: baseLng + 0.002,
        from: "Current Location",
        to: "Destination",
      },
      {
        id: 6,
        name: "Express Bus",
        car: "RideWave Express",
        vehicle_type: "Bus",
        rate: "8",
        dropoffTime: getEstimatedArrivalTime(null),
        rating: 4.4,
        reviews: 892,
        distance: (baseDistance * 0.9).toFixed(1),
        driverDistance: (baseDistance * 0.15).toFixed(1),
        latitude: baseLat - 0.001,
        longitude: baseLng - 0.001,
        from: "Current Location",
        to: "Destination",
      },
    ];
  };
  
  const mockDrivers = generateMockDrivers();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const orderData = {
          currentLocation: notification.request.content.data.currentLocation,
          marker: notification.request.content.data.marker,
          distance: notification.request.content.data.distance,
          driver: notification.request.content.data.orderData,
        };
        router.push({
          pathname: "/(routes)/ride-details",
          params: { orderData: JSON.stringify(orderData) },
        });
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
    };
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show(
          "Location permission not granted. Using default location (Amrita School of Engineering, Amritapuri).",
          {
            type: "warning",
            placement: "bottom",
          }
        );
      }
      // Keep currentLocation as Amrita School of Engineering (default)
      // setCurrentLocation({ latitude, longitude }); // Removed to keep default
      // Region is already initialized to Amrita coordinates
    })();
  }, []);

  const initializeWebSocket = () => {
    const wsUrl = getWebSocketUrl();
    ws.current = new WebSocket(wsUrl);
    ws.current.onopen = () => {
      console.log("Connected to websocket server");
      setWsConnected(true);
    };

    // Centralize message handling so it is never overwritten later
    ws.current.onmessage = async (e: any) => {
      try {
        const message = JSON.parse(e.data);
        console.log("📨 Received WebSocket message:", message.type || "unknown");

        if (message.type === "nearbyDrivers") {
          await getDriversData(message.drivers);
        }

        if (message.type === "driverLocation") {
          console.log("LIVE DRIVER LOCATION", message);
          setdriverLists((prev: any[]) =>
            prev.map((d: any) =>
              d.id === message.driver
                ? { ...d, latitude: message.latitude, longitude: message.longitude }
                : d
            )
          );
        }

        if (message.type === "rideRequest") {
          console.log("New ride request received:", message);
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    ws.current.onerror = (e: any) => {
      console.log("WebSocket error:", e.message);
    };

    ws.current.onclose = (e: any) => {
      console.log("WebSocket closed:", e.code, e.reason);
      setWsConnected(false);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        initializeWebSocket();
      }, 5000);
    };
  };

  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Toast.show("Failed to get push token for push notification!", {
          type: "danger",
        });
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        Toast.show("Failed to get project id for push notification!", {
          type: "danger",
        });
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        // return pushTokenString;
      } catch (e: unknown) {
        Toast.show(`${e}`, {
          type: "danger",
        });
      }
    } else {
      Toast.show("Must use physical device for Push Notifications", {
        type: "danger",
      });
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  }

  const fetchPlaces = async (input: any) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
            language: "en",
          },
        }
      );
      setPlaces(response.data.predictions);
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 100), []);

  useEffect(() => {
    if (query.length > 2) {
      debouncedFetchPlaces(query);
    } else {
      setPlaces([]);
    }
  }, [query, debouncedFetchPlaces]);

  const handleInputChange = (text: any) => {
    setQuery(text);
  };

  const fetchTravelTimes = async (origin: any, destination: any) => {
    const modes = ["driving", "walking", "bicycling", "transit"];
    let travelTimes = {
      driving: null,
      walking: null,
      bicycling: null,
      transit: null,
    } as any;

    for (const mode of modes) {
      let params = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
        mode: mode,
      } as any;

      if (mode === "driving") {
        params.departure_time = "now";
      }

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json`,
          { params }
        );

        const elements = response.data.rows[0].elements[0];
        if (elements.status === "OK") {
          travelTimes[mode] = elements.duration.text;
        }
      } catch (error) {
        console.log(error);
      }
    }

    setTravelTimes(travelTimes);
  };

  const handlePlaceSelect = async (placeId: any) => {
    try {
      Keyboard.dismiss();
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );
      const { lat, lng } = response.data.result.geometry.location;

      const selectedDestination = { latitude: lat, longitude: lng };
      setRegion({
        ...region,
        latitude: lat,
        longitude: lng,
      });
      setMarker({
        latitude: lat,
        longitude: lng,
      });
      setQuery("");
      setPlaces([]);
      requestNearbyDrivers();
      setlocationSelected(true);
      setkeyboardAvoidingHeight(false);
      if (currentLocation) {
        await fetchTravelTimes(currentLocation, selectedDestination);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  };

  useEffect(() => {
    if (marker && currentLocation) {
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        marker.latitude,
        marker.longitude
      );
      setDistance(dist);
    }
  }, [marker, currentLocation]);

  const getNearbyDrivers = () => {
    // Removed: message handler is centralized in initializeWebSocket to avoid overwrites
  };

  const getDriversData = async (drivers: any) => {
    try {
      // Extract driver IDs from the drivers array
      const driverIds = drivers.map((driver: any) => driver.id).join(",");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/driver/get-drivers-data`,
        {
          params: { ids: driverIds },
        }
      );

      const driverData = response.data;
      setdriverLists(driverData);
      setdriverLoader(false);
    } catch (error) {
      console.log("Failed to load rides:", error);
      // Fallback to mock drivers on error
      setdriverLists(generateMockDrivers());
      setdriverLoader(false);
    }
  };

  const requestNearbyDrivers = () => {
    console.log(wsConnected);
    if (currentLocation && wsConnected) {
      ws.current.send(
        JSON.stringify({
          type: "requestRide",
          role: "user",
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        })
      );
    }
  };

  const sendPushNotification = async (expoPushToken: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Ride Request",
      body: "You have a new ride request.",
      data: { orderData: data },
    };

    await axios.post("https://exp.host/--/api/v2/push/send", message);
  };

  const handleOrder = async () => {
    const currentLocationName = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation?.latitude},${currentLocation?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
    );
    const destinationLocationName = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker?.latitude},${marker?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
    );

    const data = {
      user,
      currentLocation,
      marker,
      distance: distance.toFixed(2),
      currentLocationName:
        currentLocationName.data.results[0].formatted_address,
      destinationLocation:
        destinationLocationName.data.results[0].formatted_address,
    };
    const driverPushToken = "ExponentPushToken[v1e34ML-hnypD7MKQDDwaK]";

    await sendPushNotification(driverPushToken, JSON.stringify(data));
  };

  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View>
        <View
          style={{ height: windowHeight(!keyboardAvoidingHeight ? 500 : 300) }}
        >
          <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={(region) => setRegion(region)}
          >
            {/* Current location marker */}
            {currentLocation && <Marker coordinate={currentLocation} title="Your Location" />}
            
            {/* Destination marker */}
            {marker && <Marker coordinate={marker} title="Destination" />}
            
            {/* Mock driver markers */}
            {mockDrivers.map((d) => (
              <Marker
                key={d.id}
                coordinate={{ latitude: d.latitude, longitude: d.longitude }}
                title={d.from}
                description={`${d.from} → ${d.to}`}
                pinColor="#FF6B6B"
              />
            ))}
            
            {/* Straight line polyline (direct route highlight) - solid blue */}
            {currentLocation && marker && (
              <Polyline
                coordinates={[currentLocation, marker]}
                strokeColor="#2371F0"
                strokeWidth={4}
                geodesic={true}
              />
            )}
            
            {/* Detailed route with turn-by-turn directions */}
            {currentLocation && marker && (
              <MapViewDirections
                origin={currentLocation}
                destination={marker}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}
          </MapView>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={[styles.container]}>
          {locationSelected ? (
            <>
              {driverLoader ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    height: 400,
                  }}
                >
                  <ActivityIndicator size={"large"} />
                </View>
              ) : (
                <ScrollView
                  style={{
                    paddingBottom: windowHeight(20),
                    height: windowHeight(280),
                  }}
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {/* Header with Back Button */}
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#e0e0e0",
                      paddingBottom: windowHeight(10),
                      paddingHorizontal: windowWidth(15),
                      paddingTop: windowHeight(10),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Pressable 
                      onPress={() => {
                        Keyboard.dismiss();
                        setlocationSelected(false);
                      }}
                      style={{ padding: 5 }}
                    >
                      <LeftArrow />
                    </Pressable>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#000",
                        marginLeft: 10,
                      }}
                    >
                      Choose a Ride
                    </Text>
                  </View>

                  {/* Location Strip - Shows Current Location and Destination */}
                  <View
                    style={{
                      backgroundColor: "#f8f8f8",
                      paddingHorizontal: windowWidth(15),
                      paddingVertical: windowHeight(12),
                      marginVertical: windowHeight(8),
                      borderBottomWidth: 1,
                      borderBottomColor: "#e0e0e0",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#2371F0",
                          marginRight: 10,
                        }}
                      />
                      <Text style={{ fontSize: 13, color: "#555", fontWeight: "500" }}>
                        Current Location
                      </Text>
                      <Text style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>
                        {distance ? `${distance.toFixed(1)} km` : "Calculating..."}
                      </Text>
                    </View>

                    <View
                      style={{
                        height: 30,
                        marginLeft: 5,
                        borderLeftWidth: 2,
                        borderLeftColor: "#e0e0e0",
                        marginRight: 10,
                      }}
                    />

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#FF9500",
                          marginRight: 10,
                        }}
                      />
                      <Text style={{ fontSize: 13, color: "#555", fontWeight: "500" }}>
                        Destination
                      </Text>
                      <Text style={{ fontSize: 12, color: "#2371F0", marginLeft: "auto", fontWeight: "600" }}>
                        {distance ? `${distance.toFixed(1)} km away` : "Set destination"}
                      </Text>
                    </View>
                  </View>

                  {/* Available Rides Section */}
                  <View style={{ paddingHorizontal: windowWidth(15) }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#999", marginBottom: 12, marginTop: 4 }}>
                      {driverLists && driverLists.length > 0 ? "AVAILABLE RIDES" : "RECOMMENDED RIDES"}
                    </Text>

                    {driverLists && driverLists.length > 0 ? (
                      driverLists.map((driver: any) => (
                        <Pressable
                          key={`driver-${driver.id}`}
                          style={{
                            width: "100%",
                            borderRadius: 8,
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            marginBottom: 8,
                            backgroundColor: selectedVehcile === driver.vehicle_type ? "#E8F1FF" : "#fff",
                            borderWidth: selectedVehcile === driver.vehicle_type ? 2 : 1,
                            borderColor: selectedVehcile === driver.vehicle_type ? "#2371F0" : "#e0e0e0",
                          }}
                          onPress={() => {
                            setselectedVehcile(driver.vehicle_type);
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <Text style={{ fontSize: 28 }}>
                              {driver.vehicle_type === "Bus" ? "🚌" : "🚗"}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 15, fontWeight: "600", color: "#000" }}>
                                {driver.vehicle_type}
                              </Text>
                              <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                                {getEstimatedArrivalTime(travelTimes.driving)}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: "#2371F0" }}>
                              BDT {(distance.toFixed(2) * parseInt(driver.rate)).toFixed(2)}
                            </Text>
                          </View>
                        </Pressable>
                      ))
                    ) : (
                      // Render mock drivers when no live drivers available
                      mockDrivers.map((driver: any) => (
                        <Pressable
                          key={`mock-${driver.id}`}
                          style={{
                            width: "100%",
                            borderRadius: 12,
                            padding: 14,
                            marginBottom: 10,
                            backgroundColor: "#fff",
                            borderWidth: 1,
                            borderColor: "#e8e8e8",
                            elevation: 2,
                            shadowColor: "#000",
                            shadowOpacity: 0.08,
                            shadowRadius: 3,
                            shadowOffset: { width: 0, height: 1 },
                          }}
                          onPress={() => {
                            setselectedDriver(driver);
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                            {/* Vehicle Image */}
                            <View style={{ alignItems: "center" }}>
                              <Image
                                source={
                                  driver.vehicle_type === "Bus"
                                    ? require("@/assets/images/vehicles/bus.png")
                                    : require("@/assets/images/vehicles/car.png")
                                }
                                style={{ width: 70, height: 60 }}
                              />
                              <Text
                                style={{
                                  fontSize: 10,
                                  backgroundColor: driver.vehicle_type === "Bus" ? "#FF9500" : "#2371F0",
                                  color: "#fff",
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                  borderRadius: 4,
                                  marginTop: 6,
                                  fontWeight: "600",
                                  textAlign: "center",
                                }}
                              >
                                {driver.vehicle_type}
                              </Text>
                            </View>

                            {/* Driver Info - Middle Section */}
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <View>
                                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>
                                    {driver.car}
                                  </Text>
                                  <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                                    {driver.name}
                                  </Text>
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                  <Text style={{ fontSize: 18, fontWeight: "800", color: driver.vehicle_type === "Bus" ? "#FF9500" : "#2371F0" }}>
                                    ₹{parseInt(driver.rate) * parseInt(driver.distance)}
                                  </Text>
                                  <Text style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                                    ₹{driver.rate}/km
                                  </Text>
                                </View>
                              </View>

                              {/* ETA and Distance Row */}
                              <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                  <Text style={{ fontSize: 11, color: driver.vehicle_type === "Bus" ? "#FF9500" : "#2371F0", fontWeight: "600" }}>
                                    ⏱️
                                  </Text>
                                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#333" }}>
                                    {driver.dropoffTime}
                                  </Text>
                                </View>
                                <Text style={{ fontSize: 10, color: "#bbb" }}>•</Text>
                                <Text style={{ fontSize: 11, color: "#666" }}>
                                  {driver.driverDistance} km away
                                </Text>
                                <Text style={{ fontSize: 10, color: "#bbb" }}>•</Text>
                                <Text style={{ fontSize: 11, color: "#666" }}>
                                  {driver.distance} km ride
                                </Text>
                              </View>

                              {/* Rating and Reviews */}
                              <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Text style={{ fontSize: 12, fontWeight: "600", color: "#FFA500" }}>
                                  ⭐ {driver.rating}
                                </Text>
                                <Text style={{ fontSize: 11, color: "#999" }}>
                                  ({driver.reviews} reviews)
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Book Button - Full Width */}
                          <TouchableOpacity
                            style={{
                              marginTop: 12,
                              paddingVertical: 11,
                              backgroundColor: driver.vehicle_type === "Bus" ? "#FF9500" : "#2371F0",
                              borderRadius: 8,
                              alignItems: "center",
                              elevation: 3,
                              shadowColor: driver.vehicle_type === "Bus" ? "#FF9500" : "#2371F0",
                              shadowOpacity: 0.25,
                              shadowRadius: 4,
                              shadowOffset: { width: 0, height: 2 },
                            }}
                            onPress={() => {
                              setselectedDriver(driver);
                              Toast.show(
                                `Booking ${driver.car}... Tap Confirm below to complete`,
                                { type: "success", placement: "bottom", duration: 2000 }
                              );
                            }}
                          >
                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                              Book {driver.vehicle_type === "Bus" ? "Bus" : "Ride"}
                            </Text>
                          </TouchableOpacity>
                        </Pressable>
                      ))
                    )}

                    {/* Confirm Booking Button */}
                    <View style={{ marginTop: 16, marginBottom: 20 }}>
                      <Button
                        backgroundColor={selectedDriver ? (selectedDriver.vehicle_type === "Bus" ? "#FF9500" : "#2371F0") : "#000"}
                        textColor="#fff"
                        title={selectedDriver ? `Confirm ${selectedDriver.vehicle_type === "Bus" ? "Bus" : "Ride"} Booking` : "Confirm Booking"}
                        onPress={() => handleOrder()}
                      />
                    </View>
                  </View>
                </ScrollView>
              )}
            </>
          ) : (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => router.back()}>
                  <LeftArrow />
                </TouchableOpacity>
                <Text
                  style={{
                    margin: "auto",
                    fontSize: windowWidth(25),
                    fontWeight: "600",
                  }}
                >
                  Plan your ride
                </Text>
              </View>
              {/* picking up time */}
              <View
                style={{
                  width: windowWidth(200),
                  height: windowHeight(28),
                  borderRadius: 20,
                  backgroundColor: color.lightGray,
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: windowHeight(10),
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Clock />
                  <Text
                    style={{
                      fontSize: windowHeight(12),
                      fontWeight: "600",
                      paddingHorizontal: 8,
                    }}
                  >
                    Pick-up now
                  </Text>
                  <DownArrow />
                </View>
              </View>
              {/* picking up location */}
              <View
                style={{
                  borderWidth: 2,
                  borderColor: "#000",
                  borderRadius: 15,
                  marginBottom: windowHeight(15),
                  paddingHorizontal: windowWidth(15),
                  paddingVertical: windowHeight(5),
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <PickLocation />
                  <View
                    style={{
                      width: Dimensions.get("window").width * 1 - 110,
                      borderBottomWidth: 1,
                      borderBottomColor: "#999",
                      marginLeft: 5,
                      height: windowHeight(20),
                    }}
                  >
                    <Text
                      style={{
                        color: "#2371F0",
                        fontSize: 18,
                        paddingLeft: 5,
                      }}
                    >
                      Current Location
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 12,
                  }}
                >
                  <PlaceHolder />
                  <View
                    style={{
                      marginLeft: 5,
                      width: Dimensions.get("window").width * 1 - 110,
                    }}
                  >
                    <GooglePlacesAutocomplete
                      placeholder="Where to?"
                      onPress={(data, details = null) => {
                        setkeyboardAvoidingHeight(true);
                        setPlaces([
                          {
                            description: data.description,
                            place_id: data.place_id,
                          },
                        ]);
                      }}
                      query={{
                        key: `${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}`,
                        language: "en",
                      }}
                      styles={{
                        textInputContainer: {
                          width: "100%",
                        },
                        textInput: {
                          height: 38,
                          color: "#000",
                          fontSize: 16,
                        },
                        predefinedPlacesDescription: {
                          color: "#000",
                        },
                      }}
                      textInputProps={{
                        onChangeText: (text) => handleInputChange(text),
                        value: query,
                        onFocus: () => setkeyboardAvoidingHeight(true),
                      }}
                      onFail={(error) => console.log(error)}
                      fetchDetails={true}
                      debounce={200}
                    />
                  </View>
                </View>
              </View>
              {/* Last sessions */}
              {places.map((place: any, index: number) => (
                <Pressable
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: windowHeight(20),
                  }}
                  onPress={() => {
                    Keyboard.dismiss();
                    handlePlaceSelect(place.place_id);
                  }}
                >
                  <PickUpLocation />
                  <Text style={{ paddingLeft: 15, fontSize: 18 }}>
                    {place.description}
                  </Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}