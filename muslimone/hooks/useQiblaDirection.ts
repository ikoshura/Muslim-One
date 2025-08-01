import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Platform } from "react-native";
import { Magnetometer } from "expo-sensors";

import { QiblaData } from "@/types/prayer";

interface UseQiblaDirectionProps {
  latitude: number;
  longitude: number;
}

export default function useQiblaDirection({ latitude, longitude }: UseQiblaDirectionProps) {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceDirection, setDeviceDirection] = useState<number>(0);
  const [compassAvailable, setCompassAvailable] = useState<boolean>(true);

  // Fetch Qibla direction from API
  const fetchQiblaDirection = async () => {
    const url = `https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch qibla direction");
    }
    
    const data = await response.json();
    return data as QiblaData;
  };

  const qiblaQuery = useQuery({
    queryKey: ["qibla", latitude, longitude],
    queryFn: fetchQiblaDirection,
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Set qibla direction when data is fetched
  useEffect(() => {
    if (qiblaQuery.data) {
      setQiblaDirection(qiblaQuery.data.data.direction);
    }
  }, [qiblaQuery.data]);

  // Subscribe to magnetometer for compass direction
  useEffect(() => {
    let subscription: any = null;

    const startCompass = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        setCompassAvailable(isAvailable);

        if (isAvailable) {
          Magnetometer.setUpdateInterval(100); // Update every 100ms
          
          subscription = Magnetometer.addListener(data => {
            const { x, y } = data;
            
            // Calculate device heading with improved accuracy
            let heading = Math.atan2(y, x) * (180 / Math.PI);
            
            // Normalize to 0-360 degrees
            heading = (heading + 360) % 360;
            
            // Adjust for device orientation and magnetic declination
            // The magnetometer gives us magnetic north, we need true north
            if (Platform.OS === 'ios') {
              // iOS adjustment for device orientation
              heading = (360 - heading) % 360;
            } else {
              // Android adjustment
              heading = (heading + 90) % 360;
            }
            
            setDeviceDirection(heading);
          });
        }
      } catch (error) {
        console.error("Error starting compass:", error);
        setCompassAvailable(false);
      }
    };

    if (Platform.OS !== 'web') {
      startCompass();
    } else {
      setCompassAvailable(false);
    }

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  // Calculate the relative angle to Qibla
  const calculateQiblaAngle = () => {
    if (qiblaDirection === null) return 0;
    
    // The angle between device direction and Qibla direction
    let relativeAngle = qiblaDirection - deviceDirection;
    
    // Normalize to 0-360
    if (relativeAngle < 0) {
      relativeAngle += 360;
    }
    
    return relativeAngle;
  };

  return {
    qiblaDirection,
    deviceDirection,
    qiblaAngle: calculateQiblaAngle(),
    compassAvailable,
    isLoading: qiblaQuery.isLoading,
    error: qiblaQuery.error,
  };
}