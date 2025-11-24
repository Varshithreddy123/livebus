import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.whiteColor,
    height: windowHeight(25),
    borderRadius: windowHeight(18),
    marginTop: windowHeight(10),
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: windowWidth(12),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },

  textInputStyle: {
    ...commonStyles.regularText,
    ...external.ph_8,
    flexGrow: 1,
    fontSize: fontSizes.FONT18,
    color: color.primaryText,
  },

  calenderStyle: {
    height: "60%",
    width: windowWidth(1.5),
    backgroundColor: color.primaryGray,
    marginHorizontal: windowWidth(10),
    borderRadius: 10,
  },
});

export { styles };
