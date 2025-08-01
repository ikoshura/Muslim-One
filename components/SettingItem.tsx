import React, { ReactNode } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import Colors from "@/constants/colors";
import { useAppSettings } from "@/hooks/useAppSettings";

interface SettingItemProps {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  value?: string;
  isLast?: boolean;
}

export default function SettingItem({ 
  label, 
  icon, 
  onPress, 
  value, 
  isLast = false 
}: SettingItemProps) {
  const { currentTheme } = useAppSettings();
  const colors = Colors[currentTheme];

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          borderBottomColor: isLast ? "transparent" : colors.border,
          backgroundColor: colors.card,
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      {value && (
        <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 0.5,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
  },
  value: {
    fontSize: 16,
    fontWeight: "400",
  },
});