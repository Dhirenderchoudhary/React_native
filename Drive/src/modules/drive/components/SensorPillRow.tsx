import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/core/ui/Icon";
import { colors, type } from "@/core/theme";
import type { SensorKey, SensorState } from "@/shared/driveStore";

type Item = {
  key: SensorKey;
  label: string;
  icon: IconName;
};

const ITEMS: Item[] = [
  { key: "gyro", label: "Gyro", icon: "rotation" },
  { key: "accel", label: "Accel", icon: "accel" },
  { key: "motion", label: "Motion", icon: "device" },
  { key: "gps", label: "GPS", icon: "location_on" },
];

export type SensorPillRowProps = {
  sensors: Record<SensorKey, SensorState>;
};

export function SensorPillRow({ sensors }: SensorPillRowProps) {
  return (
    <View style={styles.pill}>
      {ITEMS.map((it, i) => (
        <SensorItem
          key={it.key}
          item={it}
          state={sensors[it.key]}
          delayMs={i * 400}
        />
      ))}
    </View>
  );
}

function SensorItem({
  item,
  state,
  delayMs,
}: {
  item: Item;
  state: SensorState;
  delayMs: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== "active") {
      scale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(scale, {
          toValue: 1.12,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, delayMs, scale]);

  const tint =
    state === "active"
      ? colors.accent.ivory
      : state === "error"
        ? colors.status.danger
        : colors.ink.tertiary;

  return (
    <View style={styles.item}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon name={item.icon} size={20} color={tint} />
      </Animated.View>
      <Text
        style={[
          styles.label,
          {
            color: tint,
            opacity: state === "active" ? 1 : state === "inactive" ? 0.5 : 0.3,
          },
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    backgroundColor: colors.bg.sunken,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  item: {
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
