import React, { useEffect, useState } from "react";
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
import { Avatar, type AvatarDesignId } from "@/core/ui/Avatar";
import { Icon } from "@/core/ui/Icon";
import { Screen } from "@/core/ui/Screen";
import { TactileButton } from "@/core/ui/TactileButton";
import { useThemedDialog } from "@/core/ui/ThemedDialog";
import { useProfile } from "@/core/hooks/useProfile";
import {
  AVATAR_PRESETS,
  INITIAL_COLORS,
  initialsFromName,
  saveProfile,
} from "@/modules/profile/profile";
import { colors, layout, radius, shadows, spacing, type } from "@/core/theme";

const AVATAR_GROUPS = ["ILLUSTRATED", "MONOCHROME", "3D"] as const;

export default function ProfileRoute() {
  const router = useRouter();
  const { dialog, showDialog } = useThemedDialog();
  const { profile } = useProfile();
  const [name, setName] = useState("");
  const [avatarKey, setAvatarKey] = useState<string>("preset:01");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [avatarGroup, setAvatarGroup] = useState(0);

  useEffect(() => {
    if (!profile || hydrated) return;
    setName(profile.name);
    setAvatarKey(profile.avatar_key);
    if (profile.avatar_key.startsWith("preset:")) {
      setAvatarGroup(Math.floor((parseInt(profile.avatar_key.slice(7), 10) - 1) / 9));
    }
    setHydrated(true);
  }, [hydrated, profile]);

  const isPreset = avatarKey.startsWith("preset:");
  const isInitials = avatarKey.startsWith("initials:");
  const presetId = isPreset
    ? (parseInt(avatarKey.slice(7), 10) as AvatarDesignId)
    : undefined;
  const initialsColor = isInitials
    ? avatarKey.slice("initials:".length).split(":")[0] ?? INITIAL_COLORS[0]
    : undefined;
  const initials = initialsFromName(name);

  const chooseAvatar = (key: string) => {
    Haptics.selectionAsync().catch(() => undefined);
    setAvatarKey(key);
  };

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const resolvedAvatar = isInitials
        ? `initials:${initialsColor ?? INITIAL_COLORS[0]}:${initials}`
        : avatarKey;
      await saveProfile(name, resolvedAvatar);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      router.back();
    } catch (error) {
      showDialog({ title: "Could not save profile", message: String(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen background="canvas" padded={false} edges={["top", "bottom"]} keyboard>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          >
            <Icon name="arrow_back" size={20} color={colors.ink.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>PROFILE</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
            <View style={styles.intro}>
              <Text style={styles.eyebrow}>DRIVER IDENTITY</Text>
              <Text style={styles.title}>Your profile</Text>
              <Text style={styles.subtitle}>Choose how you appear during rides and in coaching.</Text>
            </View>

            <View style={styles.previewPanel}>
              {isPreset && presetId ? (
                <Avatar variant="preset" presetId={presetId} size={112} />
              ) : (
                <Avatar
                  variant="initials"
                  initials={initials}
                  initialsColor={initialsColor ?? INITIAL_COLORS[0]}
                  size={112}
                />
              )}
              <View style={styles.nameWell}>
                <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
                <TextInput
                  autoCapitalize="words"
                  maxLength={32}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.ink.muted}
                  returnKeyType="done"
                  style={styles.nameInput}
                  value={name}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>VISUAL AVATAR</Text>
              <View style={styles.panel}>
                <View style={styles.groupSelector}>
                  {AVATAR_GROUPS.map((group, index) => (
                    <Pressable
                      key={group}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => undefined);
                        setAvatarGroup(index);
                      }}
                      style={[styles.groupButton, avatarGroup === index && styles.groupButtonActive]}
                    >
                      <Text style={[styles.groupButtonText, avatarGroup === index && styles.groupButtonTextActive]}>
                        {group}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {AVATAR_GROUPS.map((group, groupIndex) => (
                  <ScrollView
                    key={group}
                    contentContainerStyle={styles.avatarPickerContent}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={[styles.avatarPicker, groupIndex !== avatarGroup && styles.hidden]}
                    pointerEvents={groupIndex !== avatarGroup ? "none" : "auto"}
                  >
                    {AVATAR_PRESETS.slice(groupIndex * 9, groupIndex * 9 + 9).map((preset) => {
                      const id = parseInt(preset.id.slice(7), 10) as AvatarDesignId;
                      const active = isPreset && presetId === id;
                      return (
                        <Pressable
                          key={preset.id}
                          accessibilityLabel={`Select ${group.toLowerCase()} avatar ${id}`}
                          onPress={() => chooseAvatar(preset.id)}
                          style={({ pressed }) => [
                            styles.avatarChoice,
                            active && styles.avatarChoiceActive,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Avatar variant="preset" presetId={id} size={58} />
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>INITIALS AVATAR</Text>
              <View style={styles.panel}>
                <Text style={styles.panelHint}>Use your initials with a restrained accent color.</Text>
                <View style={styles.colorRow}>
                  {INITIAL_COLORS.map((color) => {
                    const active = isInitials && initialsColor === color;
                    return (
                      <Pressable
                        key={color}
                        accessibilityLabel={`Select initials avatar ${color}`}
                        onPress={() => chooseAvatar(`initials:${color}:${initials}`)}
                        style={({ pressed }) => [
                          styles.colorChoice,
                          { backgroundColor: color },
                          active && styles.colorChoiceActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.initials, { color: darkOn(color) ? colors.ink.inverse : colors.ink.primary }]}>
                          {initials === "??" ? "·" : initials}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <TactileButton
              disabled={!name.trim()}
              fullWidth
              label="Save Profile"
              loading={saving}
              onPress={handleSave}
              size="lg"
              trailingIcon="check"
              variant="primary"
            />
        </ScrollView>
      </View>
      {dialog}
    </Screen>
  );
}

function darkOn(hex: string): boolean {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line.hairline,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg.raised,
  },
  headerTitle: { ...type.label, color: colors.ink.primary },
  headerSpacer: { width: 40 },
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  intro: { gap: spacing[1] },
  eyebrow: { ...type.micro, color: colors.ink.tertiary },
  title: { ...type.title, color: colors.ink.primary },
  subtitle: { ...type.body, color: colors.ink.tertiary },
  previewPanel: {
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[5],
    borderRadius: radius.xl,
    backgroundColor: colors.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    ...shadows.card,
  },
  nameWell: {
    width: "100%",
    gap: spacing[1],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.bg.sunken,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
  },
  fieldLabel: { ...type.micro, color: colors.ink.tertiary },
  nameInput: { ...type.subhead, color: colors.ink.primary, paddingVertical: spacing[1] },
  section: { gap: spacing[2] },
  sectionLabel: { ...type.label, color: colors.ink.tertiary },
  panel: {
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
  },
  panelHint: { ...type.caption, color: colors.ink.tertiary, marginBottom: spacing[3] },
  groupSelector: {
    flexDirection: "row",
    padding: spacing[1],
    marginBottom: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.bg.sunken,
  },
  groupButton: { flex: 1, alignItems: "center", paddingVertical: spacing[2], borderRadius: radius.sm },
  groupButtonActive: { backgroundColor: colors.accent.ivory },
  groupButtonText: { ...type.micro, color: colors.ink.tertiary, fontSize: 9 },
  groupButtonTextActive: { color: colors.ink.inverse },
  avatarPicker: { maxHeight: 68 },
  avatarPickerContent: { gap: spacing[3], paddingRight: spacing[1] },
  hidden: { height: 0, overflow: "hidden" },
  avatarChoice: { padding: 2, borderRadius: radius.full, borderWidth: 2, borderColor: "transparent" },
  avatarChoiceActive: { borderColor: colors.accent.ivory },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing[3] },
  colorChoice: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorChoiceActive: { borderColor: colors.ink.primary },
  initials: { ...type.bodyStrong },
  pressed: { opacity: 0.7 },
});
