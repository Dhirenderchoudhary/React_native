import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { colors, type } from "@/core/theme";

export type SafetyGaugeProps = {
  score: number;
  size?: number;
};

export function SafetyGauge({ score, size = 260 }: SafetyGaugeProps) {
  const strokeWidth = 6;
  const padding = 2;
  const radius = (size - strokeWidth) / 2 - padding;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const progress = clamped / 100;
  const offset = circumference * (1 - progress);
  const center = size / 2;

  const fillColor =
    clamped >= 90
      ? colors.accent.ivory
      : clamped >= 75
        ? colors.score.good
        : clamped >= 60
          ? colors.score.fair
          : colors.score.poor;

  const glowColor =
    clamped >= 90
      ? "rgba(229,226,218,0.35)"
      : clamped >= 75
        ? "rgba(168,217,122,0.35)"
        : clamped >= 60
          ? "rgba(241,181,74,0.35)"
          : "rgba(239,91,91,0.35)";

  const scoreAnim = clamped;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.bezel,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${size} ${size}`}
      >
        <G transform={`rotate(-90 ${center} ${center})`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.bg.surface}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius + 3}
            stroke={glowColor}
            strokeWidth={strokeWidth + 2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity={0.4}
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={fillColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </G>
      </Svg>
      <View
        style={[
          styles.hub,
          {
            width: size * 0.71,
            height: size * 0.71,
            borderRadius: (size * 0.71) / 2,
          },
        ]}
      >
        <Text
          style={[
            type.metric,
            styles.score,
            { color: colors.ink.primary, fontSize: size * 0.26, lineHeight: size * 0.28 },
          ]}
        >
          {clamped}
        </Text>
        <Text style={[type.micro, styles.label]}>Safety Score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  bezel: {
    position: "absolute",
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.15)", // neon blue border
    shadowColor: "#00f0ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  hub: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 5, 5, 0.8)", // glass hub
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.2)",
    shadowColor: "#b026ff", // neon purple core
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  score: {
    letterSpacing: -2,
  },
  label: {
    color: colors.ink.tertiary,
    marginTop: 6,
    letterSpacing: 1.4,
  },
});
