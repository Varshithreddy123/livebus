import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import fonts from "../../../themes/app.fonts";
import color from "../../../themes/app.colors";
import Images from "../../../utils/images";
import { windowHeight, windowWidth } from "../../../themes/app.constant";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const UserServiceMap: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [destination, setDestination] = useState<LocationCoords | null>(null);
  const [initialRegion, setInitialRegion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<"start" | "end" | null>(null);
  const mapRef = useRef<MapView>(null);

  // Request permission and get current location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required.");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentLocation(coords);
        setInitialRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to fetch your location.");
      }
    })();
  }, []);

  // Fetch results from OpenStreetMap (free)
  const searchPlaces = async (query: string) => {
    if (!query) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectPlace = (item: any) => {
    const coords = {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
    if (searchType === "start") {
      setCurrentLocation(coords);
      setInitialRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else if (searchType === "end") {
      setDestination(coords);
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleMapPress = (event: any) => {
    setDestination(event.nativeEvent.coordinate);
  };

  useEffect(() => {
    if (currentLocation && destination && mapRef.current) {
      mapRef.current.fitToCoordinates([currentLocation, destination], {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  }, [destination]);

  if (!initialRegion) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const polylineCoordinates = currentLocation && destination ? [currentLocation, destination] : [];

  return (
    <View style={styles.container}>
      {/* POIPINS Heading */}
      <View style={styles.header}>
        <Image
          source={Images.logo}
          style={{
            width: windowWidth(120),
            height: windowHeight(30),
            resizeMode: "contain",
          }}
        />
      </View>

      {/* 🔍 Search Section */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search current location..."
          style={styles.input}
          value={searchType === "start" ? searchQuery : ""}
          onFocus={() => setSearchType("start")}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchPlaces(text);
          }}
        />
        <TextInput
          placeholder="Search destination..."
          style={styles.input}
          value={searchType === "end" ? searchQuery : ""}
          onFocus={() => setSearchType("end")}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchPlaces(text);
          }}
        />

        {searchResults.length > 0 && (
          <FlatList
            style={styles.resultsList}
            data={searchResults}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectPlace(item)} style={styles.resultItem}>
                <Text numberOfLines={1}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* 🗺️ Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        onPress={handleMapPress}
      >
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Current Location" pinColor="blue" />
        )}
        {destination && <Marker coordinate={destination} title="Destination" pinColor="red" />}
        {polylineCoordinates.length > 1 && (
          <Polyline coordinates={polylineCoordinates} strokeColor="#007AFF" strokeWidth={4} />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: color.buttonBg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 20,
    elevation: 10,
  },
  headerText: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: color.whiteColor,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    position: "absolute",
    top: 80,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    zIndex: 10,
    elevation: 5,
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 8,
  },
  resultsList: {
    backgroundColor: "#fff",
    maxHeight: 150,
    borderRadius: 8,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default UserServiceMap;
