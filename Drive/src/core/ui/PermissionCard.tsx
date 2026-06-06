import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { IconDisc } from "@/core/ui/IconDisc";
import { Icon, type IconName } from "@/core/ui/Icon";
import { colors, radius, type } from "@/core/theme";
import type { PermStatus } from "@/shared/permissions";

export type PermissionCardProps = {
  icon: IconName;
  title: string;
  description: string;
  status: PermStatus;
  onRequest: () => void;
  busy?: boolean;
};

const STATUS_TONE: Record<PermStatus, "success" | "warning" | "danger" | "neutral"> = {
  granted: "success",
  undetermined: "neutral",
  denied: "danger",
  unknown: "neutral",
};

const STATUS_LABEL: Record<PermStatus, string> = {
  granted: "Granted",
  undetermined: "Tap to enable",
  denied: "Denied — open Settings",
  unknown: "Checking…",
};

export function PermissionCard({
  icon,
  title,
  description,
  status,
  onRequest,
  busy,
}: PermissionCardProps) {
  const tone = STATUS_TONE[status];
  const isGranted = status === "granted";
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <IconDisc name={icon} tone={isGranted ? "success" : "neutral"} sizeMode="lg" />
        <View style={styles.headText}>
          <Text style={[type.subhead, styles.title]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[type.caption, styles.desc]}>{description}</Text>
        </View>
      </View>
      <View style={styles.foot}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  tone === "success"
                    ? colors.status.success
                    : tone === "warning"
                    ? colors.status.warning
                    : tone === "danger"
                    ? colors.status.danger
                    : colors.ink.tertiary,
              },
            ]}
          />
          <Text
            style={[
              type.caption,
              {
                color:
                  tone === "success"
                    ? colors.status.success
                    : tone === "danger"
                    ? colors.status.danger
                    : colors.ink.tertiary,
              },
            ]}
          >
            {STATUS_LABEL[status]}
          </Text>
        </View>
        {!isGranted ? (
          <Pressable
            onPress={() => {
              if (status === "denied") {
                void Linking.openSettings();
              } else {
                onRequest();
              }
            }}
            disabled={busy}
            style={({ pressed }) => [
              styles.cta,
              { opacity: pressed || busy ? 0.6 : 1 },
            ]}
            accessibilityRole="button"
          >
            <Text style={[type.bodyStrong, styles.ctaText]}>
              {status === "denied" ? "Open Settings" : "Enable"}
            </Text>
            <Icon
              name={status === "denied" ? "settings" : "chevron_right"}
              size={18}
              color={colors.ink.inverse}
            />
          </Pressable>
        ) : (
          <View style={styles.ctaGranted}>
            <Icon name="check" size={18} color={colors.status.success} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.raised,
    borderRadius: radius["2xl"],
    padding: 20,
    gap: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.hairline,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  headText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.ink.primary,
  },
  desc: {
    color: colors.ink.tertiary,
  },
  foot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent.ivory,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  ctaText: {
    color: colors.ink.inverse,
  },
  ctaGranted: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.status.successDim,
  },
});
