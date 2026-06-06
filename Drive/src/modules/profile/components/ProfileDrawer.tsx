import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Database } from "lucide-react-native";
import { Avatar, type AvatarDesignId } from "@/core/ui/Avatar";
import { Icon, type IconName } from "@/core/ui/Icon";
import { useProfile } from "@/core/hooks/useProfile";
import { isDemoSeeded, seedDemoData, unseedDemoData } from "@/shared/seedDemo";
import { colors, radius, shadows, spacing, type } from "@/core/theme";

type DrawerContextValue = {
  closeProfileDrawer: () => void;
  openProfileDrawer: () => void;
};

const ProfileDrawerContext = createContext<DrawerContextValue | null>(null);

const LINKS: Array<{ href: string; icon: IconName; label: string }> = [
  { href: "/(tabs)", icon: "home", label: "Home" },
  { href: "/(tabs)/drive", icon: "drive", label: "Drive" },
  { href: "/(tabs)/analytics", icon: "analytics", label: "Insights" },
  { href: "/(tabs)/settings", icon: "settings", label: "Settings" },
];

export function ProfileDrawerShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.82, 336);
  const progress = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const animate = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      Animated.spring(progress, {
        toValue: open ? 1 : 0,
        damping: 22,
        stiffness: 220,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    },
    [progress],
  );

  const value = useMemo(
    () => ({
      closeProfileDrawer: () => animate(false),
      openProfileDrawer: () => animate(true),
    }),
    [animate],
  );

  return (
    <ProfileDrawerContext.Provider value={value}>
      <View style={styles.shell}>
        <ProfileSidebar closeDrawer={value.closeProfileDrawer} width={drawerWidth} />
        <Animated.View
          style={[
            styles.appSurface,
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, drawerWidth],
                  }),
                },
              ],
            },
          ]}
        >
          {children}
          {isOpen ? (
            <Pressable
              accessibilityLabel="Close profile menu"
              onPress={value.closeProfileDrawer}
              style={styles.scrim}
            />
          ) : null}
        </Animated.View>
      </View>
    </ProfileDrawerContext.Provider>
  );
}

export function useProfileDrawer(): DrawerContextValue {
  const value = useContext(ProfileDrawerContext);
  if (!value) {
    throw new Error("useProfileDrawer must be used inside ProfileDrawerShell");
  }
  return value;
}

export function ProfileAvatarButton({ size = 40 }: { size?: number }) {
  const { avatar } = useProfile();
  const { openProfileDrawer } = useProfileDrawer();

  return (
    <Pressable
      accessibilityLabel="Open profile menu"
      accessibilityRole="button"
      hitSlop={8}
      onPress={openProfileDrawer}
      style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
    >
      <ProfileAvatar avatar={avatar} size={size} />
    </Pressable>
  );
}

function ProfileSidebar({
  closeDrawer,
  width,
}: {
  closeDrawer: () => void;
  width: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { avatar, profile } = useProfile();
  const [seeding, setSeeding] = useState(false);
  const [demoOn, setDemoOn] = useState(false);

  useEffect(() => {
    router.prefetch("/profile");
    isDemoSeeded().then(setDemoOn).catch(() => undefined);
  }, [router]);

  const navigate = (href: string) => {
    closeDrawer();
    requestAnimationFrame(() => router.push(href as never));
  };

  const handleDemoToggle = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      if (demoOn) {
        await unseedDemoData();
        setDemoOn(false);
      } else {
        await seedDemoData();
        setDemoOn(true);
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <SafeAreaView style={[styles.sidebar, { width }]} edges={["top", "bottom"]}>
      <View style={styles.profileBlock}>
        <Pressable onPress={closeDrawer} style={({ pressed }) => [pressed && styles.pressed]}>
          <ProfileAvatar avatar={avatar} size={64} />
        </Pressable>
        <Text style={styles.name} numberOfLines={1}>
          {profile?.name ?? "Driver"}
        </Text>
        <Text style={styles.profileHint}>DRIVER PROFILE</Text>
      </View>

      <Pressable
        onPress={() => navigate("/profile")}
        style={({ pressed }) => [styles.profileLink, pressed && styles.pressed]}
      >
        <Icon name="person" size={19} color={colors.ink.secondary} />
        <Text style={styles.profileLinkText}>Edit profile</Text>
        <Icon name="chevron_right" size={18} color={colors.ink.tertiary} />
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.linkList}>
        {LINKS.map((link) => {
          const active =
            link.href === "/(tabs)"
              ? pathname === "/" || pathname === "/index"
              : pathname.startsWith(link.href.replace("/(tabs)", ""));
          return (
            <Pressable
              key={link.href}
              onPress={() => navigate(link.href)}
              style={({ pressed }) => [
                styles.navLink,
                active && styles.navLinkActive,
                pressed && styles.pressed,
              ]}
            >
              <Icon
                name={link.icon}
                size={20}
                color={active ? colors.ink.inverse : colors.ink.secondary}
              />
              <Text style={[styles.navText, active && styles.navTextActive]}>{link.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleDemoToggle}
        style={({ pressed }) => [styles.navLink, pressed && styles.pressed]}
      >
        <Database size={20} color={seeding ? colors.ink.muted : colors.ink.secondary} />
        <Text style={[styles.navText, seeding && { color: colors.ink.muted }]}>
          Seed Demo Data
        </Text>
        <View style={[styles.toggle, demoOn && styles.toggleOn]}>
          <View style={[styles.toggleThumb, demoOn && styles.toggleThumbOn]} />
        </View>
      </Pressable>

      <View style={styles.sidebarFooter}>
        <Text style={styles.footerBrand}>CLUTCH</Text>
        <Text style={styles.footerCopy}>Drive safer. Know your habits.</Text>
      </View>
    </SafeAreaView>
  );
}

function ProfileAvatar({
  avatar,
  size,
}: {
  avatar: ReturnType<typeof useProfile>["avatar"];
  size: number;
}) {
  return avatar.kind === "preset" ? (
    <Avatar variant="preset" presetId={(avatar.index ?? 1) as AvatarDesignId} size={size} />
  ) : (
    <Avatar
      variant="initials"
      initials={avatar.initials ?? "?"}
      initialsColor={avatar.color ?? colors.accent.ivory}
      size={size}
    />
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, overflow: "hidden", backgroundColor: colors.bg.sunken },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing[5],
    backgroundColor: colors.bg.sunken,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.line.soft,
  },
  appSurface: {
    flex: 1,
    backgroundColor: colors.bg.canvas,
    shadowColor: "#000",
    shadowOpacity: 0.55,
    shadowOffset: { width: -8, height: 0 },
    shadowRadius: 18,
    elevation: 16,
  },
  scrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
    zIndex: 100,
  },
  profileBlock: { paddingTop: spacing[6], gap: spacing[2] },
  name: { ...type.headline, color: colors.ink.primary, marginTop: spacing[2] },
  profileHint: { ...type.micro, color: colors.ink.tertiary },
  profileLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    marginTop: spacing[5],
    minHeight: 52,
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    ...shadows.card,
  },
  profileLinkText: { ...type.bodyStrong, color: colors.ink.secondary, flex: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line.soft, marginVertical: spacing[5] },
  linkList: { gap: spacing[2] },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
  },
  navLinkActive: { backgroundColor: colors.accent.ivory },
  navText: { ...type.bodyStrong, color: colors.ink.secondary },
  navTextActive: { color: colors.ink.inverse },
  sidebarFooter: { marginTop: "auto", paddingBottom: spacing[5], gap: spacing[1] },
  footerBrand: { ...type.label, color: colors.ink.secondary },
  footerCopy: { ...type.caption, color: colors.ink.tertiary },
  avatarButton: { borderRadius: radius.full },
  pressed: { opacity: 0.7 },
  toggle: {
    marginLeft: "auto",
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bg.raised,
    borderWidth: 1,
    borderColor: colors.line.soft,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.accent.ivory,
    borderColor: colors.accent.ivory,
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.ink.muted,
  },
  toggleThumbOn: {
    backgroundColor: colors.ink.inverse,
    alignSelf: "flex-end",
  },
});
