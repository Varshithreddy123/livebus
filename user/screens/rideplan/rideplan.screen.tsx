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
} from "react-native";
import styles from "./styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { external } from "@/styles/external.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker } from "react-native-maps";
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
import { DriverType } from "@/types/global";

export default function RidePlanScreen() {
  const { userData: user } = useGetUserData();
  const ws = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const notificationListener = useRef<any>();
  const wsRetryCount = useRef(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [places, setPlaces] = useState<any>([]);

  const [region, setRegion] = useState({
  latitude: 9.089993,
  longitude: 76.490429,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
});

  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [currentLocationName, setCurrentLocationName] = useState("Current Location");
  const [nearbyPlaces, setNearbyPlaces] = useState<any>([]);
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
  const [driverLists, setdriverLists] = useState([]);
  const [selectedDriver, setselectedDriver] = useState<DriverType>();
  const [driverLoader, setdriverLoader] = useState(true);

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
        Toast.show("Please approve location access!", { type: "danger" });
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      setCurrentLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });

      // ⭐ FIX: auto focus map AFTER setting region
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          600
        );
      }, 500);

      // ⭐ FIX: Safe reverse geocode
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
        );

        if (response?.data?.results?.length > 0) {
          setCurrentLocationName(
            response.data.results[0].formatted_address
          );
        } else {
          setCurrentLocationName("Current Location");
        }
      } catch (e) {
        setCurrentLocationName("Current Location");
      }
    })();
  }, []);

  const initializeWebSocket = async () => {
    // Helper to determine a bootstrap host to contact backend
    const getBootstrapHost = (): string => {
      const isAndroidEmulator = Platform.OS === "android" && !Device.isDevice;
      if (isAndroidEmulator) return "10.0.2.2"; // Android emulator -> host loopback
      const extras = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifest?.extra || {};
      if (extras?.WS_HOST) return extras.WS_HOST;
      const hostUri = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost || "";
      if (hostUri) {
        const host = hostUri.split(":")[0];
        return host;
      }
      return "localhost";
    };

    try {
      const bootstrapHost = getBootstrapHost();
      // Query server for its current LAN IP
      const res = await axios.get(`http://${bootstrapHost}:8080/api/v1/server-ip`);
      const serverIp = res.data?.ip || bootstrapHost;

      // Detect device type
      const isAndroidEmulator = Platform.OS === "android" && !Device.isDevice;

      const finalIp = isAndroidEmulator ? "10.0.2.2" : serverIp;
      const wsUrl = isAndroidEmulator ? `ws://${finalIp}:8080` : "ws://10.113.22.129:8080";

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected:", wsUrl);
        setWsConnected(true);
        wsRetryCount.current = 0; // Reset retry count on successful connection
      };

      ws.current.onerror = (err: any) => {
        console.log("WebSocket error:", err.message);
      };

      ws.current.onclose = () => {
        console.log("WebSocket closed — reconnecting...");
        setWsConnected(false);
        if (wsRetryCount.current < 5) {
          wsRetryCount.current += 1;
          setTimeout(() => initializeWebSocket(), 4000);
        } else {
          console.log("WebSocket reconnection limit reached");
        }
      };

      ws.current.onmessage = async (e: any) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "nearbyDrivers") {
            await getDriversData(msg.drivers);
          }
        } catch (error: any) {
          console.log("WebSocket parse error:", error);
        }
      };
    } catch (e: any) {
      console.log("Error fetching server IP:", e);
    }
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



  const fetchTravelTimes = async (origin: any, destination: any) => {
    const modes = ["driving", "walking", "bicycling", "transit"];
    let travelTimes = {
      driving: null,
      walking: null,
      bicycling: null,
      transit: null,
    } as any;

    for (const mode of modes) {
    try {
      const payload = {
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude
            }
          }
        },
        travelMode: mode === "bicycling" ? "BICYCLE" : mode.toUpperCase()
      };
      const headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
        "X-Goog-FieldMask": "routes.duration"
      };
      const response = await axios.post(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        payload,
        { headers }
      );

      if (!response.data.routes || !response.data.routes[0]) continue;
      const duration = response.data.routes[0].duration;
      const seconds = parseInt(duration.seconds);
      const minutes = Math.ceil(seconds / 60);
      travelTimes[mode] = `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } catch (error) {
      console.log("Travel time fetch error:", error);
    }
    }

    setTravelTimes(travelTimes);
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

  const getEstimatedArrivalTime = (travelTime: any) => {
    const now = moment();
    const travelMinutes = parseDuration(travelTime);
    const arrivalTime = now.add(travelMinutes, "minutes");
    return arrivalTime.format("hh:mm A");
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
    ws.current.onmessage = async (e: any) => {
      try {
        const message = JSON.parse(e.data);
        if (message.type === "nearbyDrivers") {
          await getDriversData(message.drivers);
        }
      } catch (error) {
        console.log(error, "Error parsing websocket");
      }
    };
  };

  const getDriversData = async (drivers: any) => {
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
      getNearbyDrivers();
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

  const handleSelectPlace = (lat: number, lng: number) => {
    setMarker({ latitude: lat, longitude: lng });
    setRegion({ ...region, latitude: lat, longitude: lng });

    setlocationSelected(true);
    requestNearbyDrivers();

    if (currentLocation) {
      fetchTravelTimes(currentLocation, { latitude: lat, longitude: lng });
    }
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
      >
      <View>
        <View
          style={{ height:!keyboardAvoidingHeight ? 500 : 300}}
        >
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            region={region}
            showsUserLocation={true}
            followsUserLocation={true}
            onMapReady={() => {
              if (currentLocation) {
                mapRef.current?.animateToRegion(
                  {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                  },
                  800
                );
              }
            }}
            onRegionChangeComplete={(region) => setRegion(region)}
            provider={undefined}
          >
            {marker && <Marker coordinate={marker} />}
            {currentLocation && <Marker coordinate={currentLocation} />}
            {currentLocation && marker ? (
              <MapViewDirections
                origin={currentLocation}
                destination={marker}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                strokeWidth={4}
                strokeColor="blue"
                mode="DRIVING"
                resetOnChange={false}
                onError={(err) => console.log("Directions error", err)}
              />
            ) : null}
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
                >
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#b5b5b5",
                      paddingBottom: windowHeight(10),
                      flexDirection: "row",
                    }}
                  >
                    <Pressable onPress={() => setlocationSelected(false)}>
                      <LeftArrow />
                    </Pressable>
                    <Text
                      style={{
                        margin: "auto",
                        fontSize: 20,
                        fontWeight: "600",
                      }}
                    >
                      Gathering options
                    </Text>
                  </View>
                  <View style={{ padding: windowWidth(10) }}>
                    {driverLists?.map((driver: DriverType) => (
                      <Pressable
                        style={{
                          width: windowWidth(420),
                          borderWidth:
                            selectedVehcile === driver.vehicle_type ? 2 : 0,
                          borderRadius: 10,
                          padding: 10,
                          marginVertical: 5,
                        }}
                        onPress={() => {
                          setselectedVehcile(driver.vehicle_type);
                        }}
                      >
                        <View style={{ margin: "auto" }}>
                          <Image
                            source={
                              driver?.vehicle_type === "Car"
                                ? require("@/assets/images/vehicles/car.png")
                                : driver?.vehicle_type === "Motorcycle"
                                ? require("@/assets/images/vehicles/bike.png")
                                : require("@/assets/images/vehicles/bike.png")
                            }
                            style={{ width: 90, height: 80 }}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <View>
                            <Text style={{ fontSize: 20, fontWeight: "600" }}>
                        Chakraa {driver?.vehicle_type}
                            </Text>
                            <Text style={{ fontSize: 16 }}>
                              {getEstimatedArrivalTime(travelTimes.driving)}{" "}
                              dropoff
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: windowWidth(20),
                              fontWeight: "600",
                            }}
                          >
                            IND{" "}
                            {(
                              distance.toFixed(2) * parseInt(driver.rate)
                            ).toFixed(2)}
                          </Text>
                        </View>
                      </Pressable>
                    ))}

                    <View
                      style={{
                        paddingHorizontal: windowWidth(10),
                        marginTop: windowHeight(15),
                      }}
                    >
                      <Button
                        backgroundColor={"#000"}
                        textColor="#fff"
                        title={`Confirm Booking`}
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
                  paddingVertical: windowHeight(8),
                  overflow: "visible",
                }}
              >
                {/* CURRENT LOCATION */}
                <View style={{ flexDirection: "row", marginBottom: 12 }}>
                  <PickLocation />
                  <View
                    style={{
                      width: Dimensions.get("window").width - 110,
                      borderBottomWidth: 1,
                      borderBottomColor: "#999",
                      marginLeft: 5,
                      paddingBottom: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: "#2371F0",
                        fontSize: 18,
                        paddingLeft: 5,
                      }}
                    >
                      {currentLocationName}
                    </Text>
                  </View>
                </View>

                {/* GOOGLE AUTOCOMPLETE */}
                <GooglePlacesAutocomplete
                  placeholder="Where to?"
                  fetchDetails
                  enablePoweredByContainer={false}
                  currentLocation
                  currentLocationLabel="📍 Use my current location"
                  query={{
                    key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                    language: "en",
                  }}
                  onPress={(data, details) => {
                    // Handle "Use my current location"
                    if (data.description === "📍 Use my current location") {
                      if (currentLocation) {
                        handleSelectPlace(currentLocation.latitude, currentLocation.longitude);
                      }
                      return;
                    }

                    // Handle normal place selection
                    if (details) {
                      handleSelectPlace(
                        details.geometry.location.lat,
                        details.geometry.location.lng
                      );
                    }
                  }}
                  styles={{
                    container: {
                      flex: 0,
                    },
                    textInput: {
                      height: 45,
                      fontSize: 16,
                      color: "#000",
                      borderWidth: 0,
                      backgroundColor: "#fff",
                      paddingHorizontal: 10,
                      borderRadius: 8,
                    },
                    listView: {
                      maxHeight: 200,
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      marginTop: 5,
                      elevation: 1000,
                      zIndex: 1000,
                    },
                  }}
                />
              </View>

            </>
          )}
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
