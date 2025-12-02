import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

type LocationPayload = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
};

type UseDriverLocationOptions = {
  autoStart?: boolean;
  distanceInterval?: number; // meters
  timeInterval?: number; // ms
  websocket?: WebSocket | null;
};

export default function useDriverLocation(options: UseDriverLocationOptions = {}) {
  const { autoStart = true, distanceInterval = 10, timeInterval = 5000, websocket = null } = options;
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const sendLocation = async (loc: Location.LocationObject) => {
    const payload: LocationPayload = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      altitude: loc.coords.altitude ?? null,
      accuracy: loc.coords.accuracy ?? null,
      heading: loc.coords.heading ?? null,
      speed: loc.coords.speed ?? null,
      timestamp: loc.timestamp,
    };

    try {
      if (websocket) {
        websocket.send(JSON.stringify({ type: "driver-location", payload }));
      } else {
        const token = await AsyncStorage.getItem("accessToken");
        await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/location`,
          payload,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
      }
    } catch (e) {
      console.log("useDriverLocation: failed to send location", e);
    }
  };

  const start = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission not granted");
        return;
      }

      // remove any previous subscription
      if (subRef.current) {
        subRef.current.remove();
        subRef.current = null;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval,
          timeInterval,
        },
        (loc) => {
          setLastLocation(loc);
          void sendLocation(loc);
        }
      );

      subRef.current = sub;
      setStarted(true);
      setError(null);
    } catch (e: any) {
      console.log("useDriverLocation.start error", e);
      setError(e?.message ?? "unknown error");
    }
  };

  const stop = () => {
    try {
      if (subRef.current) {
        subRef.current.remove();
        subRef.current = null;
      }
    } catch (e) {
      console.log("useDriverLocation.stop error", e);
    }
    setStarted(false);
  };

  useEffect(() => {
    if (autoStart) {
      void start();
    }

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { started, start, stop, lastLocation, error } as const;
}
