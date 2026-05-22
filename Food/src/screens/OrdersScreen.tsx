import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { IconClock, IconCart, IconRestaurant } from "../icons";

export default function OrdersScreen({ navigation }: any) {
  const { cartCount, orders, setCartCount } = useAuth();
  const subtotal = cartCount * 229;

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Orders</Text>
        <Text style={s.subtitle}>Track carts, active orders and repeats</Text>
      </View>

      {cartCount > 0 ? (
        <Pressable
          style={s.activeCard}
          onPress={() => navigation.navigate("Home", { screen: "Cart", params: { restaurantName: "Current restaurant" } })}
        >
          <View style={s.activeTop}>
            <View style={s.iconBubble}>
              <IconCart size={20} color="#fff" />
            </View>
            <View style={s.activeCopy}>
              <Text style={s.activeLabel}>Cart waiting</Text>
              <Text style={s.activeTitle}>{cartCount} item{cartCount > 1 ? "s" : ""} ready to checkout</Text>
            </View>
            <Text style={s.activePrice}>₹{subtotal}</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={s.progressFill} />
          </View>
          <Text style={s.activeHint}>Tap to review your cart and place the order</Text>
        </Pressable>
      ) : (
        <View style={s.emptyCard}>
          <IconRestaurant size={28} color="#FF6B00" />
          <Text style={s.emptyTitle}>No active order</Text>
          <Text style={s.emptyText}>Start from Home and your live cart will appear here.</Text>
        </View>
      )}

      <Text style={s.sectionTitle}>Past orders</Text>
      {orders.map((order) => (
        <View key={order.id} style={s.orderCard}>
          <View style={s.orderTop}>
            <Text style={s.orderPlace}>{order.place}</Text>
            <Text style={s.orderTotal}>₹{order.total}</Text>
          </View>
          <Text style={s.orderItems}>{order.items}</Text>
          <View style={s.orderMeta}>
            <IconClock size={13} color="#777" />
            <Text style={s.orderDate}>{order.date}</Text>
            <Text style={s.orderId}>{order.id}</Text>
          </View>
          <Pressable
            style={s.reorderBtn}
            onPress={() => {
              setCartCount(Math.max(Number.parseInt(order.items, 10) || 1, 1));
              navigation.navigate("Home", { screen: "Cart", params: { restaurantName: order.place } });
            }}
          >
            <Text style={s.reorderText}>Reorder</Text>
          </Pressable>
        </View>
      ))}
      {orders.length === 0 && (
        <View style={s.historyEmpty}>
          <Text style={s.historyEmptyText}>Placed orders will land here.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9", padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#1F1A14" },
  subtitle: { color: "#6C6258", fontSize: 13, marginTop: 5 },
  activeCard: { backgroundColor: "#FFF9F2", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E6DACB", marginBottom: 24 },
  activeTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBubble: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E06B4F", alignItems: "center", justifyContent: "center" },
  activeCopy: { flex: 1 },
  activeLabel: { color: "#E06B4F", fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  activeTitle: { color: "#1F1A14", fontSize: 16, fontWeight: "800", marginTop: 3 },
  activePrice: { color: "#1F1A14", fontSize: 16, fontWeight: "900" },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: "#EDE1D3", marginTop: 16, overflow: "hidden" },
  progressFill: { width: "62%", height: "100%", backgroundColor: "#E06B4F" },
  activeHint: { color: "#8A7F73", fontSize: 12, marginTop: 12 },
  emptyCard: { alignItems: "center", justifyContent: "center", minHeight: 180, backgroundColor: "#FFF9F2", borderRadius: 18, borderWidth: 1, borderColor: "#E6DACB", padding: 20, marginBottom: 24 },
  emptyTitle: { color: "#1F1A14", fontSize: 18, fontWeight: "800", marginTop: 12 },
  emptyText: { color: "#6C6258", fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18 },
  sectionTitle: { color: "#1F1A14", fontSize: 18, fontWeight: "800", marginBottom: 12 },
  orderCard: { backgroundColor: "#FFF9F2", borderRadius: 16, borderWidth: 1, borderColor: "#E6DACB", padding: 15, marginBottom: 12 },
  orderTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  orderPlace: { color: "#1F1A14", fontSize: 16, fontWeight: "800" },
  orderTotal: { color: "#E06B4F", fontSize: 14, fontWeight: "900" },
  orderItems: { color: "#6C6258", fontSize: 13, marginBottom: 12 },
  orderMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  orderDate: { color: "#8A7F73", fontSize: 12, fontWeight: "700" },
  orderId: { color: "#B5A796", fontSize: 12, fontWeight: "700", marginLeft: "auto" },
  reorderBtn: { marginTop: 14, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(224,107,79,0.12)" },
  reorderText: { color: "#E06B4F", fontSize: 12, fontWeight: "900" },
  historyEmpty: { backgroundColor: "#FFF9F2", borderRadius: 16, borderWidth: 1, borderColor: "#E6DACB", padding: 16 },
  historyEmptyText: { color: "#6C6258", fontSize: 13, textAlign: "center" },
});
