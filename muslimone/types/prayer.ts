export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
      designation: { abbreviated: string; expanded: string };
    };
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string };
      year: string;
      designation: { abbreviated: string; expanded: string };
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
      params: { [key: string]: number };
    };
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: { [key: string]: number };
  };
}

export interface QiblaData {
  data: {
    latitude: number;
    longitude: number;
    direction: number;
  };
  status: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  isNext: boolean;
  timeRemaining?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface CalculationMethod {
  id: number;
  name: string;
}

export interface MadhhabOption {
  id: number;
  name: string;
}

export type ThemeOption = "system" | "light" | "dark";
export type LanguageOption = "en" | "id";