import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import ProgressBar from "@/components/common/progress.bar";
import styles from "../signup/styles";
import { useTheme } from "@react-navigation/native";
import TitleView from "@/components/signup/title.view";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import Images from "@/utils/images";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DocumentVerificationScreen() {
  const driverData = useLocalSearchParams();
  const { colors } = useTheme();
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    vehicleType: "Car",
    vehicleNumber: "",
    registrationDate: "",
    drivingLicenseNumber: "",
    color: "",
    rate: "",
    vehicleImage: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.vehicleNumber ||
      !formData.registrationDate ||
      !formData.drivingLicenseNumber ||
      !formData.color ||
      !formData.rate
    ) {
      setShowWarning(true);
      Toast.show("Please fill all required fields!", {
        placement: "bottom",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const driver = {
        name: driverData.name,
        country: driverData.country,
        phone_number: driverData.phone_number,
        email: driverData.email,
        vehicle_type: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        registration_date: formData.registrationDate,
        driving_license: formData.drivingLicenseNumber,
        vehicle_color: formData.color,
        rate: formData.rate,
        vehicleImage: formData.vehicleImage,
      };

      console.log("Sending data to:", process.env.EXPO_PUBLIC_SERVER_URI);
      console.log("Driver payload:", driver);

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/register-driver`,
        {
          name: driver.name,
          country: driver.country,
          phone_number: driver.phone_number,
          email: driver.email,
          vehicle_type: formData.vehicleType,
          registration_number: formData.vehicleNumber,
          registration_date: formData.registrationDate,
          driving_license: formData.drivingLicenseNumber,
          vehicle_color: formData.color,
          rate: formData.rate,
        }
      );

      // store token and set status active
      const accessToken = res?.data?.accessToken;
      if (accessToken) {
        await AsyncStorage.setItem("accessToken", accessToken);
        try {
          await axios.put(
            `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/update-status`,
            { status: "active" },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          await AsyncStorage.setItem("status", "active");
        } catch (e) {
          // Non-fatal: status can still be toggled in Home
          console.warn("Failed to set status active immediately", e);
        }
      }

      setLoading(false);

      Toast.show("Driver registered successfully!", {
        placement: "bottom",
        type: "success",
        duration: 1000,
      });

      router.replace("/(tabs)/home");
    } catch (error: any) {
      setLoading(false);
      console.error("Driver registration error:", error);
      Toast.show(
        error?.response?.data?.message ||
          error.message ||
          "Registration failed!",
        {
          placement: "bottom",
          type: "danger",
        }
      );
    }
  };

  return (
    <ScrollView>
      <View>
        {/* App logo/title */}
        <Image
          source={Images.logo}
          style={{
            width: windowWidth(150),
            height: windowHeight(50),
            alignSelf: "center",
            marginTop: windowHeight(50),
            resizeMode: "contain",
          }}
        />

        <View style={{ padding: windowWidth(20) }}>
          <ProgressBar fill={2} />
          <View style={[styles.subView, { backgroundColor: colors.background }]}>
            <View style={styles.space}>
              <TitleView
                title="Vehicle Registration"
                subTitle="Explore your life by joining Ride Wave"
              />

              <SelectInput
                title="Vehicle Type"
                placeholder="Choose your vehicle type"
                value={formData.vehicleType}
                onValueChange={(text) => handleChange("vehicleType", text)}
                showWarning={showWarning && formData.vehicleType === ""}
                warning="Please choose your vehicle type!"
                items={[
                  { label: "Car", value: "Car" },
                  { label: "Motorcycle", value: "Motorcycle" },
                  { label: "CNG", value: "CNG" },
                ]}
              />

              <Input
                title="Vehicle Number"
                placeholder="Enter your vehicle number"
                keyboardType="default"
                value={formData.vehicleNumber}
                onChangeText={(text) =>
                  handleChange("vehicleNumber", text)
                }
                showWarning={showWarning && formData.vehicleNumber === ""}
                warning="Please enter your vehicle number!"
              />

              <Input
                title="Vehicle Registration Date"
                placeholder="Enter your vehicle registration date"
                value={formData.registrationDate}
                onChangeText={(text) => handleChange("registrationDate", text)}
                showWarning={showWarning && formData.registrationDate === ""}
                warning="Please enter your vehicle registration date!"
              />

              <Input
                title="Driving License Number"
                placeholder="Enter your driving license number"
                keyboardType="default"
                value={formData.drivingLicenseNumber}
                onChangeText={(text) =>
                  handleChange("drivingLicenseNumber", text)
                }
                showWarning={
                  showWarning && formData.drivingLicenseNumber === ""
                }
                warning="Please enter your driving license number!"
              />

              <Input
                title="Vehicle Color"
                placeholder="Enter your vehicle color"
                value={formData.color}
                onChangeText={(text) => handleChange("color", text)}
                showWarning={showWarning && formData.color === ""}
                warning="Please enter your vehicle color!"
              />

              <Input
                title="Rate per km"
                placeholder="How much you want to charge per km"
                keyboardType="numeric"
                value={formData.rate}
                onChangeText={(text) => handleChange("rate", text)}
                showWarning={showWarning && formData.rate === ""}
                warning="Please enter your rate per km!"
              />
            </View>

            <View style={styles.margin}>
              <Button
                onPress={handleSubmit}
                title={
                  loading ? (
                    <ActivityIndicator color={color.whiteColor} />
                  ) : (
                    "Submit"
                  )
                }
                height={windowHeight(30)}
                backgroundColor={
                  loading ? color.greyColor : color.buttonBg
                }
                textColor={color.whiteColor}
                disabled={loading}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
