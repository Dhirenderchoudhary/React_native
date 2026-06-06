import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@/core/ui/Icon";
import { Screen } from "@/core/ui/Screen";
import { ProfileAvatarButton } from "@/modules/profile/components/ProfileDrawer";
import { useThemedDialog } from "@/core/ui/ThemedDialog";
import { endActiveDrive, recoverActiveDrive, startActiveDrive } from "@/modules/drive/activeDrive";
import { getRiderInsights, subscribeToInsightsChanges, type RiderInsights } from "@/modules/analytics/insights";
import { useDriveStore } from "@/shared/driveStore";
import { colors, layout, radius, spacing, type } from "@/core/theme";

const GAUGE_SIZE = 200;
const GAUGE_STROKE = 11;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

export default function HomeTab() {
  const router = useRouter();
  const driveId   = useDriveStore((s) => s.driveId);
  const startedAt = useDriveStore((s) => s.startedAt);
  const start     = useDriveStore((s) => s.start);
  const end       = useDriveStore((s) => s.end);
  const [starting, setStarting]   = useState(false);
  const { dialog, showDialog }    = useThemedDialog();
  const [insights, setInsights]   = useState<RiderInsights | null>(null);

  const loadInsights = useCallback(async () => {
    try { setInsights(await getRiderInsights()); } catch {}
  }, []);

  useEffect(() => {
    loadInsights();
    return subscribeToInsightsChanges(loadInsights);
  }, [loadInsights]);

  useEffect(() => { if (!driveId) loadInsights(); }, [driveId, loadInsights]);

  useEffect(() => {
    let alive = true;
    recoverActiveDrive()
      .then((d) => { if (alive && d) start(d.id, d.started_at); })
      .catch(() => {});
    return () => { alive = false; };
  }, [start]);

  const handleStartDrive = async () => {
    if (driveId || starting) return;
    try {
      setStarting(true);
      const d = await startActiveDrive();
      start(d.id, d.started_at);
    } catch (e) {
      showDialog({ title: "Could not start drive", message: String(e) });
    } finally { setStarting(false); }
  };

  const handlePrimaryAction = () => {
    if (!driveId) { handleStartDrive(); return; }
    if (!startedAt) return;
    showDialog({
      title: "End active ride?",
      message: "Save this ride and stop recording.",
      actions: [
        { label: "Keep driving", tone: "cancel" },
        {
          label: "End and save", tone: "danger",
          onPress: async () => {
            try {
              setStarting(true);
              await endActiveDrive(driveId, startedAt);
              end();
            } catch (e) {
              showDialog({ title: "Could not end ride", message: String(e) });
            } finally { setStarting(false); }
          },
        },
      ],
    });
  };

  const score        = insights?.averageScore ?? 100;
  const totalEvents  = insights ? Object.values(insights.counts).reduce((s, n) => s + n, 0) : 0;
  const totalMinutes = insights?.totalMinutes ?? 0;
  const rating       = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
  const ratingLabel  = score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 60 ? "Fair" : "Poor";

  return (
    <Screen background="canvas" padded={false} edges={["top"]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.avatarSlot}>
            <ProfileAvatarButton />
          </View>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>CLUTCH</Text>
            <Icon name="speed" size={24} color={colors.ink.secondary} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Instrument panel ── */}
          <LinearGradient
            colors={["#2c2f33", "#1c1e21", "#131517"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.card}
          >
            {/* Specular bevel top */}
            <LinearGradient
              colors={["rgba(255,255,255,0.24)", "rgba(255,255,255,0)"]}
              style={styles.cardBevelTop}
            />
            {/* Shadow groove bottom */}
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.60)"]}
              style={styles.cardBevelBot}
            />

            <View style={styles.intro}>
              <Text style={styles.heading}>{driveId ? "Ride in Progress" : "Ready to Drive"}</Text>
              <Text style={styles.subheading}>Drive safer. Know your habits.</Text>
            </View>

            <ScoreGauge score={score} />

            {/* Rating pill */}
            <LinearGradient
              colors={["#2e3134", "#1e2124"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.badge}
            >
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>{ratingLabel}</Text>
            </LinearGradient>

            {/* Start / End button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={driveId ? "End Active Ride" : "Start Drive"}
              onPress={handlePrimaryAction}
              style={({ pressed }) => [styles.btnWrap, pressed && styles.btnWrapPressed]}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={pressed
                    ? ["#c0bcb4", "#9e9b93"]
                    : driveId
                      ? ["#c8c4bb", "#a8a49c"]
                      : ["#f2efe7", "#d0ccc3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.btn}
                >
                  <Icon name={driveId ? "pause" : "play"} size={20} color="#2e2d2a" fill="#2e2d2a" />
                  <Text style={styles.btnText}>
                    {starting ? "Working…" : driveId ? "End Active Ride" : "Start Drive"}
                  </Text>
                </LinearGradient>
              )}
            </Pressable>

            {driveId ? (
              <Pressable
                onPress={() => router.push("/drive/active")}
                style={({ pressed }) => [styles.goBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.goBtnText}>Go to Ride</Text>
                <Icon name="chevron_right" size={18} color={colors.ink.tertiary} />
              </Pressable>
            ) : null}

            {/* Metric wells */}
            <View style={styles.metrics}>
              <MetricWell label="DURATION" value={totalMinutes > 0 ? `${totalMinutes}m` : "—"} />
              <MetricWell label="EVENTS"   value={insights ? String(totalEvents) : "—"} />
              <MetricWell label="RATING"   value={insights ? rating : "—"} highlight />
            </View>

            <Text style={styles.note}>
              Score starts at 100 and drops when unsafe events are detected.
            </Text>
          </LinearGradient>
        </ScrollView>
      </View>
      {dialog}
    </Screen>
  );
}

// ── Gauge ────────────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - score / 100);
  return (
    <LinearGradient
      colors={["#3c4044", "#1e2124"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gaugeBezel}
    >
      <LinearGradient
        colors={["#0c0e10", "#161a1d"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gaugeFace}
      >
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}>
          <Defs>
            <RadialGradient id="glare" cx="35%" cy="25%" r="55%">
              <Stop offset="0" stopColor="#fff" stopOpacity="0.08" />
              <Stop offset="1" stopColor="#fff" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {/* Stamped track groove */}
          <Circle cx={GAUGE_SIZE/2} cy={GAUGE_SIZE/2} r={GAUGE_RADIUS}
            fill="none" stroke="#060709" strokeWidth={GAUGE_STROKE + 5} />
          <Circle cx={GAUGE_SIZE/2} cy={GAUGE_SIZE/2} r={GAUGE_RADIUS}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={GAUGE_STROKE} />
          {/* Ivory arc */}
          <Circle cx={GAUGE_SIZE/2} cy={GAUGE_SIZE/2} r={GAUGE_RADIUS}
            fill="none"
            stroke={colors.accent.ivory}
            strokeWidth={GAUGE_STROKE}
            strokeDasharray={`${GAUGE_CIRCUMFERENCE} ${GAUGE_CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${GAUGE_SIZE/2}, ${GAUGE_SIZE/2}`}
          />
          {/* Glass glare */}
          <Circle cx={GAUGE_SIZE/2} cy={GAUGE_SIZE/2} r={GAUGE_SIZE/2 - 1} fill="url(#glare)" />
        </Svg>
        <View style={styles.gaugeReadout}>
          <Text style={styles.gaugeScore}>{score}</Text>
          <Text style={styles.gaugeLabel}>SCORE</Text>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
}

// ── Metric well ───────────────────────────────────────────────────────────────
function MetricWell({ label, value, highlight = false }: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <LinearGradient
      colors={["#08090b", "#0f1113"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.well}
    >
      <View style={styles.wellShadowLine} />
      <Text style={styles.wellLabel}>{label}</Text>
      <Text style={[styles.wellValue, highlight && styles.wellValueAccent]}>{value}</Text>
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.canvas },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  brand: { ...type.headline, color: colors.ink.primary, fontSize: 22, letterSpacing: 1.5 },
  avatarSlot: {
    width: 40, height: 40, borderRadius: radius.full, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: colors.bg.raised,
  },

  content: {
    flexGrow: 1, justifyContent: "center", alignItems: "center",
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[2], paddingBottom: 112,
  },

  card: {
    width: "100%", maxWidth: 440,
    alignItems: "center", borderRadius: 22, overflow: "hidden",
    paddingHorizontal: spacing[5], paddingBottom: spacing[5], gap: spacing[5],
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(0,0,0,0.50)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.75, shadowRadius: 30, elevation: 16,
  },
  cardBevelTop: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  cardBevelBot: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },

  intro: { alignItems: "center", paddingTop: spacing[5] },
  heading: { ...type.headline, color: colors.ink.primary, fontSize: 19, letterSpacing: -0.2 },
  subheading: { ...type.body, color: colors.ink.tertiary, marginTop: spacing[1] },

  // gauge
  gaugeBezel: {
    width: GAUGE_SIZE + 22, height: GAUGE_SIZE + 22,
    borderRadius: (GAUGE_SIZE + 22) / 2,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(0,0,0,0.60)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75, shadowRadius: 18,
  },
  gaugeFace: {
    width: GAUGE_SIZE + 4, height: GAUGE_SIZE + 4,
    borderRadius: (GAUGE_SIZE + 4) / 2,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
    borderTopColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(0,0,0,0.85)",
    overflow: "hidden",
  },
  gaugeReadout: { position: "absolute", alignItems: "center" },
  gaugeScore: {
    ...type.display, color: colors.ink.primary, fontSize: 54, lineHeight: 58,
    textShadowColor: "rgba(232,228,218,0.28)",
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  gaugeLabel: { ...type.micro, color: colors.ink.muted, letterSpacing: 2.5 },

  // badge
  badge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing[4], paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(0,0,0,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55, shadowRadius: 6,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.accent.ivory, marginRight: spacing[2],
    shadowColor: colors.accent.ivory, shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 5,
  },
  badgeText: { ...type.label, color: colors.ink.secondary },

  // button
  btnWrap: {
    width: "100%", borderRadius: 14, overflow: "hidden",
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.55)",
    borderColor: "rgba(0,0,0,0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.55, shadowRadius: 12, elevation: 7,
  },
  btnWrapPressed: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    transform: [{ translateY: 3 }],
  },
  btn: {
    minHeight: 58, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: spacing[2], paddingHorizontal: spacing[5],
  },
  btnText: { ...type.headline, color: "#2a2926", fontSize: 18 },

  goBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing[2], marginTop: -spacing[3],
    minHeight: 44, width: "100%", borderRadius: 12,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(0,0,0,0.50)",
    backgroundColor: "#1c1f22",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.50, shadowRadius: 6,
  },
  goBtnText: { ...type.subhead, color: colors.ink.secondary },

  // metric wells
  metrics: { width: "100%", flexDirection: "row", gap: spacing[3] },
  well: {
    flex: 1, alignItems: "center", justifyContent: "center",
    minHeight: 74, borderRadius: 12, overflow: "hidden",
    borderWidth: 1,
    borderTopColor: "rgba(0,0,0,0.85)",
    borderColor: "rgba(0,0,0,0.55)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.90, shadowRadius: 8,
  },
  wellShadowLine: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 1, backgroundColor: "rgba(0,0,0,0.95)",
  },
  wellLabel: { ...type.micro, color: colors.ink.muted, letterSpacing: 1.2, marginBottom: 4 },
  wellValue: { ...type.headline, color: colors.ink.primary, fontSize: 22 },
  wellValueAccent: {
    color: colors.accent.ivory,
    textShadowColor: "rgba(232,228,218,0.22)",
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
  },

  note: {
    ...type.caption, color: colors.ink.muted,
    maxWidth: 300, textAlign: "center", fontSize: 11, lineHeight: 16,
  },
});
