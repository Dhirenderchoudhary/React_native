import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/core/ui/Icon";
import { ProfileAvatarButton } from "@/modules/profile/components/ProfileDrawer";
import { SafetyGauge } from "@/modules/drive/components/SafetyGauge";
import { SensorPillRow } from "@/modules/drive/components/SensorPillRow";
import { EventFeed } from "@/modules/drive/components/EventFeed";
import { EndDriveButton } from "@/modules/drive/components/EndDriveButton";
import { useThemedDialog } from "@/core/ui/ThemedDialog";
import { useProfile } from "@/core/hooks/useProfile";
import { useDriveStore } from "@/shared/driveStore";
import {
  startActiveDrive,
  endActiveDrive,
  discardActiveDrive,
  recoverActiveDrive,
} from "@/modules/drive/activeDrive";
import { colors, layout, spacing, type } from "@/core/theme";

const END_ACTION_HEIGHT = 72;

export default function ActiveDriveRoute() {
  const router = useRouter();
  const { profile } = useProfile();

  const driveId = useDriveStore((s) => s.driveId);
  const startedAt = useDriveStore((s) => s.startedAt);
  const score = useDriveStore((s) => s.score);
  const events = useDriveStore((s) => s.events);
  const sensors = useDriveStore((s) => s.sensors);
  const start = useDriveStore((s) => s.start);
  const end = useDriveStore((s) => s.end);

  const [busy, setBusy] = useState(false);
  const { dialog, showDialog } = useThemedDialog();
  const recordPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const existing = await recoverActiveDrive();
      if (!mounted) return;
      if (existing) {
        start(existing.id, existing.started_at);
      } else {
        try {
          setBusy(true);
          const drive = await startActiveDrive();
          if (mounted) start(drive.id, drive.started_at);
        } catch (err) {
          showDialog({
            title: "Could not start drive",
            message: String(err),
            actions: [{ label: "Go back", onPress: () => router.back() }],
          });
        } finally {
          if (mounted) setBusy(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router, start]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(recordPulse, {
          toValue: 0.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(recordPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [recordPulse]);

  const handleEndDrive = useCallback(() => {
    if (!driveId || !startedAt) return;
    showDialog({
      title: "End drive?",
      message: "Save this drive and view your summary.",
      actions: [
      { label: "Keep driving", tone: "cancel" },
      {
        label: "End and save",
        tone: "danger",
        onPress: async () => {
          try {
            setBusy(true);
            const completedDrive = await endActiveDrive(driveId, startedAt);
            end();
            router.replace({
              pathname: "/drive/complete",
              params: { driveId: completedDrive?.id ?? driveId },
            });
          } catch (err) {
            showDialog({ title: "Could not end drive", message: String(err) });
          } finally {
            setBusy(false);
          }
        },
      },
      {
        label: "Discard ride",
        tone: "danger",
        onPress: async () => {
          try {
            setBusy(true);
            await discardActiveDrive(driveId);
            end();
            router.replace("/(tabs)/drive");
          } catch (err) {
            showDialog({ title: "Could not discard", message: String(err) });
          } finally {
            setBusy(false);
          }
        },
      },
      ],
    });
  }, [driveId, startedAt, end, router, showDialog]);

  const endBarBottom = 12;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View
        style={[styles.content, { marginBottom: endBarBottom + END_ACTION_HEIGHT }]}
      >
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconSlot}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to Drive"
          >
            <Icon name="arrow_back" size={20} color={colors.ink.primary} />
          </Pressable>
          <Text style={[type.headline, styles.title]}>CLUTCH</Text>
          <View style={styles.avatarSlot}>
            <ProfileAvatarButton />
          </View>
        </View>

        <View style={styles.headerStats}>
          <View style={styles.headerLeft}>
            <View style={styles.recordingRow}>
              <Animated.View
                style={[styles.recordDot, { opacity: recordPulse }]}
              />
              <Text style={[type.micro, styles.recordingLabel]}>
                Recording
              </Text>
            </View>
            <Text style={[type.caption, styles.driverLabel]} numberOfLines={1}>
              {profile ? profile.name : "Driver"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[type.micro, styles.eventsLabel]}>
              Events Detected
            </Text>
            <View style={styles.eventsPill}>
              <Text
                style={[
                  type.headline,
                  {
                    color: events.length > 0 ? colors.status.danger : colors.ink.primary,
                    fontVariant: ["tabular-nums"],
                  },
                ]}
              >
                {events.length}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.gaugeWrap}>
          <SafetyGauge score={score} size={260} />
        </View>

        <View style={styles.sensorsWrap}>
          <SensorPillRow sensors={sensors} />
        </View>

        <EventFeed events={events} />
      </View>

      <View
        style={[styles.endBar, { bottom: endBarBottom }]}
      >
        <EndDriveButton onPress={handleEndDrive} />
      </View>
      {dialog}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.canvas,
  },
  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
    gap: spacing[4],
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  iconSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.4)",
  },
  title: {
    color: colors.ink.primary,
    letterSpacing: 1.5,
  },
  avatarSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: colors.bg.raised,
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 12,
  },
  headerLeft: {
    gap: 6,
  },
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.danger,
    shadowColor: colors.status.danger,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  recordingLabel: {
    color: colors.ink.tertiary,
  },
  driverLabel: {
    color: colors.ink.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  eventsLabel: {
    color: colors.ink.tertiary,
  },
  eventsPill: {
    minWidth: 56,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.bg.surface,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  gaugeWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  sensorsWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  endBar: {
    position: "absolute",
    left: layout.screenPaddingX,
    right: layout.screenPaddingX,
    minHeight: END_ACTION_HEIGHT,
    justifyContent: "center",
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    backgroundColor: "rgba(26,28,31,0.98)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
  },
});
