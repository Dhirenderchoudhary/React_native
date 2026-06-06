import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AiCoachCard } from "@/modules/analytics/components/AiCoachCard";
import { Icon } from "@/core/ui/Icon";
import { Screen } from "@/core/ui/Screen";
import { generateRideCoaching } from "@/modules/analytics/groq";
import {
  EVENT_LABELS,
  EVENT_TYPES,
  getRideInsights,
} from "@/modules/analytics/insights";
import type { Drive, DriveEvent, DriveStatus, EventType } from "@/core/db/connect";
import { colors, layout, radius, spacing, type } from "@/core/theme";

const EMPTY_COUNTS = Object.fromEntries(EVENT_TYPES.map((eventType) => [eventType, 0])) as Record<
  EventType,
  number
>;

export default function RideInsightsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const driveId = firstParam(params.driveId);
  const [drive, setDrive] = useState<Drive | null>(() => driveFromParams(params));
  const [events, setEvents] = useState<DriveEvent[]>([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const generate = useCallback(() => {
    if (!drive) return Promise.reject(new Error("Ride insights are still loading"));
    return generateRideCoaching(drive, events, counts);
  }, [counts, drive, events]);

  useEffect(() => {
    if (!driveId) return;
    getRideInsights(driveId)
      .then((result) => {
        setDrive(result.drive);
        setEvents([...result.events].sort((a, b) => b.ts - a.ts));
        setCounts(result.counts);
      })
      .catch(() => undefined);
  }, [driveId]);

  return (
    <Screen background="canvas" padded={false} edges={["top"]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow_back" size={20} color={colors.ink.primary} />
          </Pressable>
          <Text style={styles.brand}>RIDE INSIGHTS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scoreCard}>
            <View>
              <Text style={styles.eyebrow}>SAFETY SCORE</Text>
              <Text style={styles.score}>{drive?.score ?? "--"}</Text>
            </View>
            <View style={styles.scoreCopy}>
              <Text style={styles.rideDate}>
                {drive
                  ? new Date(drive.started_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Loading ride"}
              </Text>
              <Text style={styles.rideMeta}>
                {formatDuration(drive?.duration_s ?? 0)} · {drive?.safety_rating ?? "processing"}
              </Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <Metric label="EVENTS" value={String(events.length)} />
            <Metric label="AVG SPEED" value={`${Math.round(drive?.avg_speed_kph ?? 0)}`} unit="km/h" />
            <Metric label="MAX SPEED" value={`${Math.round(drive?.max_speed_kph ?? 0)}`} unit="km/h" />
          </View>

          <View style={styles.ivoryCard}>
            <Text style={styles.ivoryHeading}>Event Breakdown</Text>
            <View style={styles.breakdownList}>
              {EVENT_TYPES.filter((eventType) => counts[eventType] > 0).map((eventType) => (
                <View key={eventType} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{EVENT_LABELS[eventType]}</Text>
                  <Text style={styles.breakdownCount}>{counts[eventType]}</Text>
                </View>
              ))}
              {events.length === 0 ? (
                <Text style={styles.emptyIvory}>No unsafe events detected on this ride.</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.ivoryCard}>
            <Text style={styles.ivoryHeading}>Ride Event Log</Text>
            <View style={styles.timeline}>
              {events.length ? (
                events.map((event) => (
                  <View key={event.id} style={styles.timelineRow}>
                    <View style={styles.timelineIcon}>
                      <Icon name={eventIcon(event.type)} size={17} color={colors.ink.secondary} />
                    </View>
                    <View style={styles.timelineCopy}>
                      <Text style={styles.timelineTitle}>{EVENT_LABELS[event.type]}</Text>
                      <Text style={styles.timelineSub}>
                        {new Date(event.ts).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · -{event.penalty} score
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyIvory}>Smooth ride. No event rows to show.</Text>
              )}
            </View>
          </View>

          <AiCoachCard title="AI Ride Feedback" generate={generate} />
        </ScrollView>
      </View>
    </Screen>
  );
}

function driveFromParams(params: Record<string, string | string[] | undefined>) {
  const driveId = firstParam(params.driveId);
  const startedAt = firstParam(params.startedAt);
  if (!driveId || !startedAt) return null;
  return {
    id: driveId,
    started_at: Number(startedAt),
    ended_at: null,
    status: "completed" as DriveStatus,
    score: Number(firstParam(params.score) ?? 0),
    safety_rating: firstParam(params.safetyRating) || null,
    distance_m: 0,
    duration_s: Number(firstParam(params.durationS) ?? 0),
    max_speed_kph: Number(firstParam(params.maxSpeedKph) ?? 0),
    avg_speed_kph: Number(firstParam(params.avgSpeedKph) ?? 0),
    start_lat: null,
    start_lng: null,
    end_lat: null,
    end_lng: null,
    notes: null,
    ai_feedback: null,
  };
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function eventIcon(eventType: EventType) {
  switch (eventType) {
    case "harsh_brake":
      return "brake";
    case "harsh_accel":
      return "accel";
    case "sharp_turn":
    case "aggressive_steer":
      return "steering";
    case "phone_handling":
      return "phone";
    default:
      return "device";
  }
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {value}
        {unit ? <Text style={styles.metricUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function formatDuration(seconds: number) {
  return `${Math.max(1, Math.round(seconds / 60))}m`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.canvas },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.bg.surface,
  },
  headerSpacer: { width: 40 },
  brand: { ...type.subhead, color: colors.ink.primary, letterSpacing: 1.4 },
  content: { gap: spacing[4], padding: layout.screenPaddingX, paddingBottom: 112 },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing[5],
    borderRadius: radius["2xl"],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    backgroundColor: colors.bg.raised,
  },
  eyebrow: { ...type.micro, color: colors.ink.tertiary },
  score: { ...type.metric, color: colors.ink.primary, marginTop: spacing[1] },
  scoreCopy: { alignItems: "flex-end" },
  rideDate: { ...type.bodyStrong, color: colors.ink.primary },
  rideMeta: { ...type.caption, color: colors.ink.tertiary, marginTop: spacing[1], textTransform: "capitalize" },
  metricRow: { flexDirection: "row", gap: spacing[3] },
  metric: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    backgroundColor: colors.bg.surface,
  },
  metricLabel: { ...type.micro, color: colors.ink.tertiary, fontSize: 9 },
  metricValue: { ...type.headline, color: colors.ink.primary, marginTop: spacing[1] },
  metricUnit: { ...type.caption, color: colors.ink.tertiary },
  ivoryCard: { gap: spacing[4], padding: spacing[5], borderRadius: radius["2xl"], borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line.soft, backgroundColor: colors.bg.raised },
  ivoryHeading: { ...type.headline, color: colors.ink.primary },
  breakdownList: { gap: spacing[2] },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.line.soft },
  breakdownLabel: { ...type.bodyStrong, color: colors.ink.primary },
  breakdownCount: { ...type.bodyStrong, color: colors.ink.tertiary },
  emptyIvory: { ...type.body, color: colors.ink.tertiary },
  timeline: { gap: spacing[4], paddingLeft: spacing[2] },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  timelineIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.bg.sunken,
  },
  timelineCopy: { flex: 1 },
  timelineTitle: { ...type.bodyStrong, color: colors.ink.primary },
  timelineSub: { ...type.caption, color: colors.ink.tertiary, marginTop: 2 },
  pressed: { opacity: 0.78 },
});
