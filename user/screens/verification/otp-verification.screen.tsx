import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import AuthContainer from "@/utils/container/auth-container";
import SignInText from "@/components/login/signin.text";
import { windowHeight } from "@/themes/app.constant";
import OTPTextInput from "react-native-otp-textinput";
import { style } from "./style";
import { external } from "@/styles/external.style";
import { router, useLocalSearchParams } from "expo-router";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { commonStyles } from "@/styles/common.style";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create a custom axios instance with proper configuration
const api = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export default function OtpverificationScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    console.log("OTP Screen received phone number:", phoneNumber);
  }, [phoneNumber]);

  // --- 2️⃣ Verify OTP Logic ---
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.show('Please enter a valid 6-digit OTP', { placement: "bottom" });
      return;
    }

    if (!phoneNumber) {
      console.error("Phone number is missing for OTP verification");
      toast.show('Phone number is missing. Please go back and try again.', { placement: "bottom" });
      return;
    }

    try {
      setLoading(true);
      console.log("Verifying OTP:", otp, "for phone:", phoneNumber);
      console.log("API URL:", `${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/verify-otp`);

      // Log the request payload for debugging
      const payload = {
        otp: otp,
        phone_number: phoneNumber,
      };
      console.log("Verification payload:", payload);

      const response = await api.post(`${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/verify-otp`, payload);

      console.log("OTP Verification Response:", response.data);

     // Fixed OTP verification logic
if (response.data && response.data.user) {
  // Save user data to AsyncStorage for all users
  try {
    await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    console.log("User data saved to AsyncStorage:", response.data.user);
  } catch (storageError) {
    console.error("Failed to save user data to AsyncStorage:", storageError);
  }

  // Check if user is new or existing
  if (response.data.isNewUser) {
    // New user needs to complete registration
    router.push({
      pathname: "/registration",
      params: { userId: response.data.user.id }
    });
  } else {
    // Existing user, go to home
    toast.show('Account verified successfully', { placement: "bottom" });
    router.replace({ pathname: "/(tabs)/home" });
  }
} else {
  // Handle case where verification failed
  console.error("Verification failed:", response.data);
  toast.show(response.data.message || 'Invalid OTP. Please try again.', { placement: "bottom" });
}

    } catch (error: any) {
      console.error("Verify Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        toast.show(error.response.data?.message || 'Invalid OTP. Please try again.', { placement: "bottom" });
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.show('Network error. Please check your connection and try again.', { placement: "bottom" });
      } else {
        console.error("Error message:", error.message);
        toast.show('Error verifying OTP. Please try again.', { placement: "bottom" });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3️⃣ Resend OTP Logic ---
  const handleResendOTP = async () => {
    if (!phoneNumber) {
      toast.show('Phone number is missing', { placement: "bottom" });
      return;
    }

    try {
      setLoading(true);
      console.log("Resending OTP to:", phoneNumber);
      const response = await api.post(`${process.env.EXPO_PUBLIC_SERVER_URI}/api/v1/resend-otp`, {
        phone_number: phoneNumber,
      });
      console.log("OTP Resent:", response.data);
      toast.show('OTP resent successfully', { placement: "bottom" });
    } catch (error: any) {
      console.error("Resend Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      toast.show('Failed to resend OTP. Please try again.', { placement: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"Otp Verification"}
            subtitle={`We’ve sent an OTP to ${phoneNumber}`}
          />

          {/* --- OTP Input --- */}
          <OTPTextInput
            handleTextChange={(code) => {
              console.log("OTP entered:", code);
              setOtp(code);
            }}
            inputCount={6}
            textInputStyle={style.otpTextInput}
            tintColor={color.subtitle}
            autoFocus
          />

          {/* --- Verify Button --- */}
          <View style={[external.mt_30]}>
            <Button
              title={loading ? "Please wait..." : "Verify OTP"}
              onPress={handleVerifyOTP}
              loading={loading}
            />
          </View>

          {/* --- Resend OTP --- */}
          <View style={[external.mt_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                { flexDirection: "row", justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text
                style={[
                  commonStyles.regularTextBigBlack,
                  { color: "#000", marginTop: 20 },
                ]}
              >
                {"Not Received yet? "}
              </Text>
              <TouchableOpacity onPress={handleResendOTP}>
                <Text
                  style={[
                    commonStyles.regularTextBigBlack,
                    { color: "blue", marginTop: 20 },
                  ]}
                >
                  {"Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}
