import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function CartScreen({ route, navigation }: any) {
  const restaurantName = route.params?.restaurantName ?? "Current restaurant";
  const { cartCount, setCartCount, addOrder } = useAuth();
  const itemPrice = 229;
  const deliveryFee = 39;

  const placeOrder = async () => {
    if (cartCount === 0) return;

    await addOrder({
      place: restaurantName,
      items: `${cartCount} menu item${cartCount > 1 ? "s" : ""}`,
      total: cartCount * itemPrice + deliveryFee,
    });
    setCartCount(0);
    navigation.replace("OrderPlaced", { restaurantName });
  };

  return (
    <SafeAreaView style={s.root} edges={["bottom"]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Your Cart</Text>
        <Text style={s.sub}>From {restaurantName}</Text>

        <View style={s.divider} />

        {cartCount > 0 ? (
          <View style={s.item}>
            <View style={s.itemInfo}>
              <Text style={s.itemName}>Menu items</Text>
              <Text style={s.itemDesc}>{cartCount}x from {restaurantName}</Text>
            </View>
            <View style={s.qtyRow}>
              <Pressable style={s.qtyBtn} onPress={() => setCartCount((count) => Math.max(count - 1, 0))}>
                <Text style={s.qtyText}>-</Text>
              </Pressable>
              <Text style={s.qtyCount}>{cartCount}</Text>
              <Pressable style={s.qtyBtn} onPress={() => setCartCount((count) => count + 1)}>
                <Text style={s.qtyText}>+</Text>
              </Pressable>
            </View>
            <Text style={s.itemPrice}>₹{cartCount * itemPrice}</Text>
          </View>
        ) : (
          <View style={s.emptyCart}>
            <Text style={s.emptyTitle}>Cart is empty</Text>
            <Text style={s.emptyText}>Add a dish to start your order.</Text>
          </View>
        )}

        <View style={s.divider} />

        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Subtotal</Text>
          <Text style={s.summaryValue}>₹{cartCount * itemPrice}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Delivery fee</Text>
          <Text style={s.summaryValue}>₹{deliveryFee}</Text>
        </View>
        <View style={[s.summaryRow, { marginTop: 8 }]}>
          <Text style={[s.summaryLabel, { color: "#1F1A14", fontWeight: "700" }]}>Total</Text>
          <Text style={[s.summaryValue, { color: "#E06B4F", fontWeight: "700" }]}>
            ₹{cartCount * itemPrice + deliveryFee}
          </Text>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Pressable style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>Keep Browsing</Text>
        </Pressable>
        <Pressable style={[s.orderBtn, cartCount === 0 && s.orderBtnDisabled]} onPress={placeOrder} disabled={cartCount === 0}>
          <Text style={s.orderText}>Place Order</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9" },
  scroll: { padding: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#1F1A14", letterSpacing: -0.5 },
  sub: { fontSize: 14, color: "#6C6258", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#E6DACB", marginVertical: 20 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "700", color: "#1F1A14" },
  itemDesc: { fontSize: 12, color: "#6C6258", marginTop: 2 },
  itemPrice: { fontSize: 15, color: "#1F1A14", fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E6DACB", borderRadius: 999, overflow: "hidden" },
  qtyBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF3E6" },
  qtyText: { color: "#E06B4F", fontSize: 18, fontWeight: "900" },
  qtyCount: { minWidth: 24, textAlign: "center", color: "#1F1A14", fontSize: 13, fontWeight: "800" },
  emptyCart: { alignItems: "center", borderRadius: 16, borderWidth: 1, borderColor: "#E6DACB", padding: 24, backgroundColor: "#FFF9F2" },
  emptyTitle: { color: "#1F1A14", fontSize: 17, fontWeight: "800" },
  emptyText: { color: "#6C6258", fontSize: 13, marginTop: 5 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: "#6C6258" },
  summaryValue: { fontSize: 14, color: "#1F1A14" },
  footer: { flexDirection: "row", gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: "#E6DACB", backgroundColor: "#F6F1E9" },
  backBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, borderWidth: 1, borderColor: "#E6DACB", alignItems: "center", backgroundColor: "#FFF9F2" },
  backText: { color: "#6C6258", fontSize: 15, fontWeight: "700" },
  orderBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: "#E06B4F", alignItems: "center" },
  orderBtnDisabled: { opacity: 0.4 },
  orderText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
