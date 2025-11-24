import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  transformLine: {
    transform: [{ rotate: "-90deg" }],
    height: windowHeight(50),
    width: windowWidth(120),
    position: "absolute",
    left: windowWidth(-50),
    top: windowHeight(-20),
  },

  countryCodeContainer: {
    width: windowWidth(70),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: "#FFF",
    justifyContent: "center",
    height: windowHeight(45),
  },

  phoneNumberInput: {
    width: windowWidth(320),
    height: windowHeight(45),
    backgroundColor: color.lightGray,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: windowWidth(12),
    borderWidth: 1,
    borderColor: color.border,
  },

  rememberMeText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT16,
    color: color.primaryText,
  },

  forgotPasswordText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT16,
    color: color.buttonBg,
  },

  newUserContainer: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.as_center,
    marginTop: windowHeight(12),
  },

  newUserText: {
    ...commonStyles.regularText,
    color: color.secondaryFont,
  },

  signUpText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.FONT16,
    paddingHorizontal: windowWidth(6),
    color: color.buttonBg,
  },

  rememberTextView: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    marginTop: windowHeight(6),
  },
});

export default styles;
