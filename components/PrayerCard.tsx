import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrayerTime } from "@/types/prayer";
import Colors from "@/constants/colors";
import { useAppSettings } from "@/hooks/useAppSettings";

interface PrayerCardProps {
  prayer: PrayerTime;
}

export default function PrayerCard({ prayer }: PrayerCardProps) {
  const { currentTheme } = useAppSettings();
  const colors = Colors[currentTheme];

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: prayer.isNext ? colors.primary : colors.card,
          shadowColor: colors.shadow,
        }
      ]}
      testID={`prayer-card-${prayer.name}`}
    >
      <View style={styles.nameContainer}>
        <Text 
          style={[
            styles.name, 
            { color: prayer.isNext ? "#FFFFFF" : colors.text }
          ]}
        >
          {prayer.name}
        </Text>
        <Text 
          style={[
            styles.arabicName, 
            { color: prayer.isNext ? "#FFFFFF" : colors.text }
          ]}
        >
          {prayer.arabicName}
        </Text>
      </View>
      <View style={styles.timeContainer}>
        <Text 
          style={[
            styles.time, 
            { color: prayer.isNext ? "#FFFFFF" : colors.text }
          ]}
        >
          {prayer.time}
        </Text>
        {prayer.isNext && prayer.timeRemaining && (
          <Text style={styles.timeRemaining}>
            {prayer.timeRemaining}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nameContainer: {
    flexDirection: "column",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  arabicName: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 18,
    fontWeight: "600",
  },
  timeRemaining: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
    opacity: 0.9,
  },
});