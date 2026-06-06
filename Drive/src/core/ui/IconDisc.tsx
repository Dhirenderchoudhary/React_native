import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { Icon, type IconName } from "./Icon";
import { colors, radius, type ColorToken } from "@/core/theme";

export type IconDiscProps = ViewProps & {
  name: IconName;
  size?: number;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
  sizeMode?: "sm" | "md" | "lg" | "xl";
  glyph?: number;
};

const TONES: Record<NonNullable<IconDiscProps["tone"]>, { bg: string; fg: string }> = {
  neutral: { bg: colors.bg.raised, fg: colors.ink.primary },
  accent: { bg: colors.accent.ivory, fg: colors.ink.inverse },
  success: { bg: colors.status.successDim, fg: colors.status.success },
  warning: { bg: colors.status.warningDim, fg: colors.status.warning },
  danger: { bg: colors.status.dangerDim, fg: colors.status.danger },
  info: { bg: colors.status.infoDim, fg: colors.status.info },
};

const SIZES = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
};

export function IconDisc({
  name,
  size,
  tone = "neutral",
  sizeMode = "md",
  style,
  ...rest
}: IconDiscProps) {
  const dim = size ?? SIZES[sizeMode];
  const palette = TONES[tone];
  const glyphSize = Math.round(dim * 0.5);
  return (
    <View
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: radius.full,
          backgroundColor: palette.bg,
        },
        style,
      ]}
      {...rest}
    >
      <Icon name={name} size={glyphSize} color={palette.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
