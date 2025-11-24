import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import color from "@/themes/app.colors";
import Images from "@/utils/images";
import { Gps, Location, Star } from "@/utils/icons";

export default function RideCard({ item }: { item: any }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: "#F7F9FC" }]}>
      {/* Header Section */}
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <View style={styles.rowBetween}>
          {/* Profile */}
          <View style={styles.rowCenter}>
            <Image source={Images.user} style={styles.avatar} />
            <Text style={[styles.name, { color: colors.text }]}>
              {item?.driver?.name}
            </Text>
          </View>

          {/* Rating & Price */}
          <View style={styles.rowCenter}>
            <Star />
            <Text style={[styles.rating, { color: colors.text }]}>5.0</Text>
            <View style={[styles.divider, { borderColor: colors.border }]} />
            <Text style={styles.price}>INR {item.charge}</Text>
          </View>
        </View>

        <View style={[styles.rowBetween, { marginTop: 6 }]}>
          <Text style={styles.date}>{item.cratedAt?.slice(0, 10)}</Text>
          <View style={styles.rowCenter}>
            <Location color={colors.text} />
            <Text style={[styles.distance, { color: colors.text }]}>
              {item.distance} km
            </Text>
          </View>
        </View>
      </View>

      {/* Route Section */}
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <View style={styles.routeRow}>
          {/* Icons */}
          <View style={styles.routeIcons}>
            <Location color={colors.text} />
            <View style={styles.routeConnector} />
            <Gps color={colors.text} />
          </View>

          {/* Addresses */}
          <View style={styles.routeText}>
            <Text style={[styles.address, { color: colors.text }]}>
              {item.currentLocationName}
            </Text>
            <Text style={[styles.address, { color: colors.text, marginTop: 12 }]}>
              {item.destinationLocationName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --------------------- STYLES ------------------------

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 12,
    padding: windowWidth(10),
    marginBottom: windowHeight(12),
    elevation: 2,
  },

  section: {
    borderRadius: 10,
    paddingVertical: windowHeight(6),
    paddingHorizontal: windowWidth(8),
    marginBottom: windowHeight(6),
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    height: windowHeight(40),
    width: windowWidth(40),
    resizeMode: "cover",
    borderRadius: 50,
  },

  name: {
    marginLeft: 8,
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT20,
  },

  rating: {
    marginHorizontal: 6,
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT18,
  },

  divider: {
    borderLeftWidth: 1,
    height: windowHeight(18),
    marginHorizontal: 8,
  },

  price: {
    color: color.primaryText,
    fontFamily: fonts.bold,
    fontSize: fontSizes.FONT20,
  },

  date: {
    color: "#666",
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT16,
  },

  distance: {
    marginLeft: 6,
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT16,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 4,
  },

  routeIcons: {
    alignItems: "center",
    width: 30,
  },

  routeConnector: {
    borderLeftWidth: 1,
    borderColor: "#aaa",
    height: windowHeight(23),
    marginVertical: 3,
  },

  routeText: {
    flex: 1,
    paddingLeft: 6,
  },

  address: {
    fontSize: fontSizes.FONT18,
    fontFamily: fonts.regular,
    lineHeight: 22,
  },
});
