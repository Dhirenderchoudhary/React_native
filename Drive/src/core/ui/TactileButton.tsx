import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Icon, type IconName } from "./Icon";
import { colors, layout, radius, type } from "@/core/theme";

export type TactileButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
};

const HEIGHTS = { sm: 40, md: 48, lg: 56 };
const PADX = { sm: 14, md: 18, lg: 22 };

const VARIANT_STYLES = {
  primary: {
    bg: colors.accent.ivory,
    bgPressed: colors.accent.ivoryDim,
    fg: colors.ink.inverse,
    border: "transparent",
  },
  secondary: {
    bg: colors.bg.raised,
    bgPressed: colors.bg.surface,
    fg: colors.ink.primary,
    border: colors.line.soft,
  },
  ghost: {
    bg: "transparent",
    bgPressed: colors.bg.raised,
    fg: colors.ink.primary,
    border: "transparent",
  },
  danger: {
    bg: colors.status.dangerDim,
    bgPressed: colors.status.danger,
    fg: colors.status.danger,
    border: "transparent",
  },
} as const;

export function TactileButton({
  label,
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  loading = false,
  fullWidth = false,
  style,
  haptic = true,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  onPress,
  disabled,
  ...rest
}: TactileButtonProps) {
  const v = VARIANT_STYLES[variant];
  const h = HEIGHTS[size];
  const iconSize = size === "sm" ? 18 : size === "lg" ? 22 : 20;

  const onPressHandler: PressableProps["onPress"] = (e) => {
    if (haptic && !disabled && !loading) {
      Haptics.impactAsync(hapticStyle).catch(() => undefined);
    }
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={onPressHandler}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          height: h,
          paddingHorizontal: PADX[size],
          backgroundColor: pressed ? v.bgPressed : v.bg,
          borderColor: v.border,
          borderWidth: v.border === "transparent" ? 0 : StyleSheet.hairlineWidth * 2,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {leadingIcon ? (
            <Icon name={leadingIcon} size={iconSize} color={v.fg} />
          ) : null}
          <Text
            style={[
              type.subhead,
              { color: v.fg, marginLeft: leadingIcon ? 8 : 0, marginRight: trailingIcon ? 8 : 0 },
            ]}
          >
            {label}
          </Text>
          {trailingIcon ? (
            <Icon name={trailingIcon} size={iconSize} color={v.fg} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    minWidth: layout.minTouch,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
