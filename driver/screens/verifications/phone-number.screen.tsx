import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import SignInText from "@/components/login/signin.text";
import Button from "@/components/common/button";
import { external } from "@/styles/external.style";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import color from "@/themes/app.colors";
import OTPTextInput from "react-native-otp-textinput";
import { style } from "./style";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PhoneNumberVerificationScreen() {
  const driver = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = async () => {
    console.log("=== DRIVER OTP VERIFICATION START ===");
    console.log("OTP entered:", otp);
    console.log("Driver phone number:", driver.phone_number);

    if (otp === "") {
      console.log("Validation failed: Empty OTP");
      Toast.show("Please fill the fields!", {
        placement: "bottom",
      });
      console.log("=== DRIVER OTP VERIFICATION END (VALIDATION FAILED) ===");
      return;
    }

    setLoader(true);
    console.log("Loading state set to true");

    const requestPayload = {
      phone_number: driver.phone_number,
      otp: otp,
    };
    console.log("Request payload:", requestPayload);
    console.log("API endpoint:", `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/login`);

    try {
      console.log("Making axios POST request for driver login...");
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/login`,
        requestPayload
      );

      console.log("Axios request successful");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      setLoader(false);
      console.log("Loading state set to false");

      if (response.data.accessToken) {
        console.log("Access token received, saving to AsyncStorage...");
        await AsyncStorage.setItem("accessToken", response.data.accessToken);
        console.log("Access token saved successfully");

        console.log("Navigating to driver home screen...");
        router.replace("/(tabs)/home");
        console.log("=== DRIVER OTP VERIFICATION END (SUCCESS) ===");
      } else {
        console.log("No access token in response");
        Toast.show("Login failed - no access token received", {
          placement: "bottom",
          type: "danger",
        });
      }
    } catch (error: any) {
      console.log("=== DRIVER OTP VERIFICATION ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error response:", error.response);
      console.error("Error response status:", error.response?.status);
      console.error("Error response data:", error.response?.data);
      console.error("Error request:", error.request);

      setLoader(false);
      console.log("Loading state set to false");

      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          "Network error occurred";

      console.log("Displaying error toast:", errorMessage);
      Toast.show(errorMessage, {
        placement: "bottom",
        type: "danger",
      });

      console.log("=== DRIVER OTP VERIFICATION END (ERROR) ===");
    }
  };
  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"Phone Number Verification"}
            subtitle={"Check your phone number for the otp!"}
          />
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={4}
            textInputStyle={style.otpTextInput}
            tintColor={color.subtitle}
            autoFocus={false}
          />
          <View style={[external.mt_30]}>
            <Button
              title="Verify"
              height={windowHeight(30)}
              onPress={() => handleSubmit()}
              disabled={loader}
              loading={loader}
            />
          </View>
          <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                {
                  flexDirection: "row",
                  gap: 5,
                  justifyContent: "center",
                },
              ]}
            >
              <Text style={[commonStyles.regularText]}>Not Received yet?</Text>
              <TouchableOpacity>
                <Text style={[style.signUpText, { color: "#000" }]}>
                  Resend it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}
