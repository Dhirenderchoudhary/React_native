import React from "react";
import { Tabs } from "expo-router";
import { Icon, type IconName } from "@/core/ui/Icon";
import { colors, type } from "@/core/theme";
import { Platform, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DriveTelemetryBridge } from "@/modules/drive/components/DriveTelemetryBridge";
import { ProfileDrawerShell } from "@/modules/profile/components/ProfileDrawer";

type TabConfig = {
  name: string;
  title: string;
  icon: IconName;
  label: string;
};

const TABS: TabConfig[] = [
  { name: "index", title: "Home", icon: "home", label: "Home" },
  { name: "drive", title: "Drive", icon: "run", label: "Drive" },
  { name: "analytics", title: "Analytics", icon: "analytics", label: "Insights" },
  { name: "settings", title: "Settings", icon: "settings", label: "Settings" },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(
    insets.bottom,
    Platform.select({ ios: 16, android: 12, default: 12 }) ?? 12,
  );
  return (
    <ProfileDrawerShell>
      <DriveTelemetryBridge />
      <Tabs
        screenOptions={({ route }) => {
          const cfg = TABS.find((t) => t.name === route.name);
          return {
            headerShown: false,
            tabBarShowLabel: true,
            tabBarStyle: [styles.bar, { marginBottom: bottomGap }],
            tabBarActiveTintColor: colors.ink.primary,
            tabBarInactiveTintColor: colors.ink.tertiary,
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={[
                  type.micro,
                  { color, opacity: focused ? 1 : 0.7, marginTop: 2 },
                ]}
              >
                {cfg?.label ?? route.name}
              </Text>
            ),
            tabBarIcon: ({ color }) => (
              <Icon
                name={cfg?.icon ?? "home"}
                size={22}
                color={String(color)}
              />
            ),
          };
        }}
      >
        {TABS.map((t) => (
          <Tabs.Screen
            key={t.name}
            name={t.name}
            options={{ title: t.title }}
          />
        ))}
        <Tabs.Screen name="history" options={{ href: null }} />
      </Tabs>
    </ProfileDrawerShell>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 68,
    marginHorizontal: 16,
    backgroundColor: colors.bg.surface,
    borderTopWidth: 0,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.hairline,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
});
