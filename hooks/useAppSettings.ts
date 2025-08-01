import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useColorScheme } from "react-native";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

import { LanguageOption, ThemeOption } from "@/types/prayer";

interface AppSettings {
  calculationMethod: number;
  madhhab: number;
  useAutomaticLocation: boolean;
  manualLatitude: number | null;
  manualLongitude: number | null;
  language: LanguageOption;
  theme: ThemeOption;
}

const DEFAULT_SETTINGS: AppSettings = {
  calculationMethod: 3, // Muslim World League
  madhhab: 1, // Shafi'i
  useAutomaticLocation: true,
  manualLatitude: null,
  manualLongitude: null,
  language: "en",
  theme: "system",
};

export const [AppSettingsProvider, useAppSettings] = createContextHook(() => {
  const systemColorScheme = useColorScheme() || "light";
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from AsyncStorage
  const settingsQuery = useQuery({
    queryKey: ["appSettings"],
    queryFn: async () => {
      const storedSettings = await AsyncStorage.getItem("appSettings");
      return storedSettings ? JSON.parse(storedSettings) as AppSettings : DEFAULT_SETTINGS;
    },
  });

  // Save settings to AsyncStorage
  const settingsMutation = useMutation({
    mutationFn: async (newSettings: AppSettings) => {
      await AsyncStorage.setItem("appSettings", JSON.stringify(newSettings));
      return newSettings;
    },
    onSuccess: (data) => {
      setSettings(data);
    },
  });

  useEffect(() => {
    if (settingsQuery.data && !isLoaded) {
      setSettings(settingsQuery.data);
      setIsLoaded(true);
    }
  }, [settingsQuery.data, isLoaded]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    settingsMutation.mutate(updatedSettings);
  };

  // Get the current theme based on settings and system
  const currentTheme = settings.theme === "system" ? systemColorScheme : settings.theme;

  return {
    settings,
    updateSettings,
    isLoading: settingsQuery.isLoading,
    currentTheme,
  };
});

export default useAppSettings;