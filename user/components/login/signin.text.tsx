import { View, Text } from "react-native";
import React from "react";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";

export default function SignInText({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={[
          commonStyles.regularTextBigBlack,
          {
            color: "#000",
            textAlign: "left",
            fontWeight: "700",
            letterSpacing: 0.3,
          },
        ]}
      >
        {title || "Sign in to continue"}
      </Text>

      <Text
        style={[
          commonStyles.regularText,
          external.pt_4,
          {
            textAlign: "left",
            color: "#444",
            fontSize: 15,
            lineHeight: 22,
          },
        ]}
      >
        {subtitle ||
          "Enter your phone number to verify your identity and access ride services."}
      </Text>
    </View>
  );
}
