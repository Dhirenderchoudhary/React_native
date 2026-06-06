import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Screen } from "@/core/ui/Screen";
import { Icon } from "@/core/ui/Icon";
import { TactileButton } from "@/core/ui/TactileButton";
import { Avatar, type AvatarDesignId } from "@/core/ui/Avatar";
import {
  AVATAR_PRESETS,
  INITIAL_COLORS,
  initialsFromName,
  saveProfile,
} from "@/modules/profile/profile";
import { colors, layout, radius, type } from "@/core/theme";

export default function OnboardingProfileRoute() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatarKey, setAvatarKey] = useState<string>("preset:01");
  const [saving, setSaving] = useState(false);

  const isPreset = avatarKey.startsWith("preset:");
  const isInitials = avatarKey.startsWith("initials:");
  const presetId = isPreset
    ? (parseInt(avatarKey.slice(7), 10) as AvatarDesignId)
    : undefined;
  const initialsColor = isInitials
    ? avatarKey.slice("initials:".length).split(":")[0] ?? INITIAL_COLORS[0]
    : undefined;
  const initials = initialsFromName(name);

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => undefined);
    router.back();
  };

  const handleContinue = async () => {
    if (name.trim().length === 0) return;
    setSaving(true);
    try {
      let keyToSave = avatarKey;
      if (isInitials) {
        keyToSave = `initials:${initialsColor}:${initials}`;
      }
      await saveProfile(name, keyToSave);
      router.replace("/(tabs)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen background="canvas" padded={false} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backBtn}
          onPress={handleBack}
          accessibilityLabel="Back to permissions"
        >
          <Icon name="arrow_back" size={22} color={colors.ink.primary} />
        </Pressable>
        <View style={styles.stepPill}>
          <Text style={[type.micro, styles.stepText]}>2 / 2</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <Text style={[type.title, styles.title]}>Tell us about you</Text>
          <Text style={[type.body, styles.sub]}>
            This is what we'll show on your drives and feedback.
          </Text>
        </View>

        <View style={styles.previewBlock}>
          {isPreset && presetId ? (
            <Avatar variant="preset" presetId={presetId} size={120} />
          ) : (
            <Avatar
              variant="initials"
              initials={initials}
              initialsColor={initialsColor ?? INITIAL_COLORS[0]}
              size={120}
            />
          )}
          <View style={styles.nameWrap}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.ink.tertiary}
              style={[type.headline, styles.nameInput]}
              maxLength={32}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <View style={styles.nameLine} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[type.label, styles.sectionLabel]}>Pick an avatar · scroll for more</Text>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.avatarPicker}
          >
            <View style={styles.presetGrid}>
              {AVATAR_PRESETS.map((p) => {
                const idx = parseInt(p.id.slice(7), 10) as AvatarDesignId;
                const active = isPreset && presetId === idx;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => undefined);
                      setAvatarKey(p.id);
                    }}
                    style={({ pressed }) => [
                      styles.presetFrame,
                      {
                        borderColor: active ? colors.accent.ivory : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Avatar variant="preset" presetId={idx} size={56} />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[type.label, styles.sectionLabel]}>
            Or use your initials
          </Text>
          <View style={styles.colorRow}>
            {INITIAL_COLORS.map((c) => {
              const key = `initials:${c}:${initials}`;
              const active = avatarKey === key;
              return (
                <Pressable
                  key={c}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => undefined);
                    setAvatarKey(key);
                  }}
                  style={({ pressed }) => [
                    styles.swatch,
                    {
                      backgroundColor: c,
                      borderColor: active ? colors.ink.primary : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      type.bodyStrong,
                      {
                        color: darkOn(c)
                          ? colors.ink.inverse
                          : colors.ink.primary,
                      },
                    ]}
                  >
                    {initials === "??" ? "·" : initials}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TactileButton
          label="Continue"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleContinue}
          loading={saving}
          disabled={name.trim().length === 0}
          trailingIcon="chevron_right"
        />
      </View>
    </Screen>
  );
}

function darkOn(hex: string): boolean {
  const v = hex.replace("#", "");
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg.raised,
  },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bg.raised,
    borderRadius: radius.full,
  },
  stepText: {
    color: colors.ink.tertiary,
    letterSpacing: 1.6,
  },
  body: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: 16,
    gap: 24,
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    color: colors.ink.primary,
  },
  sub: {
    color: colors.ink.tertiary,
  },
  previewBlock: {
    alignItems: "center",
    gap: 16,
  },
  nameWrap: {
    width: "100%",
    alignItems: "center",
  },
  nameInput: {
    color: colors.ink.primary,
    textAlign: "center",
    paddingVertical: 8,
    minWidth: 200,
  },
  nameLine: {
    width: 80,
    height: 2,
    backgroundColor: colors.accent.ivory,
    opacity: 0.6,
    borderRadius: 1,
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: colors.ink.tertiary,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  avatarPicker: {
    maxHeight: 156,
  },
  presetFrame: {
    borderWidth: 2,
    borderRadius: 999,
    padding: 2,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: layout.screenPaddingX,
    paddingBottom: 24,
  },
});
