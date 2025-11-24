import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { User, Mail, Phone, Edit, LogOut } from "lucide-react-native";

import Input from "@/components/common/input";
import Button from "@/components/common/button";
import { useGetUserData } from "@/hooks/useGetUserData";

import color from "@/themes/app.colors";
import fonts from "@/themes/app.fonts";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { commonStyles } from "@/styles/common.style";

export default function Profile() {
  const { user, loading, refetch } = useGetUserData();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (user?.name) setEditedName(user.name);
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
    if (!editedName.trim()) {
      Alert.alert("Invalid name", "Name cannot be empty.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");

      const baseUrl = await getApiBaseUrl();
      const response = await axios.put(
        `${baseUrl}/update-profile`,
        { name: editedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await refetch();
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", "Unable to update profile. Please try again.");
    }
  }, [editedName]);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.removeItem("accessToken");
    router.push("/(routes)/login");
  }, []);

  if (loading) {
    return (
      <View style={[commonStyles.flexContainer, styles.center]}>
        <ActivityIndicator size="large" color={color.buttonBg} />
      </View>
    );
  }

  return (
    <ScrollView style={[commonStyles.flexContainer, { backgroundColor: color.whiteColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
        </View>

        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
      </View>

      {/* Personal Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {/* Name */}
        <View style={styles.fieldBox}>
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
            <Text style={styles.fieldValue}>{user?.name || "Not provided"}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.fieldBox}>
          <View style={styles.fieldHeader}>
            <Mail size={20} color={color.primaryText} />
            <Text style={styles.fieldLabel}>Email Address</Text>
          </View>

          <Text style={styles.fieldValue}>{user?.email || "Not provided"}</Text>
        </View>

        {/* Phone */}
        <View style={styles.fieldBox}>
          <View style={styles.fieldHeader}>
            <Phone size={20} color={color.primaryText} />
            <Text style={styles.fieldLabel}>Phone Number</Text>
          </View>

          <Text style={styles.fieldValue}>
            {user?.phone_number
              ? `****${user.phone_number.slice(-4)}`
              : "Not provided"}
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Statistics</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.totalRides || "0"}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{user?.ratings || "0"}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
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
                setEditedName(user?.name || "");
                setIsEditing(false);
              }}
              backgroundColor={color.lightGray}
              width="48%"
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Edit size={20} color={color.buttonBg} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={color.alertRed} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },

  header: {
    alignItems: "center",
    paddingTop: windowHeight(50),
    paddingBottom: windowHeight(30),
    backgroundColor: color.buttonBg,
  },

  avatar: {
    width: windowWidth(90),
    height: windowWidth(90),
    borderRadius: windowWidth(45),
    backgroundColor: color.whiteColor,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: windowHeight(15),
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
  },

  userEmail: {
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.medium,
    color: color.whiteColor,
    opacity: 0.8,
    marginTop: 4,
  },

  section: {
    marginTop: windowHeight(20),
    padding: windowWidth(20),
  },

  sectionTitle: {
    fontSize: fontSizes.FONT20,
    fontFamily: fonts.bold,
    color: color.primaryText,
    marginBottom: windowHeight(15),
  },

  fieldBox: {
    backgroundColor: color.lightGray,
    padding: windowWidth(15),
    borderRadius: 10,
    marginBottom: windowHeight(18),
  },

  fieldHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

  fieldLabel: {
    marginLeft: 10,
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.medium,
    color: color.primaryText,
  },

  fieldValue: {
    fontSize: fontSizes.FONT16,
    fontFamily: fonts.regular,
    color: color.secondaryFont,
    paddingLeft: 5,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  statBox: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: color.lightGray,
    borderRadius: 10,
  },

  statNumber: {
    fontSize: fontSizes.FONT24,
    fontFamily: fonts.bold,
    color: color.buttonBg,
  },

  statLabel: {
    fontSize: fontSizes.FONT14,
    fontFamily: fonts.medium,
    color: color.secondaryFont,
    marginTop: 4,
  },

  actions: {
    padding: windowWidth(20),
    marginBottom: windowHeight(40),
  },

  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  editButton: {
    flexDirection: "row",
    backgroundColor: color.selectPrimary,
    padding: windowWidth(15),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  editButtonText: {
    fontSize: fontSizes.FONT16,
    color: color.buttonBg,
    fontFamily: fonts.medium,
    marginLeft: 8,
  },

  logoutButton: {
    flexDirection: "row",
    backgroundColor: color.alertBg,
    padding: windowWidth(15),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutButtonText: {
    marginLeft: 10,
    color: color.alertRed,
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT16,
  },
});
