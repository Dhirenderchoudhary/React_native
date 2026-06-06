import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { AiCoachCard } from "@/modules/analytics/components/AiCoachCard";
import { Icon, type IconName } from "@/core/ui/Icon";
import { Screen } from "@/core/ui/Screen";
import { generateOverallCoaching } from "@/modules/analytics/groq";
import {
  EVENT_LABELS,
  EVENT_TYPES,
  getRiderInsights,
  type RiderInsights,
} from "@/modules/analytics/insights";
import type { Drive, EventType } from "@/core/db/connect";
import { colors, layout, radius, spacing, type } from "@/core/theme";

type InsightTab = "overview" | "rides" | "thresholds";

const EMPTY_INSIGHTS: RiderInsights = {
  drives: [],
  events: [],
  counts: {
    harsh_brake: 0,
    harsh_accel: 0,
    sharp_turn: 0,
    aggressive_steer: 0,
    device_movement: 0,
    phone_handling: 0,
  },
  averageScore: 100,
  totalMinutes: 0,
};

export default function AnalyticsTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InsightTab>("overview");
  const [insights, setInsights] = useState(EMPTY_INSIGHTS);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getRiderInsights()
        .then((next) => {
          if (mounted) setInsights(next);
        })
        .catch(() => undefined);
      return () => {
        mounted = false;
      };
    }, []),
  );

  return (
    <Screen background="canvas" padded={false} edges={["top"]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon name="analytics" size={20} color={colors.ink.primary} />
          </View>
          <Text style={styles.brand}>INSIGHTS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <SegmentedControl activeTab={activeTab} onChange={setActiveTab} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "overview" ? <Overview insights={insights} /> : null}
          {activeTab === "rides" ? (
            <PastRides
              drives={insights.drives}
              onOpen={(driveId) =>
                router.push({ pathname: "/analytics/[driveId]", params: { driveId } })
              }
            />
          ) : null}
          {activeTab === "thresholds" ? <Thresholds /> : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

function SegmentedControl({
  activeTab,
  onChange,
}: {
  activeTab: InsightTab;
  onChange: (tab: InsightTab) => void;
}) {
  const tabs: Array<{ key: InsightTab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "rides", label: "Past Rides" },
    { key: "thresholds", label: "Thresholds" },
  ];
  return (
    <LinearGradient
      colors={["#161819", "#101214"]}
      style={styles.segmentWell}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        if (active) {
          return (
            <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={styles.segmentPressable}>
              <LinearGradient
                colors={["#2e3134", "#222527"]}
                style={[styles.segment, styles.segmentActive]}
              >
                <Text style={[styles.segmentText, styles.segmentTextActive]}>{tab.label}</Text>
              </LinearGradient>
            </Pressable>
          );
        }
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.segmentPressable, styles.segment]}
          >
            <Text style={styles.segmentText}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

function Overview({ insights }: { insights: RiderInsights }) {
  const generate = useCallback(() => generateOverallCoaching(insights), [insights]);
  return (
    <>
      <View style={styles.metricsRow}>
        <MetricCard label="AVG SCORE" value={String(insights.averageScore)} />
        <MetricCard label="RIDES" value={String(insights.drives.length)} />
        <MetricCard label="MINUTES" value={String(insights.totalMinutes)} />
      </View>
      <BreakdownCard counts={insights.counts} />
      <ScoreTrendCard drives={insights.drives} />
      <AiCoachCard title="AI Driving Suggestions" generate={generate} />
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <LinearGradient
      colors={["#1e2124", "#141618"]}
      style={styles.metricCard}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </LinearGradient>
  );
}

function BreakdownCard({ counts }: { counts: Record<EventType, number> }) {
  const items: Array<{ type: EventType; label: string }> = [
    { type: "harsh_brake", label: "BRAKE" },
    { type: "harsh_accel", label: "ACCEL" },
    { type: "sharp_turn", label: "TURN" },
    { type: "phone_handling", label: "PHONE" },
  ];
  const peak = Math.max(1, ...items.map((item) => counts[item.type]));
  return (
    <LinearGradient colors={["#272a2d", "#1a1c1f"]} style={styles.ivoryCard}>
      <View style={styles.cardHeadingRow}>
        <Text style={styles.ivoryHeading}>Event Breakdown</Text>
        <Text style={styles.ivoryEyebrow}>ALL RIDES</Text>
      </View>
      <LinearGradient colors={["#08090b", "#0f1113"]} style={styles.chartWell}>
        {items.map((item) => {
          const count = counts[item.type];
          const height = Math.max(12, (count / peak) * 96);
          return (
            <View key={item.type} style={styles.chartColumn}>
              <Text style={styles.chartCount}>{count}</Text>
              <LinearGradient
                colors={["#d0ccc3", "#a8a49c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.chartBar, { height }]}
              />
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          );
        })}
      </LinearGradient>
    </LinearGradient>
  );
}

function ScoreTrendCard({ drives }: { drives: Drive[] }) {
  const trend = drives.slice(0, 7).reverse();
  const points = getTrendPoints(trend);
  const latest = trend.at(-1)?.score;
  const previous = trend.at(-2)?.score;
  const delta = latest != null && previous != null ? latest - previous : null;
  return (
    <LinearGradient colors={["#272a2d", "#1a1c1f"]} style={styles.ivoryCard}>
      <View style={styles.cardHeadingRow}>
        <View>
          <Text style={styles.ivoryHeading}>Score Trend</Text>
          <Text style={styles.trendSub}>Your last {Math.max(1, trend.length)} recorded rides</Text>
        </View>
        {latest != null ? (
          <View style={styles.trendLatest}>
            <Text style={styles.trendLatestScore}>{latest}</Text>
            {delta != null ? (
              <Text style={styles.trendDelta}>
                {delta > 0 ? "+" : ""}
                {delta} from last
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.ivoryEyebrow}>NO RIDES YET</Text>
        )}
      </View>
      {trend.length > 1 ? (
        <LinearGradient colors={["#08090b", "#0f1113"]} style={styles.trendWell}>
          <Svg width="100%" height="100%" viewBox="0 0 300 112">
            <Line x1="0" y1="16" x2="300" y2="16" stroke={colors.line.soft} />
            <Line x1="0" y1="56" x2="300" y2="56" stroke={colors.line.soft} />
            <Line x1="0" y1="96" x2="300" y2="96" stroke={colors.line.soft} />
            <Path
              d={points}
              fill="none"
              stroke={colors.accent.ivoryDim}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
          </Svg>
          <View style={styles.trendLabels}>
            <Text style={styles.trendLabel}>{formatShortDate(trend[0].started_at)}</Text>
            <Text style={styles.trendLabel}>
              {formatShortDate(trend[trend.length - 1].started_at)}
            </Text>
          </View>
        </LinearGradient>
      ) : (
        <Text style={styles.emptyIvory}>
          Complete two rides to see how your score is moving over time.
        </Text>
      )}
    </LinearGradient>
  );
}

function getTrendPoints(drives: Drive[]) {
  return drives
    .map((drive, index) => {
      const x = drives.length === 1 ? 150 : (index / (drives.length - 1)) * 300;
      const y = 96 - (Math.max(0, Math.min(100, drive.score)) / 100) * 80;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatShortDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PastRides({
  drives,
  onOpen,
}: {
  drives: Drive[];
  onOpen: (driveId: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Past Rides</Text>
      <Text style={styles.sectionSub}>Tap a ride to open its detailed insights.</Text>
      <View style={styles.rideList}>
        {drives.length ? (
          drives.map((drive) => (
            <Pressable
              key={drive.id}
              onPress={() => onOpen(drive.id)}
              style={({ pressed }) => [pressed && styles.cardPressed]}
            >
              <LinearGradient
                colors={["#222527", "#171a1c"]}
                style={styles.rideCard}
              >
                <LinearGradient
                  colors={["#3c4044", "#282c2f"]}
                  style={styles.rideIcon}
                >
                  <Icon name="route" size={20} color={colors.ink.inverse} />
                </LinearGradient>
                <View style={styles.rideCopy}>
                  <Text style={styles.rideTitle}>
                    {new Date(drive.started_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={styles.rideSub}>
                    {formatDuration(drive.duration_s)} · {drive.safety_rating ?? "rated ride"}
                  </Text>
                </View>
                <Text style={styles.rideScore}>{drive.score}</Text>
                <Icon name="chevron_right" size={18} color={colors.ink.tertiary} />
              </LinearGradient>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyDark}>
            <Icon name="history" size={22} color={colors.ink.tertiary} />
            <Text style={styles.emptyDarkText}>Your completed rides will appear here.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Thresholds() {
  return (
    <View style={styles.section}>
      <View style={styles.thresholdHero}>
        <View style={styles.thresholdHeroIcon}>
          <Icon name="tune" size={22} color={colors.ink.inverse} />
        </View>
        <View style={styles.thresholdHeroCopy}>
          <Text style={styles.thresholdHeroEyebrow}>LOCAL DETECTION PROFILE</Text>
          <Text style={styles.thresholdHeroTitle}>Standard Sensitivity</Text>
          <Text style={styles.thresholdHeroSub}>
            Events are flagged when live sensor readings cross these limits.
          </Text>
        </View>
      </View>

      <LinearGradient colors={["#1e2124", "#141618"]} style={styles.thresholdPanel}>
        <LinearGradient colors={["#272a2d", "#1a1c1f"]} style={styles.thresholdPanelHeader}>
          <Text style={styles.thresholdPanelTitle}>Active Thresholds</Text>
          <View style={styles.thresholdStatus}>
            <View style={styles.thresholdStatusDot} />
            <Text style={styles.thresholdStatusText}>ENABLED</Text>
          </View>
        </LinearGradient>
        <ThresholdRow
          icon="brake"
          title="Harsh Braking"
          description="Sudden deceleration"
          value=">0.4"
          unit="g"
        />
        <ThresholdRow
          icon="steering"
          title="Sharp Turn"
          description="High lateral force"
          value=">0.5"
          unit="g"
        />
        <ThresholdRow
          icon="accel"
          title="Acceleration"
          description="Rapid throttle input"
          value=">0.4"
          unit="g"
        />
        <ThresholdRow
          icon="phone"
          title="Phone Handling"
          description="Device movement duration"
          value=">1"
          unit="s"
          last
        />
      </LinearGradient>
    </View>
  );
}

function ThresholdRow({
  icon,
  title,
  description,
  value,
  unit,
  last = false,
}: {
  icon: IconName;
  title: string;
  description: string;
  value: string;
  unit: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.thresholdRow, !last && styles.thresholdRowBorder]}>
      <View style={styles.thresholdRowIcon}>
        <Icon name={icon} size={19} color={colors.ink.secondary} />
      </View>
      <View style={styles.thresholdRowCopy}>
        <Text style={styles.thresholdRowTitle}>{title}</Text>
        <Text style={styles.thresholdRowSub}>{description}</Text>
      </View>
      <LinearGradient colors={["#272a2d", "#1a1c1f"]} style={styles.thresholdValueWell}>
        <Text style={styles.thresholdValue}>
          {value}
          <Text style={styles.thresholdUnit}> {unit}</Text>
        </Text>
      </LinearGradient>
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
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.bg.surface,
  },
  headerSpacer: { width: 40 },
  brand: { ...type.headline, color: colors.ink.primary, letterSpacing: 1.6 },
  // segmentWell is now a LinearGradient; shape/layout styles only
  segmentWell: {
    flexDirection: "row",
    marginHorizontal: layout.screenPaddingX,
    marginTop: spacing[2],
    padding: spacing[1],
    borderRadius: radius.md,
    borderWidth: 1,
    borderTopColor: "rgba(0,0,0,0.85)",
    borderColor: "rgba(0,0,0,0.50)",
  },
  segmentPressable: {
    flex: 1,
  },
  segment: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  segmentActive: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.18)",
  },
  segmentText: { ...type.caption, color: colors.ink.tertiary, fontWeight: "600" },
  segmentTextActive: { color: colors.ink.primary },
  content: {
    gap: spacing[4],
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[4],
    paddingBottom: 112,
  },
  metricsRow: { flexDirection: "row", gap: spacing[3] },
  // metricCard is now a LinearGradient
  metricCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(0,0,0,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  metricLabel: { ...type.micro, color: colors.ink.tertiary, fontSize: 9 },
  metricValue: { ...type.metricSm, color: colors.ink.primary, marginTop: spacing[1] },
  // ivoryCard is now a LinearGradient
  ivoryCard: {
    gap: spacing[4],
    padding: spacing[5],
    overflow: "hidden",
    borderRadius: radius["2xl"],
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(0,0,0,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.60,
    shadowRadius: 18,
  },
  cardHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ivoryHeading: { ...type.headline, color: colors.ink.primary },
  ivoryEyebrow: { ...type.micro, color: colors.ink.tertiary },
  // chartWell is now a LinearGradient
  chartWell: {
    height: 148,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderRadius: radius.md,
    borderTopColor: "rgba(0,0,0,0.85)",
  },
  chartColumn: { height: "100%", alignItems: "center", justifyContent: "flex-end", gap: spacing[1] },
  chartCount: { ...type.micro, color: colors.ink.tertiary },
  // chartBar is now a LinearGradient; no backgroundColor needed
  chartBar: { width: 24, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  chartLabel: { ...type.micro, color: colors.ink.tertiary, fontSize: 9 },
  trendSub: { ...type.caption, color: colors.ink.tertiary, marginTop: spacing[1] },
  trendLatest: { alignItems: "flex-end" },
  trendLatestScore: { ...type.metricSm, color: colors.ink.primary },
  trendDelta: { ...type.caption, color: colors.ink.tertiary, marginTop: 2 },
  // trendWell is now a LinearGradient
  trendWell: {
    height: 148,
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    borderRadius: radius.md,
    borderTopColor: "rgba(0,0,0,0.85)",
  },
  trendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -spacing[1],
  },
  trendLabel: { ...type.micro, color: colors.ink.tertiary, fontSize: 9 },
  emptyIvory: { ...type.body, color: colors.ink.tertiary },
  section: { gap: spacing[3] },
  sectionTitle: { ...type.headline, color: colors.ink.primary },
  sectionSub: { ...type.body, color: colors.ink.tertiary },
  rideList: { gap: spacing[3], marginTop: spacing[1] },
  // rideCard is now a LinearGradient
  rideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(0,0,0,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
  },
  // rideIcon disc is now a LinearGradient
  rideIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21 },
  rideCopy: { flex: 1 },
  rideTitle: { ...type.bodyStrong, color: colors.ink.primary },
  rideSub: { ...type.caption, color: colors.ink.tertiary, marginTop: 2, textTransform: "capitalize" },
  rideScore: { ...type.metricSm, color: colors.ink.primary, fontSize: 26 },
  cardPressed: { opacity: 0.78 },
  emptyDark: { alignItems: "center", gap: spacing[2], padding: spacing[6], borderRadius: radius.lg, backgroundColor: colors.bg.surface },
  emptyDarkText: { ...type.body, color: colors.ink.tertiary, textAlign: "center" },
  thresholdHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    backgroundColor: colors.bg.raised,
  },
  thresholdHeroIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: colors.accent.ivoryDim,
  },
  thresholdHeroCopy: { flex: 1 },
  thresholdHeroEyebrow: { ...type.micro, color: colors.ink.tertiary, fontSize: 9 },
  thresholdHeroTitle: { ...type.headline, color: colors.ink.primary, marginTop: spacing[1] },
  thresholdHeroSub: { ...type.caption, color: colors.ink.tertiary, marginTop: spacing[1] },
  // thresholdPanel is now a LinearGradient
  thresholdPanel: {
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(0,0,0,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 12,
  },
  // thresholdPanelHeader is now a LinearGradient
  thresholdPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.55)",
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  thresholdPanelTitle: { ...type.bodyStrong, color: colors.ink.primary },
  thresholdStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["1.5"],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.status.successDim,
  },
  thresholdStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.success,
  },
  thresholdStatusText: { ...type.micro, color: colors.status.success, fontSize: 9 },
  // thresholdRow keeps its View; bevel borders via borderBottomColor
  thresholdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 76,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  thresholdRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.55)",
  },
  thresholdRowIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: colors.bg.raised,
  },
  thresholdRowCopy: { flex: 1 },
  thresholdRowTitle: { ...type.bodyStrong, color: colors.ink.primary },
  thresholdRowSub: { ...type.caption, color: colors.ink.tertiary, marginTop: 2 },
  // thresholdValueWell is now a LinearGradient
  thresholdValueWell: {
    minWidth: 72,
    alignItems: "center",
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(0,0,0,0.45)",
  },
  thresholdValue: { ...type.headline, color: colors.ink.primary, fontSize: 19 },
  thresholdUnit: { ...type.caption, color: colors.ink.tertiary },
});
