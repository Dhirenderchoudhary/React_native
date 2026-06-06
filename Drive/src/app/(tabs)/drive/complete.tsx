import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/core/ui/Screen";
import { Icon } from "@/core/ui/Icon";
import { TactileButton } from "@/core/ui/TactileButton";
import { colors, layout, radius, type } from "@/core/theme";

export default function DriveCompleteRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ driveId?: string }>();

  return (
    <Screen background="canvas" padded>
      <View style={styles.root}>
        <View style={styles.card}>
          <View style={styles.glow}>
            <Icon name="check" size={48} color={colors.ink.inverse} />
          </View>
          <Text style={[type.title, styles.title]}>Drive Complete</Text>
          <Text style={[type.body, styles.sub]}>
            Your ride has been saved. Open its analytics to review score, events, and
            driving feedback.
          </Text>
        </View>
        <TactileButton
          label={params.driveId ? "View Ride Analytics" : "View Past Rides"}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() =>
            params.driveId
              ? router.replace({
                  pathname: "/analytics/[driveId]",
                  params: { driveId: params.driveId },
                })
              : router.replace("/(tabs)/analytics")
          }
          trailingIcon="chevron_right"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
    gap: 24,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: colors.bg.surface,
    borderRadius: radius["2xl"],
    padding: layout.cardPadding,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  glow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.bg.raised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
  },
  title: {
    color: colors.ink.primary,
    textAlign: "center",
  },
  sub: {
    color: colors.ink.tertiary,
    textAlign: "center",
  },
});
