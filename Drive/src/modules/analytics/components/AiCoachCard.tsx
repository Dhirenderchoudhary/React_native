import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/core/ui/Icon";
import type { CoachingResult } from "@/modules/analytics/groq";
import { colors, radius, spacing, type } from "@/core/theme";

export function AiCoachCard({
  title,
  generate,
}: {
  title: string;
  generate: () => Promise<CoachingResult>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachingResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await generate());
    } finally {
      setLoading(false);
    }
  }, [generate]);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !result && !loading) load().catch(() => undefined);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Icon name="sparkles" size={20} color={colors.ink.inverse} />
          </View>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>
              {result?.source === "groq"
                ? "Validated Groq coaching from recorded telemetry"
                : "Personalized coaching from recorded telemetry"}
            </Text>
          </View>
          <Icon
            name={expanded ? "chevron_up" : "chevron_down"}
            size={20}
            color={colors.ink.secondary}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.ink.secondary} />
              <Text style={styles.notice}>Generating parked-review coaching...</Text>
            </View>
          ) : result ? (
            <>
              <View style={styles.reportHeader}>
                <View style={styles.reportCopy}>
                  <Text style={styles.headline}>{result.report.headline}</Text>
                  <Text style={styles.summary}>{result.report.summary}</Text>
                </View>
                <Pressable
                  accessibilityLabel="Refresh AI coaching"
                  onPress={() => load().catch(() => undefined)}
                  style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}
                >
                  <Icon name="refresh" size={16} color={colors.ink.secondary} />
                </Pressable>
              </View>
              <Text style={styles.notice}>{result.notice}</Text>
              <View style={styles.suggestions}>
                {result.report.suggestions.map((suggestion) => (
                  <View key={`${suggestion.title}-${suggestion.evidence}`} style={styles.suggestion}>
                    <View
                      style={[
                        styles.priority,
                        suggestion.priority === "high" && styles.priorityHigh,
                      ]}
                    />
                    <View style={styles.suggestionCopy}>
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                      <Text style={styles.suggestionDetail}>{suggestion.detail}</Text>
                      <Text style={styles.evidence}>{suggestion.evidence}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.disclaimer}>{result.report.disclaimer}</Text>
            </>
          ) : (
            <Text style={styles.notice}>Coaching could not be loaded.</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.bg.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  icon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.accent.ivoryDim,
  },
  headingCopy: { flex: 1 },
  title: { ...type.bodyStrong, color: colors.ink.primary },
  sub: { ...type.caption, color: colors.ink.tertiary, marginTop: 2 },
  body: {
    gap: spacing[3],
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.line.soft,
  },
  loading: { flexDirection: "row", alignItems: "center", gap: spacing[3] },
  reportHeader: { flexDirection: "row", gap: spacing[3] },
  reportCopy: { flex: 1 },
  headline: { ...type.subhead, color: colors.ink.primary },
  summary: { ...type.body, color: colors.ink.secondary, marginTop: spacing[1] },
  notice: { ...type.caption, color: colors.ink.tertiary },
  refresh: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.bg.surface,
  },
  suggestions: { gap: spacing[3] },
  suggestion: { flexDirection: "row", gap: spacing[2] },
  priority: {
    width: 7,
    height: 7,
    marginTop: 7,
    borderRadius: 4,
    backgroundColor: colors.accent.ivoryDim,
  },
  priorityHigh: { backgroundColor: colors.status.danger },
  suggestionCopy: { flex: 1 },
  suggestionTitle: { ...type.bodyStrong, color: colors.ink.primary },
  suggestionDetail: { ...type.body, color: colors.ink.secondary, marginTop: 2 },
  evidence: { ...type.caption, color: colors.ink.tertiary, marginTop: spacing[1] },
  disclaimer: { ...type.caption, color: colors.ink.tertiary, fontStyle: "italic" },
  pressed: { opacity: 0.76 },
});
