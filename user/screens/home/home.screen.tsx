import { View, Text, SafeAreaView, ScrollView } from "react-native";
import styles from "./styles";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import LocationSearchBar from "@/components/location/location.search.bar";
import color from "@/themes/app.colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RideCard from "@/components/ride/ride.card";
import { getApiBaseUrl } from "@/utils/apiConfig";
import { windowHeight } from "@/themes/app.constant";

export default function HomeScreen() {
  const [recentRides, setRecentRides] = useState([]);

  const getRecentRides = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const baseUrl = await getApiBaseUrl();

      const res = await axios.get(`${baseUrl}/get-rides`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setRecentRides(res.data.rides || []);
    } catch (error) {
      console.log("Failed to load rides:", error);
    }
  };

  useEffect(() => {
    getRecentRides();
  }, []);

  return (
    <SafeAreaView
      style={[
        commonStyles.flexContainer,
        { backgroundColor: color.whiteColor }
      ]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: windowHeight(30),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header section */}
        <View
          style={[
            external.p_5,
            external.ph_20,
            { paddingTop: windowHeight(20) }
          ]}
        >
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontSize: 26,
              letterSpacing: 0.5,
              color: color.titleText,
            }}
          >
            CHAKRAA
          </Text>

          <LocationSearchBar />
        </View>

        {/* Recent Rides */}
        <View style={{ paddingHorizontal: 14, marginTop: windowHeight(10) }}>
          <View style={[styles.rideContainer]}>
            <Text style={[styles.rideTitle, { color: color.primaryText }]}>
              Recent Rides
            </Text>

            {recentRides.length > 0 ? (
              recentRides.map((item: any, index: number) => (
                <RideCard item={item} key={index} />
              ))
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  color: color.secondaryFont,
                  paddingVertical: 10,
                }}
              >
                No rides found.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
