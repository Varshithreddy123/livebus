import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import styles from "./styles";
import Images from "@/utils/images";
import SignInText from "@/components/login/signin.text";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { router } from "expo-router";
import PhoneNumberInput from "@/components/login/phone-number.input";
import { Toast } from "react-native-toast-notifications";
import axios from "axios";
 
export default function LoginScreen() {
  const [phone_number, setphone_number] = useState("");
  const [loading, setloading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");

  const handleSubmit = async () => {
    console.log("=== DRIVER LOGIN SUBMIT START ===");
    console.log("Phone number input:", phone_number);
    console.log("Country code input:", countryCode);

    if (phone_number === "" || countryCode === "") {
      console.log("Validation failed: Empty fields");
      Toast.show("Please fill the fields!", {
        placement: "bottom",
      });
      console.log("=== DRIVER LOGIN SUBMIT END (VALIDATION FAILED) ===");
      return;
    }

    const phoneNumber = `${countryCode}${phone_number}`;
    console.log("Combined phone number:", phoneNumber);
    console.log("Server URI:", process.env.EXPO_PUBLIC_SERVER_URI);
    console.log("Full API endpoint:", `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/send-otp`);

    setloading(true);
    console.log("Loading state set to true");

    const requestPayload = { phone_number: phoneNumber };
    console.log("Request payload:", requestPayload);

    try {
      console.log("Making axios POST request...");
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/send-otp`,
        requestPayload
      );

      console.log("Axios request successful");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      setloading(false);
      console.log("Loading state set to false");

      const driver = {
        phone_number: phoneNumber,
      };
      console.log("Navigating to phone verification screen with params:", driver);
      router.push({
        pathname: "/(routes)/verification-phone-number",
        params: driver,
      });

      console.log("=== DRIVER LOGIN SUBMIT END (SUCCESS) ===");
    } catch (error: any) {
      console.log("=== AXIOS ERROR CAUGHT ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error response:", error.response);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error request:", error.request);

      setloading(false);
      console.log("Loading state set to false");

      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          "Network error occurred";

      console.log("Displaying error toast:", errorMessage);
      Toast.show(errorMessage, {
        type: "danger",
        placement: "bottom",
      });

      console.log("=== DRIVER LOGIN SUBMIT END (ERROR) ===");
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(150)}
      imageShow={true}
      container={
        <View>
          <View>
            <View>
              <Image style={styles.transformLine} source={Images.line} />
              <SignInText />
              <View style={[external.mt_25, external.Pb_10]}>
                <PhoneNumberInput
                  phone_number={phone_number}
                  setphone_number={setphone_number}
                  countryCode={countryCode}
                  setCountryCode={setCountryCode}
                />
                <View style={[external.mt_25, external.Pb_15]}>
                  <Button
                    title="Get Otp"
                    disabled={loading}
                    height={windowHeight(35)}
                    onPress={() => handleSubmit()}
                    loading={loading}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: windowWidth(8),
                    paddingBottom: windowHeight(15),
                  }}
                >
                  <Text style={{ fontSize: windowHeight(12) }}>
                    Don't have any rider account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(routes)/signup")}
                  >
                    <Text style={{ color: "blue", fontSize: windowHeight(12) }}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      }
    />
  );
}
