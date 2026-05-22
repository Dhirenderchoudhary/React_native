import { View, Text, Pressable, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { IconRestaurant, IconBolt, IconLocation } from "../icons";

const HERO = "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=900&q=90";

const FEATURES = [
  { Icon: IconRestaurant, label: "Seasonal kitchens, curated daily" },
  { Icon: IconBolt,       label: "Fast prep, steady delivery" },
  { Icon: IconLocation,   label: "Live kitchen and rider tracking" },
];

export default function OnboardingScreen({ navigation }: any) {
  return (
    <ImageBackground source={{ uri: HERO }} style={s.root} resizeMode="cover">
      <LinearGradient
        colors={["rgba(246,241,233,0)", "rgba(26,19,14,0.55)", "#1A130E"]}
        locations={[0, 0.5, 0.9]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView style={s.safe} edges={["bottom"]}>
        <View style={s.content}>
          <Text style={s.logo}>Juniper</Text>
          <Text style={s.headline}>{"Dinner plans,\nmade simple."}</Text>

          <View style={s.features}>
            {FEATURES.map(({ Icon, label }) => (
              <View key={label} style={s.row}>
                <View style={s.iconWrap}><Icon size={18} color="#E06B4F" /></View>
                <Text style={s.featureText}>{label}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [s.btn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => navigation.replace("MainTabs")}
          >
            <Text style={s.btnText}>Get Started</Text>
          </Pressable>

          <Text style={s.skip} onPress={() => navigation.replace("MainTabs")}>
            Skip for now
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1A130E" },
  safe: { flex: 1, justifyContent: "flex-end" },
  content: { paddingHorizontal: 28, paddingBottom: 36 },
  logo: { fontSize: 20, fontWeight: "900", color: "#F4E4D3", letterSpacing: 0.6, marginBottom: 14, textTransform: "uppercase" },
  headline: { fontSize: 46, fontWeight: "800", color: "#FFF9F2", letterSpacing: -1.4, lineHeight: 50, marginBottom: 32 },
  features: { gap: 14, marginBottom: 40 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(224,107,79,0.2)", alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: 15, color: "rgba(255,249,242,0.75)", fontWeight: "500" },
  btn: { backgroundColor: "#E06B4F", borderRadius: 14, paddingVertical: 17, alignItems: "center", marginBottom: 14 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  skip: { color: "rgba(255,249,242,0.5)", fontSize: 14, textAlign: "center" },
});
