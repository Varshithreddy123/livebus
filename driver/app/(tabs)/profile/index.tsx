import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { useGetDriverData } from "@/hooks/useGetDriverData";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import { countryNameItems } from "@/configs/country-name-list";
import Button from "@/components/common/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import color from "@/themes/app.colors";
import fonts from "@/themes/app.fonts";
import { external } from "@/styles/external.style";
import { commonStyles } from "@/styles/common.style";
import { User, Mail, Phone, Edit, LogOut, Car, DollarSign, Camera, Check, X } from "lucide-react-native";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";

export default function Profile() {
  const { driver, loading, refetch } = useGetDriverData();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(driver?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setEditedName(driver?.name || "");
  }, [driver]);

  if (loading) {
    return (
      <View style={[commonStyles.flexContainer, { backgroundColor: color.whiteColor }]}>
        <Text style={{ textAlign: "center", marginTop: 100 }}>Loading...</Text>
      </View>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/update-driver-profile`,
        { name: editedName },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        refetch();
        console.log("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("accessToken");
            Toast.show("Logged out successfully", { type: "success" });
            router.push("/(routes)/login");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[commonStyles.flexContainer, { backgroundColor: color.whiteColor }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driver?.name?.charAt(0).toUpperCase() || "D"}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>{driver?.name || "Driver"}</Text>
        <Text style={styles.userEmail}>{driver?.email || "driver@example.com"}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <User size={20} color={color.primaryText} />
              <Text style={styles.fieldLabel}>Full Name</Text>
            </View>
            {isEditing ? (
              <Input
                title=""
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.fieldValue}>{driver?.name || "Not provided"}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Mail size={20} color={color.primaryText} />
              <Text style={styles.fieldLabel}>Email Address</Text>
            </View>
            <Text style={styles.fieldValue}>{driver?.email || "Not provided"}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Phone size={20} color={color.primaryText} />
              <Text style={styles.fieldLabel}>Phone Number</Text>
            </View>
            <Text style={styles.fieldValue}>
              {driver?.phone_number
                ? `****${driver.phone_number.slice(-4)}`
                : "Not provided"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Car size={20} color={color.primaryText} />
              <Text style={styles.fieldLabel}>Vehicle Type</Text>
            </View>
            <Text style={styles.fieldValue}>{driver?.vehicle_type || "Not provided"}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <DollarSign size={20} color={color.primaryText} />
              <Text style={styles.fieldLabel}>Rate per KM</Text>
            </View>
            <Text style={styles.fieldValue}>{driver?.rate ? `${driver.rate} BDT` : "Not provided"}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Car size={20} color={color.primaryText} />
              <Text style={styles.fieldLabel}>Vehicle Number</Text>
            </View>
            <Text style={styles.fieldValue}>{driver?.registration_number || "Not provided"}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Car size={20} color={color.primaryText} />
              <Text style={styles.fieldLabel}>Vehicle Color</Text>
            </View>
            <Text style={styles.fieldValue}>{driver?.vehicle_color || "Not provided"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Statistics</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{driver?.totalRides?.toString() || "0"}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>
            <View style={styles.statItem}>
            <Text style={styles.statNumber}>{driver?.ratings?.toString() || "0"}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{driver?.totalEarning?.toString() || "0"}</Text>
              <Text style={styles.statLabel}>Total Earning</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {isEditing ? (
            <View style={styles.editActions}>
              <Button
                title="Save Changes"
                onPress={handleSaveProfile}
                backgroundColor={color.buttonBg}
                width="48%"
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setEditedName(driver?.name || "");
                  setIsEditing(false);
                }}
                backgroundColor={color.lightGray}
                width="48%"
              />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Edit size={20} color={color.buttonBg} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={color.alertRed} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: windowHeight(50),
    paddingBottom: windowHeight(30),
    backgroundColor: color.buttonBg,
  },
  avatarContainer: {
    marginBottom: windowHeight(15),
  },
  avatar: {
    width: windowWidth(80),
    height: windowWidth(80),
    borderRadius: windowWidth(40),
    backgroundColor: color.whiteColor,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: color.whiteColor,
  },
  avatarText: {
    fontSize: fontSizes.FONT30,
    fontFamily: fonts.bold,
    color: color.buttonBg,
  },
  userName: {
    fontSize: fontSizes.FONT24,
    fontFamily: fonts.bold,
    color: color.whiteColor,
    marginBottom: windowHeight(5),
  },
  userEmail: {
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.medium,
    color: color.whiteColor,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: windowWidth(20),
  },
  section: {
    marginBottom: windowHeight(30),
  },
  sectionTitle: {
    fontSize: fontSizes.FONT20,
    fontFamily: fonts.bold,
    color: color.primaryText,
    marginBottom: windowHeight(15),
  },
  fieldContainer: {
    marginBottom: windowHeight(20),
    padding: windowWidth(15),
    backgroundColor: color.lightGray,
    borderRadius: 10,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: windowHeight(8),
  },
  fieldLabel: {
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.medium,
    color: color.primaryText,
    marginLeft: windowWidth(10),
  },
  fieldValue: {
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.regular,
    color: color.secondaryFont,
    paddingLeft: windowWidth(30),
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: color.lightGray,
    padding: windowWidth(20),
    borderRadius: 10,
    minWidth: windowWidth(80),
  },
  statNumber: {
    fontSize: fontSizes.FONT24,
    fontFamily: fonts.bold,
    color: color.buttonBg,
    marginBottom: windowHeight(5),
  },
  statLabel: {
    fontSize: fontSizes.FONT14,
    fontFamily: fonts.medium,
    color: color.secondaryFont,
  },
  actionsContainer: {
    marginTop: windowHeight(20),
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.selectPrimary,
    padding: windowWidth(15),
    borderRadius: 10,
    marginBottom: windowHeight(15),
  },
  editButtonText: {
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.medium,
    color: color.buttonBg,
    marginLeft: windowWidth(10),
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: windowHeight(15),
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.alertBg,
    padding: windowWidth(15),
    borderRadius: 10,
  },
  logoutButtonText: {
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.medium,
    color: color.alertRed,
    marginLeft: windowWidth(10),
  },
});
