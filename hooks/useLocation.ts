import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { LocationData } from "@/types/prayer";
import { useAppSettings } from "@/hooks/useAppSettings";

export default function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useAppSettings();

  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const { city, country } = reverseGeocode[0];
        return { city, country };
      }
      return {};
    } catch (error) {
      console.error("Error getting location name:", error);
      return {};
    }
  };

  const requestAndUpdateLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use manual location if automatic is disabled
      if (!settings.useAutomaticLocation && settings.manualLatitude && settings.manualLongitude) {
        const { city, country } = await getLocationName(
          settings.manualLatitude,
          settings.manualLongitude
        );
        
        setLocation({
          latitude: settings.manualLatitude,
          longitude: settings.manualLongitude,
          city: city || undefined,
          country: country || undefined,
        });
        
        setIsLoading(false);
        return;
      }

      // Request permission for automatic location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        setError("Permission to access location was denied");
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      const { city, country } = await getLocationName(latitude, longitude);

      setLocation({
        latitude,
        longitude,
        city: city || undefined,
        country: country || undefined,
      });
    } catch (err) {
      setError("Could not fetch location");
      console.error("Location error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestAndUpdateLocation();
  }, [
    settings.useAutomaticLocation,
    settings.manualLatitude,
    settings.manualLongitude,
  ]);

  return {
    location,
    isLoading,
    error,
    refreshLocation: requestAndUpdateLocation,
  };
}