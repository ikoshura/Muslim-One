import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Calendar } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useAppSettings } from "@/hooks/useAppSettings";

interface HijriDateProps {
  date: {
    day: string;
    month: { en: string; ar: string };
    year: string;
    weekday: { en: string; ar: string };
  } | undefined;
}

export default function HijriDate({ date }: HijriDateProps) {
  const { currentTheme, settings } = useAppSettings();
  const colors = Colors[currentTheme];

  if (!date) {
    return null;
  }

  const isEnglish = settings.language === "en";
  const formattedDate = isEnglish
    ? `${date.day} ${date.month.en} ${date.year} (${date.weekday.en})`
    : `${date.day} ${date.month.en} ${date.year} (${date.weekday.en})`;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Calendar size={16} color={colors.primary} style={styles.icon} />
      <Text style={[styles.dateText, { color: colors.text }]}>
        {formattedDate}
      </Text>
      <Text style={[styles.arabicDate, { color: colors.text }]}>
        {date.day} {date.month.ar} {date.year}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  arabicDate: {
    fontSize: 14,
    marginLeft: "auto",
    opacity: 0.8,
  },
});