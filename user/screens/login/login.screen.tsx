import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import styles from "./styles";
import Images from "@/utils/images";
import SignInText from "@/components/login/signin.text";
import { external } from "@/styles/external.style";
import PhoneNumberInput from "@/components/login/phone-number.input";
import Button from "@/components/common/button";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";

export default function LoginScreen() {
  const [phone_number, setphone_number] = useState("");
  const [loading, setloading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const toast = useToast();

  const handleSubmit = async () => {
    console.log("=== USER LOGIN SUBMIT START ===");
    console.log("Phone number input:", phone_number);
    console.log("Country code input:", countryCode);

    if (phone_number === "" || countryCode === "") {
      console.log("Validation failed: Empty fields");
      toast.show("Please fill the fields!", {
        placement: "bottom",
      });
      console.log("=== USER LOGIN SUBMIT END (VALIDATION FAILED) ===");
      return;
    }

    const phoneNumber = `${countryCode}${phone_number}`;
    console.log("Combined phone number:", phoneNumber);
    console.log("Server URI:", process.env.EXPO_PUBLIC_SERVER_URI);
    console.log("Full API endpoint:", `${process.env.EXPO_PUBLIC_SERVER_URI}/send-otp`);

    setloading(true);
    console.log("Loading state set to true");

    const requestPayload = { phone_number: phoneNumber };
    console.log("Request payload:", requestPayload);

    try {
      console.log("Making axios POST request...");
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/send-otp`,
        requestPayload
      );

      console.log("Axios request successful");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      setloading(false);
      console.log("Loading state set to false");

      console.log("Navigating to OTP verification screen with params:", { phoneNumber });
      router.push({
        pathname: "/(routes)/otp-verification",
        params: { phoneNumber },
      });

      console.log("=== USER LOGIN SUBMIT END (SUCCESS) ===");
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
      toast.show(errorMessage, {
        type: "danger",
        placement: "bottom",
      });

      console.log("=== USER LOGIN SUBMIT END (ERROR) ===");
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
                    onPress={() => handleSubmit()}
                    disabled={loading}
                    loading={loading}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      }
    />
  );
}
