import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ExpoSplash from "expo-splash-screen";
import { colors } from "@/core/theme";
import { getOnboarded } from "@/shared/asyncFlags";

ExpoSplash.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const router = useRouter();
  const [bootStage, setBootStage] = useState<"checking" | "ready">("checking");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const onboarded = await getOnboarded();
        if (!mounted) return;
        if (onboarded) {
          router.replace("/(tabs)");
        }
      } catch {
      } finally {
        if (mounted) setBootStage("ready");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    const t = setTimeout(() => {
      ExpoSplash.hideAsync().catch(() => undefined);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (bootStage === "checking") {
    return <View style={styles.boot} />;
  }

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.canvas },
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
        initialRouteName="index"
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/profile" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.canvas },
  boot: { flex: 1, backgroundColor: colors.bg.canvas },
});
