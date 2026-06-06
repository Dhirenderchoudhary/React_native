import React, { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, type } from "@/core/theme";

export type DialogAction = {
  label: string;
  tone?: "default" | "cancel" | "danger";
  onPress?: () => void | Promise<void>;
};

export type DialogOptions = {
  title: string;
  message: string;
  actions?: DialogAction[];
};

export function useThemedDialog() {
  const [dialog, setDialog] = useState<DialogOptions | null>(null);
  const showDialog = useCallback((options: DialogOptions) => setDialog(options), []);
  const dismissDialog = useCallback(() => setDialog(null), []);
  return {
    showDialog,
    dialog: <ThemedDialog dialog={dialog} onDismiss={dismissDialog} />,
  };
}

function ThemedDialog({
  dialog,
  onDismiss,
}: {
  dialog: DialogOptions | null;
  onDismiss: () => void;
}) {
  const actions = dialog?.actions?.length
    ? dialog.actions
    : [{ label: "Close", tone: "default" as const }];

  return (
    <Modal animationType="fade" onRequestClose={onDismiss} transparent visible={dialog != null}>
      <View style={styles.scrim}>
        <LinearGradient
          colors={["#282b2e", "#1b1d20"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.panel}
        >
          {/* bright top bevel */}
          <View style={styles.topBevel} />

          <View style={styles.body}>
            <Text style={styles.title}>{dialog?.title}</Text>
            <Text style={styles.message}>{dialog?.message}</Text>
          </View>

          {/* hairline separator */}
          <View style={styles.separator} />

          <View style={styles.actions}>
            {actions.map((action, i) => {
              const isDanger = action.tone === "danger";
              const isCancel = action.tone === "cancel";

              return (
                <Pressable
                  key={action.label}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => undefined);
                    onDismiss();
                    void action.onPress?.();
                  }}
                  style={({ pressed }) => [{ borderRadius: 11, overflow: "hidden" as const }, pressed && { opacity: 0.75 }]}
                >
                  <LinearGradient
                    colors={
                      isDanger
                        ? ["#d94040", "#9b1f1f"]
                        : isCancel
                        ? ["#282b2e", "#1b1d20"]
                        : ["#eeebe3", "#cdc9c0"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.actionBtn,
                      isDanger && styles.actionBtnDanger,
                      isCancel && styles.actionBtnCancel,
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        isDanger && styles.actionTextDanger,
                        isCancel && styles.actionTextCancel,
                      ]}
                    >
                      {action.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[5],
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  panel: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.20)",
    borderColor: "rgba(0,0,0,0.60)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.80,
    shadowRadius: 32,
  },
  topBevel: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  body: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
  title: {
    ...type.headline,
    color: colors.ink.primary,
    fontSize: 17,
  },
  message: {
    ...type.body,
    color: colors.ink.secondary,
    lineHeight: 22,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: spacing[5],
  },
  actions: {
    padding: spacing[4],
    gap: spacing[2],
  },
  actionBtn: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.50)",
    borderColor: "rgba(0,0,0,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
  },
  actionBtnDanger: {
    borderTopColor: "rgba(255,160,160,0.45)",
    borderColor: "rgba(60,0,0,0.55)",
    shadowColor: "#ef5b5b",
    shadowOpacity: 0.35,
  },
  actionBtnCancel: {
    borderTopColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(0,0,0,0.55)",
    shadowOpacity: 0.25,
  },
  actionText: {
    ...type.label,
    color: "#2a2926",
  },
  actionTextDanger: {
    color: "#ffffff",
    fontWeight: "600",
  },
  actionTextCancel: {
    color: colors.ink.tertiary,
  },
});
