import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderPlacedScreen({ route, navigation }: any) {
  const restaurantName = route.params?.restaurantName ?? "the restaurant";

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <View style={s.content}>
        <View style={s.tick}>
          <Text style={s.tickText}>✓</Text>
        </View>
        <Text style={s.title}>Order placed</Text>
        <Text style={s.sub}>Your order from {restaurantName} is confirmed.</Text>
      </View>

      <Pressable
        style={s.button}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "HomeMain" }] })}
      >
        <Text style={s.buttonText}>Back to Home</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9", padding: 20 },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  tick: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(224,107,79,0.16)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  tickText: { color: "#E06B4F", fontSize: 34, fontWeight: "900" },
  title: { color: "#1F1A14", fontSize: 28, fontWeight: "900" },
  sub: { color: "#6C6258", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8, maxWidth: 260 },
  button: { borderRadius: 14, backgroundColor: "#E06B4F", alignItems: "center", paddingVertical: 16 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
