import React from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { MapPin, RefreshCw } from "lucide-react-native";

import { LocationData } from "@/types/prayer";
import Colors from "@/constants/colors";
import { useAppSettings } from "@/hooks/useAppSettings";

interface LocationDisplayProps {
  location: LocationData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function LocationDisplay({ location, isLoading, onRefresh }: LocationDisplayProps) {
  const { currentTheme } = useAppSettings();
  const colors = Colors[currentTheme];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Getting location...
        </Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.errorText, { color: colors.notification }]}>
          Location unavailable
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={16} color={colors.primary} />
          <Text style={[styles.refreshText, { color: colors.primary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const locationName = location.city && location.country 
    ? `${location.city}, ${location.country}`
    : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.locationInfo}>
        <MapPin size={16} color={colors.primary} style={styles.icon} />
        <Text style={[styles.locationText, { color: colors.text }]}>
          {locationName}
        </Text>
      </View>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <RefreshCw size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  refreshText: {
    fontSize: 14,
    marginLeft: 4,
  },
});