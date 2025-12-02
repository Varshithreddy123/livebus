import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import ProgressBar from "@/components/common/progress.bar";
import styles from "./styles";
import { useTheme } from "@react-navigation/native";
import TitleView from "@/components/signup/title.view";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import { countryNameItems } from "@/configs/country-name-list";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { router } from "expo-router";

export default function SignupScreen() {
  const { colors } = useTheme();
  const [emailFormatWarning, setEmailFormatWarning] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    country: "India 🇮🇳",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  // Normalize phone number - remove non-digit characters
  const normalizePhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, ""); // Remove all non-digit characters
  };

  // Validate phone number based on country
  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    const normalized = normalizePhoneNumber(phone);
    
    // India phone numbers should be 10 digits
    if (countryCode === "91") {
      return normalized.length === 10;
    }
    
    // For other countries, at least 7 digits
    return normalized.length >= 7 && normalized.length <= 15;
  };

  const gotoDocument = () => {
    // Validate name
    if (formData.name.trim() === "") {
      setShowWarning(true);
      return;
    }

    // Validate phone number
    const phoneNumberData = countryNameItems.find(
      (i: any) => i.label === formData.country
    );

    if (!phoneNumberData) {
      setShowWarning(true);
      return;
    }

    const normalizedPhone = normalizePhoneNumber(formData.phoneNumber);
    if (!validatePhoneNumber(normalizedPhone, phoneNumberData.value)) {
      setShowWarning(true);
      return;
    }

    // Validate email
    const isEmailEmpty = formData.email.trim() === "";
    const isEmailInvalid = !isEmailEmpty && emailFormatWarning !== "";

    if (isEmailEmpty || isEmailInvalid) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    
    // Construct phone number with country code (ensure + prefix)
    const phone_number = `+${phoneNumberData.value}${normalizedPhone}`;

    const driverData = {
      name: formData.name.trim(),
      country_label: formData.country,
      country_code: phoneNumberData.value + "",
      phone_number: phone_number,
      email: formData.email.trim(),
    };
    
    router.push({
      pathname: "/(routes)/document-verification",
      params: driverData,
    });
  };

  return (
    <ScrollView>
      <View>
        {/* logo */}
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(22),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Chakraa Driver
        </Text>
        <View style={{ padding: windowWidth(20) }}>
          <ProgressBar fill={1} />
          <View
            style={[styles.subView, { backgroundColor: colors.background }]}
          >
            <View style={styles.space}>
              <TitleView
                title={"Create your account"}
                subTitle={"Explore your life by joining Ride Wave"}
              />
              <Input
                title="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                showWarning={showWarning && formData.name === ""}
                warning={"Please enter your name!"}
              />
              <SelectInput
                title="Country"
                placeholder="Select your country"
                value={formData.country}
                onValueChange={(text) => handleChange("country", text)}
                showWarning={showWarning && formData.country === ""}
                items={countryNameItems}
              />
              <Input
                title="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange("phoneNumber", text)}
                showWarning={showWarning && formData.phoneNumber === ""}
                warning={"Please enter your phone number!"}
              />
              <Input
                title={"Email Address"}
                placeholder={"Enter your email address"}
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                showWarning={
                  showWarning &&
                  (formData.email === "" || emailFormatWarning !== "")
                }
                warning={
                  emailFormatWarning !== ""
                    ? "Please enter your email!"
                    : "Please enter a validate email!"
                }
                emailFormatWarning={emailFormatWarning}
              />
            </View>
            <View style={styles.margin}>
              <Button
                onPress={gotoDocument}
                height={windowHeight(30)}
                title={"Next"}
                backgroundColor={color.buttonBg}
                textColor={color.whiteColor}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}