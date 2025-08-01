import React from "react";
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";

import QiblaCompass from "@/components/QiblaCompass";
import LocationDisplay from "@/components/LocationDisplay";
import useLocation from "@/hooks/useLocation";
import useQiblaDirection from "@/hooks/useQiblaDirection";
import { useAppSettings } from "@/hooks/useAppSettings";
import Colors from "@/constants/colors";

export default function QiblaScreen() {
  const { location, isLoading: locationLoading, error: locationError, refreshLocation } = useLocation();
  const { currentTheme, settings } = useAppSettings();
  const colors = Colors[currentTheme];
  
  const { 
    qiblaDirection, 
    deviceDirection, 
    compassAvailable,
    isLoading: qiblaLoading, 
    error: qiblaError 
  } = useQiblaDirection({
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
  });

  const isLoading = locationLoading || qiblaLoading;
  const hasError = locationError || qiblaError;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: settings.language === "en" ? "Qibla Direction" : "Arah Kiblat",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <LocationDisplay 
          location={location} 
          isLoading={locationLoading} 
          onRefresh={refreshLocation} 
        />
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              {settings.language === "en" ? "Loading Qibla direction..." : "Memuat arah Kiblat..."}
            </Text>
          </View>
        ) : hasError ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.errorText, { color: colors.notification }]}>
              {settings.language === "en" 
                ? "Could not load Qibla direction. Please check your connection and try again." 
                : "Gagal memuat arah Kiblat. Periksa koneksi Anda dan coba lagi."}
            </Text>
          </View>
        ) : (
          <View style={styles.compassContainer}>
            <Text style={[styles.compassTitle, { color: colors.text }]}>
              {settings.language === "en" ? "Qibla Compass" : "Kompas Kiblat"}
            </Text>
            <Text style={[styles.compassSubtitle, { color: colors.text }]}>
              {settings.language === "en" 
                ? "Point the top of your device toward the gold arrow" 
                : "Arahkan bagian atas perangkat Anda ke arah panah emas"}
            </Text>
            
            <QiblaCompass 
              qiblaDirection={qiblaDirection} 
              deviceDirection={deviceDirection}
              compassAvailable={compassAvailable}
            />
            
            <Text style={[styles.instructions, { color: colors.text }]}>
              {settings.language === "en" 
                ? "Hold your device flat and parallel to the ground for the most accurate reading." 
                : "Pegang perangkat Anda secara datar dan sejajar dengan tanah untuk pembacaan yang paling akurat."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  compassContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  compassTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  compassSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
});