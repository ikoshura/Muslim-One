import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { PrayerData, PrayerTime } from "@/types/prayer";
import { MAIN_PRAYERS, PRAYER_NAMES_AR, PRAYER_NAMES_EN, PRAYER_NAMES_ID } from "@/constants/prayerSettings";
import { useAppSettings } from "@/hooks/useAppSettings";

interface UsePrayerTimesProps {
  latitude: number;
  longitude: number;
}

export default function usePrayerTimes({ latitude, longitude }: UsePrayerTimesProps) {
  const { settings } = useAppSettings();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const fetchPrayerTimes = async () => {
    const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${settings.calculationMethod}&school=${settings.madhhab}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch prayer times");
    }
    
    const data = await response.json();
    return data.data as PrayerData;
  };

  const prayerTimesQuery = useQuery({
    queryKey: ["prayerTimes", latitude, longitude, settings.calculationMethod, settings.madhhab],
    queryFn: fetchPrayerTimes,
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Calculate time remaining until next prayer
  const calculateTimeRemaining = (nextPrayerTime: string) => {
    const now = new Date();
    const [hours, minutes] = nextPrayerTime.split(":");
    const prayerTime = new Date();
    prayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);

    if (prayerTime < now) {
      // If prayer time is in the past, add 24 hours
      prayerTime.setDate(prayerTime.getDate() + 1);
    }

    const diff = prayerTime.getTime() - now.getTime();
    const hours24 = Math.floor(diff / (1000 * 60 * 60));
    const minutes60 = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours24.toString().padStart(2, "0")}:${minutes60.toString().padStart(2, "0")}`;
  };

  // Update prayer times and next prayer
  useEffect(() => {
    if (prayerTimesQuery.data) {
      const { timings } = prayerTimesQuery.data;
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const prayerList: PrayerTime[] = [];
      let nextPrayerIndex = -1;
      let minDiff = Infinity;

      MAIN_PRAYERS.forEach((prayer, index) => {
        const time = timings[prayer as keyof typeof timings];
        const [prayerHour, prayerMinute] = time.split(":").map(Number);
        const prayerTimeInMinutes = prayerHour * 60 + prayerMinute;
        
        // Calculate difference (considering day wrap)
        let diff = prayerTimeInMinutes - currentTimeInMinutes;
        if (diff < 0) diff += 24 * 60; // Add 24 hours if prayer time has passed
        
        // Find the next prayer (smallest positive difference)
        if (diff < minDiff && diff > 0) {
          minDiff = diff;
          nextPrayerIndex = index;
        }

        // If all prayers have passed, the first prayer is next
        if (nextPrayerIndex === -1) nextPrayerIndex = 0;

        // Get prayer name based on language setting
        const prayerName = settings.language === "en" 
          ? PRAYER_NAMES_EN[prayer as keyof typeof PRAYER_NAMES_EN]
          : PRAYER_NAMES_ID[prayer as keyof typeof PRAYER_NAMES_ID];

        prayerList.push({
          name: prayerName,
          time: formatTime(time),
          arabicName: PRAYER_NAMES_AR[prayer as keyof typeof PRAYER_NAMES_AR],
          isNext: false,
        });
      });

      // Mark the next prayer
      if (nextPrayerIndex !== -1) {
        prayerList[nextPrayerIndex].isNext = true;
        
        // Calculate time remaining for next prayer
        const nextPrayerTime = timings[MAIN_PRAYERS[nextPrayerIndex] as keyof typeof timings];
        const timeRemaining = calculateTimeRemaining(nextPrayerTime);
        
        setNextPrayer({
          ...prayerList[nextPrayerIndex],
          timeRemaining,
        });
        
        setTimeRemaining(timeRemaining);
      }

      setPrayerTimes(prayerList);
    }
  }, [prayerTimesQuery.data, settings.language]);

  // Update time remaining every minute
  useEffect(() => {
    if (!nextPrayer) return;

    const interval = setInterval(() => {
      if (prayerTimesQuery.data && nextPrayer) {
        const { timings } = prayerTimesQuery.data;
        const nextPrayerName = MAIN_PRAYERS.find(
          (prayer) => 
            settings.language === "en" 
              ? PRAYER_NAMES_EN[prayer as keyof typeof PRAYER_NAMES_EN] === nextPrayer.name
              : PRAYER_NAMES_ID[prayer as keyof typeof PRAYER_NAMES_ID] === nextPrayer.name
        );
        
        if (nextPrayerName) {
          const nextPrayerTime = timings[nextPrayerName as keyof typeof timings];
          const updatedTimeRemaining = calculateTimeRemaining(nextPrayerTime);
          
          setTimeRemaining(updatedTimeRemaining);
          
          // If time remaining is "00:00", refresh prayer times
          if (updatedTimeRemaining === "00:00") {
            prayerTimesQuery.refetch();
          }
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextPrayer, prayerTimesQuery.data, settings.language]);

  return {
    prayerTimes,
    nextPrayer,
    timeRemaining,
    isLoading: prayerTimesQuery.isLoading,
    error: prayerTimesQuery.error,
    hijriDate: prayerTimesQuery.data?.date.hijri,
    refetch: prayerTimesQuery.refetch,
  };
}