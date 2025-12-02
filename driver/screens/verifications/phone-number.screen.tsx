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

  const handleResendOtp = async () => {
    console.log("=== DRIVER RESEND OTP START ===");
    console.log("Resending OTP to:", driver.phone_number);

    if (!driver.phone_number) {
      Toast.show("Phone number not found. Please go back and try again.", {
        placement: "bottom",
        type: "warning",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/send-otp`,
        {
          phone_number: driver.phone_number,
        }
      );

      console.log("Resend OTP response:", response.data);
      
      if (response.data.success) {
        Toast.show("OTP resent successfully!", {
          placement: "bottom",
          type: "success",
        });
        console.log("=== DRIVER RESEND OTP END (SUCCESS) ===");
      } else {
        Toast.show(response.data.message || "Failed to resend OTP", {
          placement: "bottom",
          type: "danger",
        });
      }
    } catch (error: any) {
      console.error("=== DRIVER RESEND OTP ERROR ===");
      console.error("Error:", error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to resend OTP. Please try again.";
      
      Toast.show(errorMessage, {
        placement: "bottom",
        type: "danger",
      });
      console.log("=== DRIVER RESEND OTP END (ERROR) ===");
    }
  };

  const handleSubmit = async () => {
    console.log("=== DRIVER OTP VERIFICATION START ===");
    console.log("OTP entered:", otp);
    console.log("Driver phone number:", driver.phone_number);
    console.log("Driver params:", driver);

    // Validate OTP (Twilio OTPs are typically 4-6 digits)
    if (otp === "" || otp.length < 4 || otp.length > 6) {
      console.log("Validation failed: Empty or invalid OTP");
      Toast.show("Please enter a valid OTP (4-6 digits)!", {
        placement: "bottom",
        type: "warning",
      });
      console.log("=== DRIVER OTP VERIFICATION END (VALIDATION FAILED) ===");
      return;
    }

    // Check if this is registration or login flow
    const isRegistration = driver.isRegistration === "true" || driver.name || driver.email;
    const endpoint = isRegistration 
      ? `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/verify-otp`
      : `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/login`;

    console.log("Flow type:", isRegistration ? "REGISTRATION" : "LOGIN");
    console.log("API endpoint:", endpoint);

    setLoader(true);
    console.log("Loading state set to true");

    // Prepare request payload based on flow type
    const requestPayload = isRegistration
      ? {
          phone_number: driver.phone_number,
          otp: otp,
          name: driver.name,
          country: driver.country_label || driver.country || "India",
          email: driver.email,
          vehicle_type: driver.vehicle_type,
          registration_number: driver.registration_number,
          registration_date: driver.registration_date,
          driving_license: driver.driving_license,
          vehicle_color: driver.vehicle_color,
          rate: driver.rate ? parseFloat(driver.rate as string) : null,
        }
      : {
          phone_number: driver.phone_number,
          otp: otp,
        };

    console.log("Request payload:", requestPayload);

    try {
      console.log(`Making axios POST request for driver ${isRegistration ? "registration" : "login"}...`);
      const response = await axios.post(endpoint, requestPayload);

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

      // Extract specific error message
      let errorMessage = "An error occurred. Please try again.";
      
      if (error.response?.data) {
        // Use API error message if available
        errorMessage = error.response.data.message || 
                      error.response.data.error || 
                      errorMessage;
        
        // Handle specific error types
        if (error.response.data.error === "DATABASE_CONNECTION_ERROR") {
          errorMessage = "Database connection error. Please contact support.";
        } else if (error.response.data.error === "OTP_ALREADY_USED") {
          errorMessage = "This OTP has already been used. Please request a new one.";
        } else if (error.response.data.error === "INVALID_PHONE_NUMBER") {
          errorMessage = "Invalid phone number format. Please try again.";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Invalid OTP. Please check and try again.";
        } else if (error.response.status === 403) {
          errorMessage = "Driver not found. Please register first.";
        } else if (error.response.status === 503) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      console.log("Displaying error toast:", errorMessage);
      Toast.show(errorMessage, {
        placement: "bottom",
        type: "danger",
        duration: 4000, // Show for 4 seconds
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
              <TouchableOpacity onPress={handleResendOtp}>
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
