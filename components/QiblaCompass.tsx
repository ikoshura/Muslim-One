import React from "react";
import { StyleSheet, View, Text, Dimensions, Platform } from "react-native";
import Svg, { Circle, Line, Text as SvgText, G } from "react-native-svg";

import Colors from "@/constants/colors";
import { useAppSettings } from "@/hooks/useAppSettings";

interface QiblaCompassProps {
  qiblaDirection: number | null;
  deviceDirection: number;
  compassAvailable: boolean;
}

export default function QiblaCompass({ 
  qiblaDirection, 
  deviceDirection, 
  compassAvailable 
}: QiblaCompassProps) {
  const { currentTheme } = useAppSettings();
  const colors = Colors[currentTheme];
  
  const { width } = Dimensions.get("window");
  const size = Math.min(width - 40, 300);
  const center = size / 2;
  const radius = size / 2 - 20;
  
  // Draw compass directions
  const directions = [
    { angle: 0, label: "N" },
    { angle: 90, label: "E" },
    { angle: 180, label: "S" },
    { angle: 270, label: "W" },
  ];
  
  // Calculate position for direction labels
  const getPosition = (angle: number, distance: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: center + distance * Math.cos(radians),
      y: center + distance * Math.sin(radians),
    };
  };
  
  // Calculate the compass rotation (opposite of device direction to keep compass fixed)
  const compassRotation = -deviceDirection;
  
  // Calculate Qibla indicator position relative to true north
  const qiblaAngle = qiblaDirection || 0;
  
  // Calculate the difference between Qibla and device heading for accuracy indicator
  const qiblaDeviceDiff = qiblaDirection ? Math.abs(qiblaDirection - deviceDirection) : 0;
  const isAligned = qiblaDeviceDiff < 5 || qiblaDeviceDiff > 355; // Within 5 degrees
  
  if (!compassAvailable && Platform.OS !== 'web') {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.errorText, { color: colors.notification }]}>
          Compass sensor not available on this device
        </Text>
      </View>
    );
  }
  
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.errorText, { color: colors.notification }]}>
          Compass functionality is not available on web
        </Text>
        {qiblaDirection !== null && (
          <Text style={[styles.qiblaText, { color: colors.text }]}>
            Qibla direction: {qiblaDirection.toFixed(1)}°
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth="1"
          fill="none"
        />
        
        {/* Inner circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius * 0.8}
          stroke={colors.border}
          strokeWidth="0.5"
          fill="none"
        />
        
        {/* Rotating compass with direction labels */}
        <G rotation={compassRotation} origin={`${center}, ${center}`}>
          {directions.map((dir) => {
            const pos = getPosition(dir.angle, radius * 0.9);
            return (
              <SvgText
                key={dir.label}
                x={pos.x}
                y={pos.y}
                fontSize="14"
                fontWeight="bold"
                fill={dir.label === "N" ? colors.primary : colors.text}
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {dir.label}
              </SvgText>
            );
          })}
          
          {/* Degree markers */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const isMajor = angle % 30 === 0;
            const markerLength = isMajor ? 10 : 5;
            const outerPos = getPosition(angle, radius);
            const innerPos = getPosition(angle, radius - markerLength);
            
            return (
              <Line
                key={`marker-${i}`}
                x1={innerPos.x}
                y1={innerPos.y}
                x2={outerPos.x}
                y2={outerPos.y}
                stroke={isMajor ? colors.text : colors.border}
                strokeWidth={isMajor ? 1.5 : 0.5}
              />
            );
          })}
        </G>
        
        {/* North indicator (fixed to compass) */}
        <G rotation={compassRotation} origin={`${center}, ${center}`}>
          <Line
            x1={center}
            y1={center - radius * 0.2}
            x2={center}
            y2={center - radius * 0.7}
            stroke={colors.primary}
            strokeWidth="2"
          />
          <Circle
            cx={center}
            cy={center - radius * 0.7}
            r="4"
            fill={colors.primary}
          />
        </G>
        
        {/* South indicator (fixed to compass) */}
        <G rotation={compassRotation} origin={`${center}, ${center}`}>
          <Line
            x1={center}
            y1={center + radius * 0.2}
            x2={center}
            y2={center + radius * 0.7}
            stroke={colors.text}
            strokeWidth="2"
          />
        </G>
        
        {/* Qibla direction indicator (fixed to true north) */}
        {qiblaDirection !== null && (
          <G rotation={qiblaAngle} origin={`${center}, ${center}`}>
            <Line
              x1={center}
              y1={center}
              x2={center}
              y2={center - radius * 0.8}
              stroke={isAligned ? colors.accent : colors.highlight}
              strokeWidth="3"
            />
            <Circle
              cx={center}
              cy={center - radius * 0.8}
              r="8"
              fill={isAligned ? colors.accent : colors.highlight}
            />
            {/* Qibla label */}
            <SvgText
              x={center}
              y={center - radius * 0.6}
              fontSize="12"
              fontWeight="bold"
              fill={isAligned ? colors.accent : colors.highlight}
              textAnchor="middle"
              alignmentBaseline="central"
            >
              QIBLA
            </SvgText>
          </G>
        )}
        
        {/* Center dot */}
        <Circle
          cx={center}
          cy={center}
          r="8"
          fill={colors.background}
          stroke={colors.border}
          strokeWidth="1"
        />
      </Svg>
      
      {qiblaDirection !== null && (
        <View style={styles.infoContainer}>
          <View style={styles.directionInfo}>
            <Text style={[styles.directionText, { color: colors.text }]}>
              Qibla: {qiblaDirection.toFixed(1)}°
            </Text>
            <Text style={[styles.directionText, { color: colors.text }]}>
              Heading: {deviceDirection.toFixed(1)}°
            </Text>
          </View>
          
          {isAligned && (
            <View style={[styles.alignmentIndicator, { backgroundColor: colors.accent }]}>
              <Text style={[styles.alignmentText, { color: colors.background }]}>
                ✓ Aligned with Qibla
              </Text>
            </View>
          )}
          
          <Text style={[styles.instructionText, { color: colors.text }]}>
            Hold your device flat and rotate until the green arrow points up
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  infoContainer: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  directionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  alignmentIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  alignmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  instructionText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
    marginTop: 5,
  },
  directionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  qiblaText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});