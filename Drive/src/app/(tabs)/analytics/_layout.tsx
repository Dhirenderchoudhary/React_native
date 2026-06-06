import React from "react";
import { Stack } from "expo-router";
import { colors } from "@/core/theme";

export default function InsightsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.canvas },
        animation: "slide_from_right",
        animationDuration: 180,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[driveId]" />
    </Stack>
  );
}
