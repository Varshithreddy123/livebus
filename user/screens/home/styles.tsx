import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  /** Main screen wrapper */
  container: {
    paddingTop: windowHeight(24),
  },

  /** Background layer for ride history section */
  containerStyle: {
    backgroundColor: color.lightGray,
    ...external.Pb_30,
  },

  /** Ride card wrapper */
  rideContainer: {
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(4),
    paddingBottom: windowHeight(6),
  },

  /** Ride section title */
  rideTitle: {
    marginVertical: windowHeight(8),
    fontSize: fontSizes.FONT25,
    fontFamily: fonts.medium,
    color: color.primaryText,
  },
});

export default styles;
