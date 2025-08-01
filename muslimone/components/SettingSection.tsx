import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useAppSettings } from "@/hooks/useAppSettings";

interface SettingSectionProps {
  title: string;
  children: ReactNode;
}

export default function SettingSection({ title, children }: SettingSectionProps) {
  const { currentTheme } = useAppSettings();
  const colors = Colors[currentTheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 8,
  },
  content: {
    borderRadius: 12,
    overflow: "hidden",
  },
});