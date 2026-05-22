import {
  View, Text, Pressable, StyleSheet, ActivityIndicator,
  TextInput, Keyboard, Platform, ImageBackground,
} from "react-native";
import type { KeyboardEvent } from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";

const HERO = "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=900&q=90";
const LOGIN_KEYBOARD_GAP = 16;
const KEYBOARD_OVERLAP_OFFSET = 205;
const MAX_KEYBOARD_LIFT = 150;
const USER_ICON = require("../../assets/icons/user.svg");
const LOCK_ICON = require("../../assets/icons/lock.svg");
const UNLOCK_ICON = require("../../assets/icons/unlock.svg");
const GOOGLE_IMAGE = require("../../assets/images/google.png");
const INSTAGRAM_IMAGE = require("../../assets/images/insta.png");
const WHATSAPP_IMAGE = require("../../assets/images/whatsapp.png");

export default function LoginScreen() {
  const { login, signup, socialLogin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [keyboardLift, setKeyboardLift] = useState(0);

  const updateKeyboardLift = (keyboardHeight: number) => {
    const lift = Math.max(keyboardHeight - KEYBOARD_OVERLAP_OFFSET + LOGIN_KEYBOARD_GAP, 0);
    setKeyboardLift(Math.min(lift, MAX_KEYBOARD_LIFT));
  };

  const syncKeyboardLift = () => {
    const metrics = Keyboard.metrics?.();

    if (metrics?.height) {
      updateKeyboardLift(metrics.height);
    }
  };

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      updateKeyboardLift(event.endCoordinates.height);
    });
    const changeSub = Keyboard.addListener("keyboardDidChangeFrame", (event: KeyboardEvent) => {
      updateKeyboardLift(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardLift(0));

    return () => {
      showSub.remove();
      changeSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleAuth = async () => {
    setError("");
    setLoading("email");

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not continue.");
    } finally {
      setLoading(null);
    }
  };

  const handleSocial = async (id: string) => {
    setError("");
    setLoading(id);

    try {
      await socialLogin(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not continue.");
      setLoading(null);
    }
  };

  const switchMode = () => {
    setError("");
    setPassword("");
    setConfirmPassword("");
    setPasswordVisible(false);
    setConfirmPasswordVisible(false);
    setMode((value) => (value === "login" ? "signup" : "login"));
  };

  return (
    <ImageBackground source={{ uri: HERO }} style={s.root} resizeMode="cover">
      <LinearGradient
        colors={["transparent", "rgba(26,19,14,0.65)", "#1A130E", "#1A130E"]}
        locations={[0, 0.5, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
        <View style={s.spacer} />

        <View style={[s.loginPanel, { transform: [{ translateY: -keyboardLift }] }]}>
            <View style={s.logoArea}>
              <Text style={s.logo}>Juniper</Text>
              <Text style={s.tagline}>seasonal plates, steady delivery</Text>
            </View>
            <View style={s.inputArea}>
              <View style={s.inputWrap}>
                <ExpoImage source={USER_ICON} style={s.fieldIcon} contentFit="contain" />
                <TextInput
                  style={s.input}
                  placeholder="Email address"
                  placeholderTextColor="#9C8F82"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  selectionColor="#E06B4F"
                  returnKeyType="next"
                  onFocus={() => requestAnimationFrame(syncKeyboardLift)}
                />
              </View>
              <View style={s.inputWrap}>
                <Pressable
                  hitSlop={10}
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  accessibilityRole="button"
                  accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                >
                  <ExpoImage source={passwordVisible ? UNLOCK_ICON : LOCK_ICON} style={s.fieldIcon} contentFit="contain" />
                </Pressable>
                <TextInput
                  style={s.input}
                  placeholder="Password"
                  placeholderTextColor="#9C8F82"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  selectionColor="#E06B4F"
                  returnKeyType={mode === "signup" ? "next" : "done"}
                  onSubmitEditing={mode === "login" ? handleAuth : undefined}
                  onFocus={() => requestAnimationFrame(syncKeyboardLift)}
                />
              </View>
              {mode === "signup" && (
                <View style={s.inputWrap}>
                  <Pressable
                    hitSlop={10}
                    onPress={() => setConfirmPasswordVisible((visible) => !visible)}
                    accessibilityRole="button"
                    accessibilityLabel={confirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                  >
                    <ExpoImage source={confirmPasswordVisible ? UNLOCK_ICON : LOCK_ICON} style={s.fieldIcon} contentFit="contain" />
                  </Pressable>
                  <TextInput
                    style={s.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#9C8F82"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!confirmPasswordVisible}
                    selectionColor="#E06B4F"
                    returnKeyType="done"
                    onSubmitEditing={handleAuth}
                    onFocus={() => requestAnimationFrame(syncKeyboardLift)}
                  />
                </View>
              )}
              {!!error && <Text style={s.errorText}>{error}</Text>}
              <Pressable
                style={({ pressed }) => [s.loginBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={handleAuth}
                disabled={!!loading}
              >
                {loading === "email" ? <ActivityIndicator color="#fff" /> : <Text style={s.loginText}>{mode === "signup" ? "Create account" : "Log in"}</Text>}
              </Pressable>
              {mode === "login" && <Text style={s.forgot}>Forgot password?</Text>}
            </View>
        </View>

        <View style={s.socialArea}>
          <View style={s.divider}>
            <View style={s.line} /><Text style={s.orText}>OR</Text><View style={s.line} />
          </View>
          <View style={s.circles}>
            <CircleBtn id="google" loading={loading} onPress={handleSocial} bg="#fff" label="Google">
              <ExpoImage source={GOOGLE_IMAGE} style={s.socialImage} contentFit="contain" />
            </CircleBtn>
            <CircleBtn id="instagram" loading={loading} onPress={handleSocial} bg="#000" label="Instagram" border>
              <ExpoImage source={INSTAGRAM_IMAGE} style={s.socialImage} contentFit="contain" />
            </CircleBtn>
            <CircleBtn id="whatsapp" loading={loading} onPress={handleSocial} bg="#000" label="WhatsApp" border>
              <ExpoImage source={WHATSAPP_IMAGE} style={s.whatsappImage} contentFit="contain" />
            </CircleBtn>
          </View>
          <View style={s.signupRow}>
            <Text style={s.signupLabel}>{mode === "signup" ? "Already have an account? " : "Don't have an account? "}</Text>
            <Text style={s.signupLink} onPress={switchMode}>{mode === "signup" ? "Log in." : "Sign up."}</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function CircleBtn({ id, loading, onPress, bg, label, border, children }: {
  id: string; loading: string | null; onPress: (id: string) => void;
  bg: string; label: string; border?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={s.circleWrap}>
      <Pressable
        style={({ pressed }) => [
          s.circle, { backgroundColor: bg, opacity: pressed ? 0.8 : 1 },
          border && { borderWidth: 1.5, borderColor: "#333" },
        ]}
        onPress={() => onPress(id)}
        disabled={!!loading}
      >
        {loading === id
          ? <ActivityIndicator color={bg === "#fff" ? "#111" : "#fff"} size="small" />
          : children}
      </Pressable>
      <Text style={s.circleLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1A130E" },
  safe: { flex: 1, paddingBottom: 28 },
  spacer: { flex: 1 },
  loginPanel: { marginBottom: 14 },

  logoArea: { paddingHorizontal: 28, marginBottom: 16 },
  logo: { fontSize: 48, fontWeight: "900", color: "#FFF9F2", letterSpacing: -1.5, marginBottom: 4 },
  tagline: { fontSize: 13, color: "rgba(255,249,242,0.6)", letterSpacing: 0.4 },

  inputArea: { paddingHorizontal: 28, gap: 10 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,249,242,0.12)",
    borderWidth: 1, borderColor: "rgba(255,249,242,0.2)",
    borderRadius: 10, paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14, fontSize: 14, color: "#FFF9F2",
  },
  fieldIcon: { width: 18, height: 18, opacity: 0.92 },
  loginBtn: {
    backgroundColor: "#E06B4F", borderRadius: 10,
    paddingVertical: 14, alignItems: "center",
    minHeight: 50, justifyContent: "center",
  },
  loginText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  errorText: { color: "#F1A07D", fontSize: 12, lineHeight: 16 },
  socialArea: { paddingHorizontal: 28 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,249,242,0.2)" },
  orText: { color: "rgba(255,249,242,0.55)", fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  circles: { flexDirection: "row", justifyContent: "center", gap: 28, marginBottom: 20 },
  circleWrap: { alignItems: "center", gap: 8 },
  circle: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  socialImage: { width: 26, height: 26 },
  whatsappImage: { width: 32, height: 32 },
  circleLabel: { color: "rgba(255,249,242,0.6)", fontSize: 11 },
  signupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signupLabel: { color: "rgba(255,249,242,0.6)", fontSize: 13 },
  signupLink: { color: "#E06B4F", fontSize: 13, fontWeight: "700" },
  forgot: { color: "rgba(255,249,242,0.6)", fontSize: 13, textAlign: "center", paddingTop: 0 },
});
