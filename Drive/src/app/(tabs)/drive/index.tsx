import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "@/core/ui/Screen";
import { Icon } from "@/core/ui/Icon";
import { TactileButton } from "@/core/ui/TactileButton";
import { useThemedDialog } from "@/core/ui/ThemedDialog";
import { ProfileAvatarButton } from "@/modules/profile/components/ProfileDrawer";
import { recoverActiveDrive } from "@/modules/drive/activeDrive";
import { drivesRepo, type Drive } from "@/core/db/connect";
import { useDriveStore } from "@/shared/driveStore";
import { colors, layout, radius, spacing, type } from "@/core/theme";

export default function DriveIndex() {
  const router = useRouter();
  const driveId = useDriveStore((state) => state.driveId);
  const startedAt = useDriveStore((state) => state.startedAt);
  const start = useDriveStore((state) => state.start);
  const [history, setHistory] = useState<Drive[]>([]);
  const { dialog, showDialog } = useThemedDialog();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      Promise.all([recoverActiveDrive(), drivesRepo.listDrives(6)])
        .then(([activeDrive, drives]) => {
          if (!mounted) return;
          if (activeDrive) start(activeDrive.id, activeDrive.started_at);
          setHistory(drives.filter((drive) => drive.status === "completed"));
        })
        .catch(() => undefined);
      return () => {
        mounted = false;
      };
    }, [start]),
  );

  const isActive = Boolean(driveId);
  const openRide = () => router.push("/drive/active");
  const openRideInsights = useCallback(
    (drive: Drive) => {
      router.prefetch({
        pathname: "/analytics/[driveId]",
        params: { driveId: drive.id },
      });
      router.push({
        pathname: "/analytics/[driveId]",
        params: {
          driveId: drive.id,
          startedAt: String(drive.started_at),
          score: String(drive.score),
          durationS: String(drive.duration_s),
          safetyRating: drive.safety_rating ?? "",
          avgSpeedKph: String(drive.avg_speed_kph),
          maxSpeedKph: String(drive.max_speed_kph),
        },
      });
    },
    [router],
  );

  return (
    <Screen background="canvas" padded={false} edges={["top"]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.avatarSlot}>
            <ProfileAvatarButton />
          </View>
          <View style={styles.headerLeft}>
            <View style={styles.brandCopy}>
              <Text style={[type.micro, styles.brand]}>CLUTCH</Text>
              <Text style={[type.caption, styles.tagline]}>Driver Safety</Text>
            </View>
            <View style={styles.logoDisc}>
              <Icon name="drive" size={22} color={colors.ink.inverse} />
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole={isActive ? "button" : undefined}
            accessibilityLabel={isActive ? "Open active ride" : undefined}
            disabled={!isActive}
            onPress={openRide}
            style={({ pressed }) => [
              styles.heroCard,
              isActive && styles.heroCardActive,
              pressed && styles.heroCardPressed,
            ]}
          >
            <LinearGradient
              colors={['#2c2f33', '#1a1c1f', '#131517']}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
              style={styles.heroBevel}
            />
            <LinearGradient
              colors={isActive ? ['#d8d5cc', '#b0ada7'] : ['#f0ede5', '#cbc7be']}
              style={[styles.heroGlow, isActive && styles.heroGlowActive]}
            >
              <Icon
                name={isActive ? "speed" : "shield_check"}
                size={isActive ? 56 : 64}
                color={colors.ink.inverse}
              />
            </LinearGradient>
            <View style={styles.heroCopy}>
              <Text style={[type.headline, styles.heroTitle]}>
                {isActive ? "Active Ride" : "Ready to Drive"}
              </Text>
              <Text style={[type.body, styles.heroSub]}>
                {isActive
                  ? "Recording your drive. Tap to view live details."
                  : "Pull away when you are ready to begin."}
              </Text>
              {isActive ? (
                <View style={styles.activeMeta}>
                  <View style={styles.recordDot} />
                  <Text style={[type.micro, styles.activeMetaText]}>
                    Recording · {startedAt ? formatElapsed(startedAt) : "0m"}
                  </Text>
                  <Icon name="chevron_right" size={16} color={colors.ink.secondary} />
                </View>
              ) : null}
            </View>
          </Pressable>

          <View style={styles.historyHeader}>
            <Text style={[type.micro, styles.historyEyebrow]}>HISTORY</Text>
            <Text style={[type.caption, styles.historyCount]}>
              {history.length ? `${history.length} recent` : "No rides yet"}
            </Text>
          </View>

          <View style={styles.historyList}>
            {history.length ? (
              history.map((drive) => (
                <HistoryCard
                  key={drive.id}
                  drive={drive}
                  onPress={() => openRideInsights(drive)}
                  onPressIn={() =>
                    router.prefetch({
                      pathname: "/analytics/[driveId]",
                      params: { driveId: drive.id },
                    })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Icon name="history" size={20} color={colors.ink.tertiary} />
                <Text style={[type.caption, styles.emptyText]}>
                  Completed rides will appear here.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TactileButton
            label={isActive ? "Go to Active Ride" : "Start Drive"}
            variant="primary"
            size="lg"
            fullWidth
            onPress={openRide}
            leadingIcon={isActive ? "speed" : "play"}
            trailingIcon="chevron_right"
          />
          <Pressable
            style={styles.secondaryLink}
            onPress={() =>
              showDialog({
                title: "How Clutch works",
                message:
                  "Clutch reads accelerometer, gyroscope, and GPS while the app is open during a ride. Harsh events are detected locally and scored.",
              })
            }
            accessibilityRole="button"
          >
            <Icon name="info" size={14} color={colors.ink.tertiary} />
            <Text style={[type.caption, styles.secondaryText]}>How scoring works</Text>
          </Pressable>
        </View>
        {dialog}
      </View>
    </Screen>
  );
}

function HistoryCard({
  drive,
  onPress,
  onPressIn,
}: {
  drive: Drive;
  onPress: () => void;
  onPressIn?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open ride insights"
      onPress={onPress}
      onPressIn={onPressIn}
      style={({ pressed }) => [styles.historyCard, pressed && styles.historyCardPressed]}
    >
      <LinearGradient
        colors={['#1e2124', '#161819']}
        style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
      />
      <LinearGradient
        colors={['#2a2d30', '#1c1f22']}
        style={styles.historyIcon}
      >
        <Icon name="route" size={18} color={colors.accent.ivory} />
      </LinearGradient>
      <View style={styles.historyCardCopy}>
        <Text style={[type.bodyStrong, styles.historyTitle]}>
          {new Date(drive.started_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Text style={[type.caption, styles.historySub]}>
          {formatDuration(drive.duration_s)} · {drive.safety_rating ?? "Rated drive"}
        </Text>
      </View>
      <LinearGradient
        colors={['#0a0b0d', '#111315']}
        style={styles.scoreChip}
      >
        <Text style={[type.numeric, styles.scoreText]}>{drive.score}</Text>
      </LinearGradient>
      <Icon name="chevron_right" size={17} color={colors.ink.tertiary} />
    </Pressable>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}m`;
}

function formatElapsed(startedAt: number) {
  return formatDuration((Date.now() - startedAt) / 1000);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[5],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  logoDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  brandCopy: {
    alignItems: "flex-end",
  },
  brand: {
    color: colors.ink.primary,
    letterSpacing: 2,
  },
  tagline: {
    color: colors.ink.tertiary,
    marginTop: 2,
  },
  avatarSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing[4],
    paddingBottom: 156,
  },
  heroCard: {
    minHeight: 212,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[5],
    overflow: "hidden",
    padding: spacing[5],
    borderRadius: radius["2xl"],
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(0,0,0,0.50)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.70,
    shadowRadius: 28,
  },
  heroCardActive: {
    borderColor: colors.line.strong,
  },
  heroCardPressed: {
    opacity: 0.86,
  },
  heroBevel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  heroGlow: {
    width: 104,
    height: 104,
    borderRadius: 52,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  heroGlowActive: {},
  heroCopy: {
    flex: 1,
    gap: spacing[2],
  },
  heroTitle: {
    color: colors.ink.primary,
  },
  heroSub: {
    color: colors.ink.tertiary,
  },
  activeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginTop: spacing[1],
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.danger,
  },
  activeMetaText: {
    flex: 1,
    color: colors.ink.secondary,
    letterSpacing: 1,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[2],
    paddingHorizontal: spacing[1],
  },
  historyEyebrow: {
    color: colors.ink.tertiary,
  },
  historyCount: {
    color: colors.ink.muted,
  },
  historyList: {
    gap: spacing[3],
  },
  historyCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    overflow: "hidden",
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(0,0,0,0.40)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 12,
  },
  historyCardPressed: { opacity: 0.76 },
  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  historyCardCopy: {
    flex: 1,
  },
  historyTitle: {
    color: colors.ink.primary,
  },
  historySub: {
    color: colors.ink.tertiary,
    marginTop: spacing[1],
    textTransform: "capitalize",
  },
  scoreChip: {
    minWidth: 44,
    alignItems: "center",
    paddingHorizontal: spacing[2],
    paddingVertical: spacing["1.5"],
    borderRadius: radius.full,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.85)',
  },
  scoreText: {
    color: colors.ink.primary,
  },
  emptyCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.hairline,
  },
  emptyText: {
    color: colors.ink.tertiary,
  },
  footer: {
    position: "absolute",
    left: layout.screenPaddingX,
    right: layout.screenPaddingX,
    bottom: spacing[3],
    gap: spacing[2],
  },
  secondaryLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["1.5"],
    paddingVertical: spacing[2],
  },
  secondaryText: {
    color: colors.ink.tertiary,
  },
});
