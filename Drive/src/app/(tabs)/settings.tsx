import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, type IconName } from "@/core/ui/Icon";
import { Screen } from "@/core/ui/Screen";
import { useThemedDialog } from "@/core/ui/ThemedDialog";
import {
  deleteGroqApiKey,
  hasGroqApiKey,
  saveGroqApiKey,
} from "@/modules/analytics/groqKey";
import { settingsRepo } from "@/core/db/connect";
import {
  isSensitivity,
  TELEMETRY_SETTING_KEYS as SETTING_KEYS,
} from "@/modules/drive/settings";
import type { Sensitivity } from "@/modules/drive/detector";
import { colors, layout, radius, spacing, type } from "@/core/theme";

type SamplingRate = 30 | 60 | 120;
const KEYBOARD_CARD_MARGIN = 15;

export default function SettingsTab() {
  const [sensitivity, setSensitivity] = useState<Sensitivity>("normal");
  const [batteryMode, setBatteryMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [samplingRate, setSamplingRate] = useState<SamplingRate>(60);
  const [groqApiKey, setGroqApiKey] = useState("");
  const [hasSavedGroqKey, setHasSavedGroqKey] = useState(false);
  const [showGroqApiKey, setShowGroqApiKey] = useState(false);
  const [savingGroqKey, setSavingGroqKey] = useState(false);
  const [editingGroqKey, setEditingGroqKey] = useState(false);
  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState(false);
  const [keyboardReserve, setKeyboardReserve] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const groqCardRef = useRef<View>(null);
  const scrollY = useRef(0);
  const { dialog, showDialog } = useThemedDialog();

  useEffect(() => {
    settingsRepo
      .getAllSettings()
      .then((settings) => {
        const storedSensitivity = settings[SETTING_KEYS.sensitivity];
        if (isSensitivity(storedSensitivity)) {
          setSensitivity(storedSensitivity);
        }
        setBatteryMode(settings[SETTING_KEYS.batteryMode] === "1");
        if (settings[SETTING_KEYS.notifications] != null) {
          setNotifications(settings[SETTING_KEYS.notifications] === "1");
        }
        const storedRate = Number(settings[SETTING_KEYS.samplingRate]);
        if (storedRate === 30 || storedRate === 60 || storedRate === 120) {
          setSamplingRate(storedRate);
        }
      })
      .catch(() => undefined);
    hasGroqApiKey().then(setHasSavedGroqKey).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!editingGroqKey) return;
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      scrollGroqCardAboveKeyboard(event.endCoordinates);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardReserve(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [editingGroqKey]);

  const scrollGroqCardAboveKeyboard = (metrics = Keyboard.metrics()) => {
    if (!metrics) return;
    setKeyboardReserve(metrics.height + KEYBOARD_CARD_MARGIN);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        groqCardRef.current?.measureInWindow((_x, y, _width, height) => {
          const overlap = y + height + KEYBOARD_CARD_MARGIN - metrics.screenY;
          if (overlap <= 0) return;
          scrollRef.current?.scrollTo({
            y: scrollY.current + overlap,
            animated: true,
          });
        });
      });
    });
  };

  const saveSensitivity = useCallback((value: Sensitivity) => {
    selectionHaptic();
    setSensitivity(value);
    settingsRepo.setSetting(SETTING_KEYS.sensitivity, value).catch(() => undefined);
  }, []);

  const saveBoolean = useCallback((key: string, value: boolean) => {
    selectionHaptic();
    settingsRepo.setSetting(key, value ? "1" : "0").catch(() => undefined);
  }, []);

  const cycleSamplingRate = () => {
    selectionHaptic();
    const next = samplingRate === 30 ? 60 : samplingRate === 60 ? 120 : 30;
    setSamplingRate(next);
    settingsRepo.setSetting(SETTING_KEYS.samplingRate, String(next)).catch(() => undefined);
  };

  const saveGroqKey = async () => {
    setSavingGroqKey(true);
    try {
      await saveGroqApiKey(groqApiKey);
      setGroqApiKey("");
      setHasSavedGroqKey(true);
      setEditingGroqKey(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
      showDialog({
        title: "Groq key saved",
        message: "AI coaching can now use your Groq account.",
      });
    } catch (error) {
      showDialog({
        title: "Could not save key",
        message: error instanceof Error ? error.message : "Try entering the key again.",
      });
    } finally {
      setSavingGroqKey(false);
    }
  };

  const removeGroqKey = () => {
    showDialog({
      title: "Remove Groq API key?",
      message: "AI coaching will use local telemetry suggestions until another key is added.",
      actions: [
        { label: "Keep key", tone: "cancel" },
        {
          label: "Remove key",
          tone: "danger",
          onPress: () => {
            deleteGroqApiKey()
              .then(() => {
                selectionHaptic();
                setGroqApiKey("");
                setHasSavedGroqKey(false);
                setEditingGroqKey(false);
              })
              .catch(() =>
                showDialog({ title: "Could not remove key", message: "Try again." }),
              );
          },
        },
      ],
    });
  };

  return (
    <Screen background="canvas" padded={false} edges={["top"]}>
      <View style={styles.root}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#272a2d', '#1c1f22']}
            style={styles.headerIcon}
          >
            <Icon name="settings" size={20} color={colors.ink.primary} />
          </LinearGradient>
          <Text style={styles.brand}>SETTINGS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          onScroll={(event) => {
            scrollY.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={styles.pageEyebrow}>DRIVE SYSTEM</Text>
            <Text style={styles.pageTitle}>Calibration</Text>
            <Text style={styles.pageSub}>Tune how Clutch records and responds on the road.</Text>
          </View>

          <Text style={styles.groupLabel}>DETECTION PROFILE</Text>
          <LinearGradient
            colors={['#2a2d30', '#1c1f22', '#151718']}
            style={styles.profilePanel}
          >
            <View style={styles.profileHeading}>
              <LinearGradient
                colors={['#f0ede5', '#cbc7be']}
                style={styles.profileIcon}
              >
                <Icon name="tune" size={20} color={colors.ink.inverse} />
              </LinearGradient>
              <View style={styles.profileCopy}>
                <Text style={styles.profileTitle}>Event sensitivity</Text>
                <Text style={styles.profileSub}>Applies when your next ride begins.</Text>
              </View>
              <Text style={styles.profileValue}>{sensitivity}</Text>
            </View>
            <LinearGradient
              colors={['#0c0d0f', '#111315']}
              style={styles.segmentWell}
            >
              {(["low", "normal", "high"] as Sensitivity[]).map((value) => (
                <Pressable
                  key={value}
                  onPress={() => saveSensitivity(value)}
                  style={[styles.segment, sensitivity === value && styles.segmentActiveBase]}
                >
                  {sensitivity === value ? (
                    <LinearGradient
                      colors={['#e8e4da', '#d0ccc3']}
                      style={styles.segmentActiveGradient}
                    >
                      <Text style={[styles.segmentText, styles.segmentTextActive]}>
                        {value}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.segmentText}>{value}</Text>
                  )}
                </Pressable>
              ))}
            </LinearGradient>
          </LinearGradient>

          <Text style={styles.groupLabel}>RIDE RECORDING</Text>
          <LinearGradient
            colors={['#1e2124', '#161819']}
            style={styles.panel}
          >
            <SettingRow
              icon="battery"
              title="Battery efficiency"
              subtitle="Reduce GPS polling while recording."
              value={batteryMode}
              onChange={(value) => {
                setBatteryMode(value);
                saveBoolean(SETTING_KEYS.batteryMode, value);
              }}
            />
            <SettingRow
              icon="bell"
              title="Critical feedback"
              subtitle="Haptic alerts for severe events."
              value={notifications}
              onChange={(value) => {
                setNotifications(value);
                saveBoolean(SETTING_KEYS.notifications, value);
              }}
            />
            <Pressable
              onPress={cycleSamplingRate}
              style={({ pressed }) => [
                styles.settingRow,
                styles.settingRowLast,
                pressed && styles.rowPressed,
              ]}
            >
              <LinearGradient
                colors={['#272a2d', '#1e2124']}
                style={styles.rowIcon}
              >
                <Icon name="gauge" size={18} color={colors.ink.secondary} />
              </LinearGradient>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Sampling rate</Text>
                <Text style={styles.settingSub}>Accelerometer frequency.</Text>
              </View>
              <LinearGradient
                colors={['#08090b', '#0f1113']}
                style={styles.valueWell}
              >
                <Text style={styles.valueText}>{samplingRate} Hz</Text>
                <Icon name="chevron_down" size={16} color={colors.ink.tertiary} />
              </LinearGradient>
            </Pressable>
          </LinearGradient>

          <Text style={styles.groupLabel}>AI COACHING</Text>
          <View ref={groqCardRef}>
          <LinearGradient
            colors={['#1e2124', '#161819']}
            style={styles.panel}
          >
            <View style={styles.keyHeading}>
              <LinearGradient
                colors={['#272a2d', '#1e2124']}
                style={styles.rowIcon}
              >
                <Icon name="sparkles" size={18} color={colors.ink.secondary} />
              </LinearGradient>
              <View style={styles.keyHeadingCopy}>
                <Text style={styles.settingTitle}>Groq API key</Text>
                <Text style={styles.settingSub}>
                  {hasSavedGroqKey
                    ? "Stored securely on this device."
                    : "Optional. Enables personal suggestions."}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  selectionHaptic();
                  setEditingGroqKey((value) => !value);
                }}
                style={({ pressed }) => [pressed && styles.rowPressed]}
              >
                <LinearGradient
                  colors={['#2a2d30', '#1e2124']}
                  style={styles.configureButton}
                >
                  <Text style={styles.configureText}>
                    {editingGroqKey ? "CLOSE" : hasSavedGroqKey ? "REPLACE" : "ADD KEY"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
            {editingGroqKey ? (
              <View style={styles.keyEditor}>
                <LinearGradient
                  colors={['#07080a', '#0e1012']}
                  style={styles.keyInputWell}
                >
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setGroqApiKey}
                    placeholder={hasSavedGroqKey ? "Enter replacement key" : "gsk_..."}
                    placeholderTextColor={colors.ink.tertiary}
                    secureTextEntry={!showGroqApiKey}
                    style={styles.keyInput}
                    value={groqApiKey}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollGroqCardAboveKeyboard();
                      }, 280);
                    }}
                  />
                  <Pressable
                    accessibilityLabel={showGroqApiKey ? "Hide API key" : "Show API key"}
                    onPress={() => setShowGroqApiKey((value) => !value)}
                    style={({ pressed }) => pressed && styles.rowPressed}
                  >
                    <Icon
                      name={showGroqApiKey ? "visibility_off" : "visibility"}
                      size={18}
                      color={colors.ink.tertiary}
                    />
                  </Pressable>
                  <Pressable
                    disabled={savingGroqKey || !groqApiKey.trim()}
                    onPress={() => saveGroqKey().catch(() => undefined)}
                    style={({ pressed }) => [
                      styles.keyIconButton,
                      (!groqApiKey.trim() || savingGroqKey) && styles.buttonDisabled,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    {savingGroqKey ? (
                      <ActivityIndicator color={colors.ink.secondary} />
                    ) : (
                      <Icon name="save" size={16} color={colors.ink.secondary} />
                    )}
                  </Pressable>
                </LinearGradient>
                <View style={styles.keyFooter}>
                  <Text style={styles.keyHelp}>Encrypted device storage. Sent only to Groq.</Text>
                  {hasSavedGroqKey ? (
                    <Pressable onPress={removeGroqKey}>
                      <Text style={styles.removeKeyText}>REMOVE</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ) : null}
          </LinearGradient>
          </View>

          <Text style={styles.groupLabel}>SYSTEM</Text>
          <LinearGradient
            colors={['#1e2124', '#161819']}
            style={styles.panel}
          >
            <Pressable
              onPress={() => {
                selectionHaptic();
                setDiagnosticsExpanded((value) => !value);
              }}
              style={({ pressed }) => [
                styles.settingRow,
                styles.settingRowLast,
                pressed && styles.rowPressed,
              ]}
            >
              <LinearGradient
                colors={['#272a2d', '#1e2124']}
                style={styles.rowIcon}
              >
                <Icon name="info" size={18} color={colors.ink.secondary} />
              </LinearGradient>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Diagnostics</Text>
                <Text style={styles.settingSub}>Engine v1.0.0 · local sensor fusion</Text>
              </View>
              <Icon
                name={diagnosticsExpanded ? "chevron_up" : "chevron_down"}
                size={18}
                color={colors.ink.tertiary}
              />
            </Pressable>
            {diagnosticsExpanded ? (
              <LinearGradient
                colors={['#07080a', '#0c0e10']}
                style={styles.diagnosticWell}
              >
                <DiagnosticLine label="Sensitivity" value={sensitivity} />
                <DiagnosticLine label="Battery efficiency" value={batteryMode ? "enabled" : "disabled"} />
                <DiagnosticLine label="Critical feedback" value={notifications ? "enabled" : "disabled"} />
                <DiagnosticLine label="Sampling rate" value={`${samplingRate} Hz`} />
              </LinearGradient>
            ) : null}
          </LinearGradient>
          {keyboardReserve > 0 ? <View style={{ height: keyboardReserve }} /> : null}
        </ScrollView>
        {dialog}
      </View>
    </Screen>
  );
}

function DiagnosticLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diagnosticLine}>
      <Text style={styles.diagnosticLabel}>{label}</Text>
      <Text style={styles.diagnosticValue}>{value}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <LinearGradient
        colors={['#272a2d', '#1e2124']}
        style={styles.rowIcon}
      >
        <Icon name={icon} size={18} color={colors.ink.secondary} />
      </LinearGradient>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSub}>{subtitle}</Text>
      </View>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.toggleTrackWrapper}
    >
      <LinearGradient
        colors={value ? ['#2a2d30', '#1c1f22'] : ['#0a0b0d', '#111315']}
        style={styles.toggleTrack}
      >
        <LinearGradient
          colors={value ? ['#f0ede5', '#cbc7be'] : ['#d8d5cc', '#a8a49c']}
          style={[styles.toggleThumb, value && styles.toggleThumbActive]}
        >
          <Icon
            name="power"
            size={13}
            color={value ? colors.ink.inverse : colors.ink.tertiary}
          />
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

function selectionHaptic() {
  Haptics.selectionAsync().catch(() => undefined);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.canvas },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPaddingX,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    overflow: "hidden",
  },
  headerSpacer: { width: 40 },
  brand: { ...type.headline, color: colors.ink.primary, letterSpacing: 1.6 },
  content: {
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
  },
  intro: { marginBottom: spacing[1] },
  pageEyebrow: { ...type.micro, color: colors.ink.tertiary },
  pageTitle: { ...type.title, color: colors.ink.primary, marginTop: spacing[1] },
  pageSub: { ...type.body, color: colors.ink.tertiary, marginTop: spacing[1] },
  groupLabel: {
    ...type.micro,
    color: colors.ink.tertiary,
    marginTop: spacing[2],
    paddingHorizontal: spacing[1],
  },
  panel: {
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(0,0,0,0.50)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.60,
    shadowRadius: 18,
  },
  profilePanel: {
    gap: spacing[4],
    padding: spacing[4],
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(0,0,0,0.50)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.60,
    shadowRadius: 18,
  },
  profileHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  profileIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    overflow: "hidden",
  },
  profileCopy: { flex: 1 },
  profileTitle: { ...type.subhead, color: colors.ink.primary },
  profileSub: { ...type.caption, color: colors.ink.tertiary, marginTop: 2 },
  profileValue: {
    ...type.micro,
    color: colors.ink.secondary,
    textTransform: "uppercase",
  },
  segmentWell: {
    flexDirection: "row",
    minHeight: 54,
    padding: spacing[1],
    borderRadius: radius.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.90)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.60)',
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    overflow: "hidden",
  },
  segmentActiveBase: {},
  segmentActiveGradient: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.65)',
  },
  segmentText: {
    ...type.micro,
    color: colors.ink.tertiary,
    textTransform: "uppercase",
  },
  segmentTextActive: { color: '#2a2926' },
  settingRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line.hairline,
  },
  settingRowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
    overflow: "hidden",
  },
  settingCopy: { flex: 1 },
  settingTitle: { ...type.bodyStrong, color: colors.ink.primary },
  settingSub: { ...type.caption, color: colors.ink.tertiary, marginTop: 2 },
  toggleTrackWrapper: {},
  toggleTrack: {
    width: 52,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 3,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.90)',
    borderColor: 'rgba(0,0,0,0.5)',
    overflow: "hidden",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
    overflow: "hidden",
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  valueWell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.85)',
    overflow: "hidden",
  },
  valueText: { ...type.label, color: colors.ink.secondary },
  keyHeading: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  keyHeadingCopy: { flex: 1 },
  configureButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    overflow: "hidden",
  },
  configureText: { ...type.micro, color: colors.ink.secondary, fontSize: 9 },
  keyEditor: {
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line.hairline,
  },
  keyInputWell: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    marginTop: spacing[3],
    borderRadius: radius.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.90)',
    overflow: "hidden",
  },
  keyInput: { ...type.body, flex: 1, color: colors.ink.primary },
  keyHelp: { ...type.caption, color: colors.ink.tertiary },
  keyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  removeKeyText: { ...type.micro, color: colors.status.danger, fontSize: 9 },
  keyIconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.bg.raised,
  },
  buttonDisabled: { opacity: 0.45 },
  diagnosticWell: {
    gap: spacing[2],
    padding: spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line.hairline,
  },
  diagnosticLine: { flexDirection: "row", justifyContent: "space-between", gap: spacing[3] },
  diagnosticLabel: { ...type.caption, color: colors.ink.tertiary },
  diagnosticValue: {
    ...type.label,
    color: colors.ink.secondary,
    textTransform: "uppercase",
  },
  rowPressed: { opacity: 0.72 },
});
