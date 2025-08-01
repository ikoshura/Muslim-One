import React from "react";
import { StyleSheet, View, ScrollView, Text, RefreshControl, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";

import PrayerCard from "@/components/PrayerCard";
import LocationDisplay from "@/components/LocationDisplay";
import HijriDate from "@/components/HijriDate";
import useLocation from "@/hooks/useLocation";
import usePrayerTimes from "@/hooks/usePrayerTimes";
import { useAppSettings } from "@/hooks/useAppSettings";
import Colors from "@/constants/colors";

export default function PrayerTimesScreen() {
  const { location, isLoading: locationLoading, error: locationError, refreshLocation } = useLocation();
  const { currentTheme, settings } = useAppSettings();
  const colors = Colors[currentTheme];
  
  const { 
    prayerTimes, 
    nextPrayer, 
    hijriDate, 
    isLoading: prayerTimesLoading, 
    error: prayerTimesError,
    refetch: refetchPrayerTimes
  } = usePrayerTimes({
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
  });

  const isLoading = locationLoading || prayerTimesLoading;
  const hasError = locationError || prayerTimesError;

  const handleRefresh = () => {
    refreshLocation();
    refetchPrayerTimes();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: settings.language === "en" ? "Prayer Times" : "Jadwal Shalat",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <LocationDisplay 
          location={location} 
          isLoading={locationLoading} 
          onRefresh={refreshLocation} 
        />
        
        {hijriDate && <HijriDate date={hijriDate} />}
        
        {isLoading && !prayerTimes.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              {settings.language === "en" ? "Loading prayer times..." : "Memuat jadwal shalat..."}
            </Text>
          </View>
        ) : hasError ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.errorText, { color: colors.notification }]}>
              {settings.language === "en" 
                ? "Could not load prayer times. Please check your connection and try again." 
                : "Gagal memuat jadwal shalat. Periksa koneksi Anda dan coba lagi."}
            </Text>
          </View>
        ) : (
          <>
            {nextPrayer && (
              <View style={[styles.nextPrayerContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.nextPrayerLabel, { color: colors.text }]}>
                  {settings.language === "en" ? "Next Prayer" : "Shalat Berikutnya"}
                </Text>
                <Text style={[styles.nextPrayerName, { color: colors.primary }]}>
                  {nextPrayer.name}
                </Text>
                <Text style={[styles.nextPrayerTime, { color: colors.text }]}>
                  {nextPrayer.time}
                </Text>
                {nextPrayer.timeRemaining && (
                  <View style={[styles.countdownContainer, { backgroundColor: colors.primary }]}>
                    <Text style={styles.countdownText}>
                      {settings.language === "en" ? "Time Remaining: " : "Waktu Tersisa: "}
                      {nextPrayer.timeRemaining}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.prayerListContainer}>
              {prayerTimes.map((prayer, index) => (
                <PrayerCard key={`prayer-${index}`} prayer={prayer} />
              ))}
            </View>
          </>
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
  nextPrayerContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  nextPrayerLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  nextPrayerTime: {
    fontSize: 18,
    marginBottom: 16,
  },
  countdownContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countdownText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  prayerListContainer: {
    marginTop: 8,
  },
});