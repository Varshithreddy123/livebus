import { useTheme } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import fonts from "@/themes/app.fonts";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight } from "@/themes/app.constant";

interface TitleViewProps {
  title: string;
  subTitle: string;
}

export default function TitleView({ title, subTitle }: TitleViewProps) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: windowHeight(12) }}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <Text style={styles.subtitle}>
        {subTitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.FONT28,
    fontFamily: fonts.semiBold,
    marginBottom: windowHeight(1),
    letterSpacing: 0.2,
  },
  subtitle: {
    color: color.secondaryFont,
    fontSize: fontSizes.FONT18,
    fontFamily: fonts.medium,
    lineHeight: 22,
  },
});
