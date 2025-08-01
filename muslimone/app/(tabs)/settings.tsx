import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Text, Alert, Modal, TouchableOpacity, FlatList } from "react-native";
import { Stack } from "expo-router";
import { Calculator, Globe, MapPin, Moon, Settings as SettingsIcon } from "lucide-react-native";

import SettingSection from "@/components/SettingSection";
import SettingItem from "@/components/SettingItem";
import { useAppSettings } from "@/hooks/useAppSettings";
import Colors from "@/constants/colors";
import { CALCULATION_METHODS, MADHHAB_OPTIONS } from "@/constants/prayerSettings";
import { CalculationMethod, MadhhabOption, ThemeOption, LanguageOption } from "@/types/prayer";

export default function SettingsScreen() {
  const { settings, updateSettings, currentTheme } = useAppSettings();
  const colors = Colors[currentTheme];
  
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showMadhhabModal, setShowMadhhabModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  const getCalculationMethodName = () => {
    const method = CALCULATION_METHODS.find(m => m.id === settings.calculationMethod);
    return method ? method.name : "Unknown";
  };
  
  const getMadhhabName = () => {
    const madhhab = MADHHAB_OPTIONS.find(m => m.id === settings.madhhab);
    return madhhab ? madhhab.name : "Unknown";
  };
  
  const getLanguageName = () => {
    return settings.language === "en" ? "English" : "Indonesia";
  };
  
  const getThemeName = () => {
    switch (settings.theme) {
      case "light": return "Light";
      case "dark": return "Dark";
      default: return "System";
    }
  };
  
  const handleMethodSelect = (method: CalculationMethod) => {
    updateSettings({ calculationMethod: method.id });
    setShowMethodModal(false);
  };
  
  const handleMadhhabSelect = (madhhab: MadhhabOption) => {
    updateSettings({ madhhab: madhhab.id });
    setShowMadhhabModal(false);
  };
  
  const handleLanguageSelect = (language: LanguageOption) => {
    updateSettings({ language });
    setShowLanguageModal(false);
  };
  
  const handleThemeSelect = (theme: ThemeOption) => {
    updateSettings({ theme });
    setShowThemeModal(false);
  };
  
  const toggleLocationMode = () => {
    if (settings.useAutomaticLocation) {
      Alert.alert(
        settings.language === "en" ? "Manual Location" : "Lokasi Manual",
        settings.language === "en" 
          ? "Please enter your latitude and longitude" 
          : "Silakan masukkan latitude dan longitude Anda",
        [
          {
            text: settings.language === "en" ? "Cancel" : "Batal",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              // For simplicity, we're setting a default location (Mecca)
              // In a real app, you would show a proper input form
              updateSettings({
                useAutomaticLocation: false,
                manualLatitude: 21.4225,
                manualLongitude: 39.8262,
              });
            },
          },
        ]
      );
    } else {
      updateSettings({
        useAutomaticLocation: true,
        manualLatitude: null,
        manualLongitude: null,
      });
    }
  };
  
  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    renderContent: () => React.ReactNode
  ) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>
                {settings.language === "en" ? "Close" : "Tutup"}
              </Text>
            </TouchableOpacity>
          </View>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: settings.language === "en" ? "Settings" : "Pengaturan",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <SettingSection title={settings.language === "en" ? "Prayer Calculation" : "Perhitungan Shalat"}>
          <SettingItem
            label={settings.language === "en" ? "Calculation Method" : "Metode Perhitungan"}
            icon={<Calculator size={22} color={colors.primary} />}
            value={getCalculationMethodName()}
            onPress={() => setShowMethodModal(true)}
          />
          <SettingItem
            label={settings.language === "en" ? "Madhhab" : "Madzhab"}
            icon={<SettingsIcon size={22} color={colors.primary} />}
            value={getMadhhabName()}
            onPress={() => setShowMadhhabModal(true)}
            isLast={true}
          />
        </SettingSection>
        
        <SettingSection title={settings.language === "en" ? "Location" : "Lokasi"}>
          <SettingItem
            label={settings.language === "en" ? "Use Device Location" : "Gunakan Lokasi Perangkat"}
            icon={<MapPin size={22} color={colors.primary} />}
            value={settings.useAutomaticLocation ? 
              (settings.language === "en" ? "On" : "Aktif") : 
              (settings.language === "en" ? "Off" : "Nonaktif")}
            onPress={toggleLocationMode}
            isLast={true}
          />
        </SettingSection>
        
        <SettingSection title={settings.language === "en" ? "Appearance" : "Tampilan"}>
          <SettingItem
            label={settings.language === "en" ? "Language" : "Bahasa"}
            icon={<Globe size={22} color={colors.primary} />}
            value={getLanguageName()}
            onPress={() => setShowLanguageModal(true)}
          />
          <SettingItem
            label={settings.language === "en" ? "Theme" : "Tema"}
            icon={<Moon size={22} color={colors.primary} />}
            value={getThemeName()}
            onPress={() => setShowThemeModal(true)}
            isLast={true}
          />
        </SettingSection>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.text }]}>
            Muslim One v1.0.0
          </Text>
        </View>
      </ScrollView>
      
      {/* Calculation Method Modal */}
      {renderModal(
        showMethodModal,
        () => setShowMethodModal(false),
        settings.language === "en" ? "Calculation Method" : "Metode Perhitungan",
        () => (
          <FlatList
            data={CALCULATION_METHODS}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { borderBottomColor: colors.border },
                  settings.calculationMethod === item.id && { backgroundColor: colors.primary + "20" }
                ]}
                onPress={() => handleMethodSelect(item)}
              >
                <Text style={[
                  styles.modalItemText, 
                  { color: colors.text },
                  settings.calculationMethod === item.id && { fontWeight: "600", color: colors.primary }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )
      )}
      
      {/* Madhhab Modal */}
      {renderModal(
        showMadhhabModal,
        () => setShowMadhhabModal(false),
        settings.language === "en" ? "Madhhab" : "Madzhab",
        () => (
          <FlatList
            data={MADHHAB_OPTIONS}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { borderBottomColor: colors.border },
                  settings.madhhab === item.id && { backgroundColor: colors.primary + "20" }
                ]}
                onPress={() => handleMadhhabSelect(item)}
              >
                <Text style={[
                  styles.modalItemText, 
                  { color: colors.text },
                  settings.madhhab === item.id && { fontWeight: "600", color: colors.primary }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )
      )}
      
      {/* Language Modal */}
      {renderModal(
        showLanguageModal,
        () => setShowLanguageModal(false),
        settings.language === "en" ? "Language" : "Bahasa",
        () => (
          <View>
            <TouchableOpacity
              style={[
                styles.modalItem,
                { borderBottomColor: colors.border },
                settings.language === "en" && { backgroundColor: colors.primary + "20" }
              ]}
              onPress={() => handleLanguageSelect("en")}
            >
              <Text style={[
                styles.modalItemText, 
                { color: colors.text },
                settings.language === "en" && { fontWeight: "600", color: colors.primary }
              ]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalItem,
                settings.language === "id" && { backgroundColor: colors.primary + "20" }
              ]}
              onPress={() => handleLanguageSelect("id")}
            >
              <Text style={[
                styles.modalItemText, 
                { color: colors.text },
                settings.language === "id" && { fontWeight: "600", color: colors.primary }
              ]}>
                Indonesia
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}
      
      {/* Theme Modal */}
      {renderModal(
        showThemeModal,
        () => setShowThemeModal(false),
        settings.language === "en" ? "Theme" : "Tema",
        () => (
          <View>
            <TouchableOpacity
              style={[
                styles.modalItem,
                { borderBottomColor: colors.border },
                settings.theme === "system" && { backgroundColor: colors.primary + "20" }
              ]}
              onPress={() => handleThemeSelect("system")}
            >
              <Text style={[
                styles.modalItemText, 
                { color: colors.text },
                settings.theme === "system" && { fontWeight: "600", color: colors.primary }
              ]}>
                {settings.language === "en" ? "System" : "Sistem"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalItem,
                { borderBottomColor: colors.border },
                settings.theme === "light" && { backgroundColor: colors.primary + "20" }
              ]}
              onPress={() => handleThemeSelect("light")}
            >
              <Text style={[
                styles.modalItemText, 
                { color: colors.text },
                settings.theme === "light" && { fontWeight: "600", color: colors.primary }
              ]}>
                {settings.language === "en" ? "Light" : "Terang"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalItem,
                settings.theme === "dark" && { backgroundColor: colors.primary + "20" }
              ]}
              onPress={() => handleThemeSelect("dark")}
            >
              <Text style={[
                styles.modalItemText, 
                { color: colors.text },
                settings.theme === "dark" && { fontWeight: "600", color: colors.primary }
              ]}>
                {settings.language === "en" ? "Dark" : "Gelap"}
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 0.5,
  },
  modalItemText: {
    fontSize: 16,
  },
});