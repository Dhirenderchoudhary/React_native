import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Screen } from "@/core/ui/Screen";
import { Icon } from "@/core/ui/Icon";
import { PermissionCard } from "@/core/ui/PermissionCard";
import { TactileButton } from "@/core/ui/TactileButton";
import { usePermissions } from "@/core/hooks/usePermissions";
import { setPermissionsGranted } from "@/shared/asyncFlags";
import { colors, layout, radius, spacing, type } from "@/core/theme";

export default function SplashPermissionsRoute() {
  const router = useRouter();
  const { state, busy, allGranted, requestAll, refresh } = usePermissions();
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleContinue = async () => {
    Haptics.selectionAsync().catch(() => undefined);
    if (!allGranted) {
      setRequesting(true);
      try {
        const ok = await requestAll();
        if (!ok) return;
        await setPermissionsGranted(true);
      } finally {
        setRequesting(false);
      }
    }
    router.push("/onboarding/profile");
  };

  return (
    <Screen background="canvas" padded={false} edges={["top", "bottom"]}>
      <View style={styles.root}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.logoWrap}>
            <Icon name="shield" size={16} color={colors.ink.inverse} />
          </View>
          <Text style={styles.wordmark}>CLUTCH</Text>
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>SETUP · 1 OF 2</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.orbOuter}>
            <View style={styles.orbMid}>
              <View style={styles.orbInner}>
                <Icon name="shield_check" size={56} color={colors.accent.ivory} />
              </View>
            </View>
            {/* Tick marks around the ring */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <View
                key={deg}
                style={[styles.tick, { transform: [{ rotate: `${deg}deg` }] }]}
              />
            ))}
          </View>

          <View style={styles.heroText}>
            <Text style={styles.headline}>Drive with Clarity</Text>
            <Text style={styles.sub}>
              Real-time analysis of every turn, brake, and acceleration — built to make you a safer driver.
            </Text>
          </View>
        </View>

        {/* Permission cards */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REQUIRED PERMISSIONS</Text>
          <View style={styles.cards}>
            <PermissionCard
              icon="location_on"
              title="Location"
              description="Logs your route and detects harsh driving events."
              status={state.location}
              onRequest={requestAll}
              busy={busy}
            />
            <PermissionCard
              icon="run"
              title="Motion & Fitness"
              description="Detects harsh braking, sharp turns, and phone movement."
              status={state.motion}
              onRequest={requestAll}
              busy={busy}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TactileButton
            label={allGranted ? "Continue" : "Grant & Continue"}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleContinue}
            loading={busy || requesting}
            trailingIcon="chevron_right"
          />
          <View style={styles.privacyRow}>
            <Icon name="lock" size={12} color={colors.ink.muted} />
            <Text style={styles.privacyText}>
              All sensor data stays on your device.
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const ORB_OUTER = 196;
const ORB_MID   = 152;
const ORB_INNER = 112;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
    paddingBottom: spacing[6],
    gap: spacing[6],
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.accent.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    ...type.label,
    color: colors.ink.primary,
    letterSpacing: 3,
    flex: 1,
  },
  stepPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line.soft,
    backgroundColor: colors.bg.raised,
  },
  stepText: {
    ...type.micro,
    color: colors.ink.muted,
    letterSpacing: 1,
  },

  // Hero orb
  hero: {
    alignItems: "center",
    gap: spacing[5],
  },
  orbOuter: {
    width: ORB_OUTER,
    height: ORB_OUTER,
    borderRadius: ORB_OUTER / 2,
    borderWidth: 1,
    borderColor: colors.line.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  orbMid: {
    width: ORB_MID,
    height: ORB_MID,
    borderRadius: ORB_MID / 2,
    borderWidth: 1,
    borderColor: colors.line.strong,
    backgroundColor: colors.bg.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  orbInner: {
    width: ORB_INNER,
    height: ORB_INNER,
    borderRadius: ORB_INNER / 2,
    backgroundColor: colors.bg.raised,
    borderWidth: 1,
    borderColor: colors.line.strong,
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    position: "absolute",
    width: 1,
    height: 8,
    top: 2,
    left: (ORB_OUTER / 2) - 0.5,
    backgroundColor: colors.line.strong,
    borderRadius: 1,
    transformOrigin: `0.5px ${ORB_OUTER / 2 - 2}px`,
  },

  // Hero text
  heroText: {
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
  headline: {
    ...type.title,
    color: colors.ink.primary,
    textAlign: "center",
  },
  sub: {
    ...type.body,
    color: colors.ink.tertiary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Section
  section: { gap: spacing[2] },
  sectionLabel: {
    ...type.micro,
    color: colors.ink.muted,
    letterSpacing: 1.5,
    paddingLeft: spacing[1],
  },
  cards: { gap: spacing[2] },

  // Footer
  footer: {
    marginTop: "auto",
    gap: spacing[3],
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  privacyText: {
    ...type.caption,
    color: colors.ink.muted,
  },
});
