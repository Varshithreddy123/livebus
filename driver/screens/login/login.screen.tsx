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
  const [countryCode, setCountryCode] = useState("+91"); // Changed from +880 to +91 (India)

  // Normalize phone number - remove any spaces, dashes, or non-digit characters
  const normalizePhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, ""); // Remove all non-digit characters
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    const normalized = normalizePhoneNumber(phone);
    
    // India phone numbers should be 10 digits
    if (countryCode === "+91") {
      return normalized.length === 10;
    }
    
    // For other countries, at least 7 digits
    return normalized.length >= 7 && normalized.length <= 15;
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (phone_number === "" || countryCode === "") {
      Toast.show("Please fill all the fields!", {
        type: "warning",
        placement: "bottom",
      });
      return;
    }

    // Normalize and validate phone number
    const normalizedPhone = normalizePhoneNumber(phone_number);
    
    if (!validatePhoneNumber(normalizedPhone, countryCode)) {
      Toast.show(
        countryCode === "+91" 
          ? "Please enter a valid 10-digit phone number" 
          : "Please enter a valid phone number",
        {
          type: "warning",
          placement: "bottom",
        }
      );
      return;
    }

    // Construct full phone number with country code
    // Backend will normalize it, but we ensure it has + prefix
    const phoneNumber = countryCode.startsWith("+") 
      ? `${countryCode}${normalizedPhone}`
      : `+${countryCode}${normalizedPhone}`;

    setloading(true);
    
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/send-otp`,
        {
          phone_number: phoneNumber,
        }
      );

      setloading(false);
      
      if (response.data.success) {
        const driver = {
          phone_number: phoneNumber,
        };
        router.push({
          pathname: "/(routes)/verification-phone-number",
          params: driver,
        });
      } else {
        Toast.show(response.data.message || "Failed to send OTP", {
          type: "danger",
          placement: "bottom",
        });
      }
    } catch (error: any) {
      console.error("OTP send error:", error);
      setloading(false);
      
      // Show specific error message from API if available
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        "Something went wrong! Please check your phone number and try again.";
      
      Toast.show(errorMessage, {
        type: "danger",
        placement: "bottom",
      });
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