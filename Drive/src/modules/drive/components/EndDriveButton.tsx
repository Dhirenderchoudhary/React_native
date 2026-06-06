import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@/core/ui/Icon";
import { colors, type } from "@/core/theme";

export type EndDriveButtonProps = {
  onPress: () => void;
  label?: string;
};

export function EndDriveButton({
  onPress,
  label = "End Drive",
}: EndDriveButtonProps) {
  const press = useRef(new Animated.Value(0)).current;
  const toValue = (v: number) =>
    Animated.timing(press, {
      toValue: v,
      duration: 120,
      useNativeDriver: true,
    }).start();

  return (
    <View style={styles.shadowHost}>
      <Animated.View
        style={[
          styles.btn,
          {
            transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPressIn={() => toValue(1)}
          onPressOut={() => toValue(0)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
              () => undefined,
            );
            onPress();
          }}
          style={styles.press}
        >
          <View style={styles.topBevel} />
          <Icon name="stop" size={20} color={colors.ink.inverse} />
          <Text style={[type.subhead, styles.label]}>{label}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowHost: {
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
  },
  btn: {
    borderRadius: 14,
    backgroundColor: colors.accent.ivory,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.6)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  press: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  topBevel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  label: {
    color: colors.ink.inverse,
    fontWeight: "700",
  },
});
