import React, { useState, useEffect } from "react";
import { View, Image } from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen: React.FC = () => {
  const [phone_number, setphone_number] = useState<string>("");
  const [loading, setloading] = useState<boolean>(false);

  // India default +91 — locked, not changeable
  const countryCode = "+91";

  const toast = useToast();

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Error checking existing user:", error);
      }
    };

    checkExistingUser();
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!phone_number.trim()) {
      toast.show("Please enter your mobile number.", {
        placement: "bottom",
        type: "danger",
      });
      return;
    }

    if (phone_number.length !== 10) {
      toast.show("Enter a valid 10-digit mobile number.", {
        placement: "bottom",
        type: "danger",
      });
      return;
    }

    const formattedNumber = `${countryCode}${phone_number}`;

    setloading(true);

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URI}/send-otp`, {
        phone_number: formattedNumber,
      });

      setloading(false);

      router.push({
        pathname: "/(routes)/otp-verification",
        params: { phoneNumber: formattedNumber },
      });
    } catch (error: any) {
      setloading(false);

      const errorMessage =
        error?.response?.data?.message || "Unable to process request.";

      toast.show(errorMessage, {
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
          <Image style={styles.transformLine} source={Images.line} />

          <SignInText
            title="Welcome Back"
            subtitle="Sign in with your mobile number to continue"
          />

          <View style={[external.mt_25, external.Pb_10]}>
            <PhoneNumberInput
              phone_number={phone_number}
              setphone_number={setphone_number}
              countryCode={countryCode}
              setCountryCode={() => {}} // locked
            />

            <View style={[external.mt_25, external.Pb_15]}>
              <Button
                title="Get OTP"
                onPress={handleSubmit}
                disabled={loading}
                loading={loading}
              />
            </View>
          </View>
        </View>
      }
    />
  );
};

export default LoginScreen;
