import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import { IconMenu, IconLocation, IconOrders, IconSettings, IconHelp } from "../icons";
import { useAuth } from "../context/AuthContext";

const ACTIONS = [
  { label: "My Orders", sub: "Track and repeat meals", screen: "MyOrders", Icon: IconOrders },
  { label: "Settings", sub: "Addresses, payments, preferences", screen: "Settings", Icon: IconSettings },
  { label: "Help", sub: "Support and refunds", screen: "Help", Icon: IconHelp },
];
const DP = require("../../assets/images/dp.gif");

export default function ProfileScreen({ navigation }: any) {
  const { user, orders } = useAuth();

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.title}>Profile</Text>
          <Pressable style={s.menuBtn} onPress={() => navigation.openDrawer()}>
            <IconMenu size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={s.heroCard}>
          <ExpoImage source={DP} style={s.avatar} contentFit="cover" />
          <View style={s.userCopy}>
            <Text style={s.name}>{user?.name ?? "Juniper User"}</Text>
            <Text style={s.email}>{user?.email ?? "hello@juniper.app"}</Text>
            <View style={s.locationPill}>
              <IconLocation size={12} color="#E06B4F" />
              <Text style={s.locationText}>Bengaluru</Text>
            </View>
          </View>
        </View>

        <View style={s.stats}>
          {[{ label: "Orders", value: `${orders.length}` }, { label: "Saved", value: "8" }, { label: "Reviews", value: "12" }].map((stat) => (
            <View key={stat.label} style={s.stat}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.memberCard}>
          <Text style={s.memberLabel}>Juniper Club</Text>
          <Text style={s.memberTitle}>Free deliveries unlocked this week</Text>
          <Text style={s.memberText}>You saved ₹312 across bowls and bakery runs.</Text>
        </View>

        <Text style={s.sectionTitle}>Account</Text>
        {ACTIONS.map(({ label, sub, screen, Icon }) => (
          <Pressable key={label} style={s.actionRow} onPress={() => navigation.navigate(screen)}>
            <View style={s.actionIcon}>
              <Icon size={19} color="#FF6B00" />
            </View>
            <View style={s.actionTextWrap}>
              <Text style={s.actionTitle}>{label}</Text>
              <Text style={s.actionSub}>{sub}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9" },
  content: { padding: 20, paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  title: { fontSize: 28, fontWeight: "800", color: "#1F1A14" },
  menuBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#E6DACB", alignItems: "center", justifyContent: "center" },
  heroCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "#FFF9F2", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E6DACB" },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  userCopy: { flex: 1 },
  name: { fontSize: 21, fontWeight: "800", color: "#1F1A14" },
  email: { fontSize: 13, color: "#6C6258", marginTop: 3 },
  locationPill: { marginTop: 10, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(224,107,79,0.12)" },
  locationText: { color: "#E06B4F", fontSize: 12, fontWeight: "800" },
  stats: { flexDirection: "row", backgroundColor: "#FFF9F2", borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#E6DACB" },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "900", color: "#1F1A14" },
  statLabel: { fontSize: 12, color: "#6C6258", marginTop: 4, fontWeight: "700" },
  memberCard: { marginTop: 18, borderRadius: 18, padding: 16, backgroundColor: "#E06B4F" },
  memberLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  memberTitle: { color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 6 },
  memberText: { color: "rgba(255,255,255,0.78)", fontSize: 13, marginTop: 5 },
  sectionTitle: { color: "#1F1A14", fontSize: 18, fontWeight: "800", marginTop: 24, marginBottom: 12 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFF9F2", borderRadius: 15, borderWidth: 1, borderColor: "#E6DACB", padding: 14, marginBottom: 10 },
  actionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(224,107,79,0.12)", alignItems: "center", justifyContent: "center" },
  actionTextWrap: { flex: 1 },
  actionTitle: { color: "#1F1A14", fontSize: 15, fontWeight: "800" },
  actionSub: { color: "#6C6258", fontSize: 12, marginTop: 3 },
  chevron: { color: "#B5A796", fontSize: 24, lineHeight: 24 },
});
