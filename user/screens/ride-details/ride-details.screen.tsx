import { View, Text, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import color from "@/themes/app.colors";
import Constants from "expo-constants";

export default function RideDetailsScreen() {
  const { orderData: orderDataObj } = useLocalSearchParams() as any;

  // 🔥 SAFE PARSER (NO MORE CRASHES)
  let orderData: any = {};
  try {
    if (typeof orderDataObj === "string" && orderDataObj.trim() !== "") {
      orderData = JSON.parse(orderDataObj);
    } else {
      orderData = orderDataObj; 
    }
  } catch (err) {
    console.log("Failed to parse orderData:", orderDataObj);
    orderData = {};
  }

  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // 🔥 FIX region calculation (your actual payload uses currentLocation + marker)
  useEffect(() => {
    if (orderData?.currentLocation && orderData?.marker) {
      const { currentLocation, marker } = orderData;

      const latitudeDelta =
        Math.abs(marker.latitude - currentLocation.latitude) * 2;
      const longitudeDelta =
        Math.abs(marker.longitude - currentLocation.longitude) * 2;

      setRegion({
        latitude: (marker.latitude + currentLocation.latitude) / 2,
        longitude: (marker.longitude + currentLocation.longitude) / 2,
        latitudeDelta: Math.max(latitudeDelta, 0.0922),
        longitudeDelta: Math.max(longitudeDelta, 0.0421),
      });
    }
  }, [orderData]);

  return (
    <View>
      <View style={{ height: windowHeight(450) }}>
        <MapView
          style={{ flex: 1 }}
          region={region}
          onRegionChangeComplete={(region) => setRegion(region)}
          provider={MapView.PROVIDER_GOOGLE}
        >
          {orderData?.marker && (
            <Marker coordinate={orderData?.marker} />
          )}
          {orderData?.currentLocation && (
            <Marker coordinate={orderData?.currentLocation} />
          )}
          {orderData?.currentLocation && orderData?.marker && (
            <MapViewDirections
              origin={orderData?.currentLocation}
              destination={orderData?.marker}
              apikey={
                process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY ||
                (Constants?.expoConfig as any)?.android?.config?.googleMaps?.apiKey ||
                ""
              }
              strokeWidth={4}
              strokeColor="blue"
            />
          )}
        </MapView>
      </View>

      <View style={{ padding: windowWidth(20) }}>
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Driver Name: {orderData?.driver?.name ?? "Unknown"}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
          >
            Phone Number:
          </Text>

          <Text
            style={{
              color: color.buttonBg,
              paddingLeft: 5,
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
            onPress={() =>
              orderData?.driver?.phone_number &&
              Linking.openURL(`tel:${orderData?.driver?.phone_number}`)
            }
          >
            {orderData?.driver?.phone_number ?? "N/A"}
          </Text>
        </View>

        <Text style={{ fontSize: fontSizes.FONT20, fontWeight: "500" }}>
          {orderData?.driver?.vehicle_type ?? "Vehicle"} Color:{" "}
          {orderData?.driver?.vehicle_color ?? "Unknown"}
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Payable amount:{" "}
          {orderData?.driver?.rate && orderData?.distance
            ? (orderData.distance * parseInt(orderData.driver.rate)).toFixed(2)
            : "0.00"}{" "}
          IND
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT14,
            fontWeight: "400",
            paddingVertical: windowHeight(5),
          }}
        >
          **Pay to your driver after reaching your destination
        </Text>
      </View>
    </View>
  );
}
