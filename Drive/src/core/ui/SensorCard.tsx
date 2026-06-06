import React from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { IconDisc } from "./IconDisc";
import { Icon, type IconName } from "./Icon";
import { colors, radius, type } from "@/core/theme";

export type SensorCardProps = ViewProps & {
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
  delta?: { value: string; positive: boolean };
  trailing?: React.ReactNode;
};

export function SensorCard({
  icon,
  label,
  value,
  unit,
  hint,
  tone = "neutral",
  delta,
  trailing,
  style,
  ...rest
}: SensorCardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      <View style={styles.header}>
        <IconDisc name={icon} tone={tone} sizeMode="md" />
        <Text style={[type.label, styles.label]} numberOfLines={1}>
          {label}
        </Text>
        {trailing}
      </View>
      <View style={styles.body}>
        <Text style={[type.metricSm, styles.value]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        {unit ? <Text style={[type.caption, styles.unit]}>{unit}</Text> : null}
      </View>
      <View style={styles.footer}>
        {hint ? (
          <Text style={[type.caption, styles.hint]} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
        {delta ? (
          <View style={styles.delta}>
            <Icon
              name={delta.positive ? "trending_up" : "trending_down"}
              size={12}
              color={delta.positive ? colors.status.success : colors.status.danger}
            />
            <Text
              style={[
                type.caption,
                {
                  color: delta.positive ? colors.status.success : colors.status.danger,
                  marginLeft: 4,
                },
              ]}
            >
              {delta.value}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.raised,
    borderRadius: radius["2xl"],
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.hairline,
    gap: 12,
    minHeight: 132,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    color: colors.ink.tertiary,
    flex: 1,
  },
  body: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    color: colors.ink.primary,
  },
  unit: {
    color: colors.ink.tertiary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  hint: {
    color: colors.ink.tertiary,
    flex: 1,
  },
  delta: {
    flexDirection: "row",
    alignItems: "center",
  },
});
