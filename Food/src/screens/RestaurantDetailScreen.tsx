import { View, Text, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { IconStar, IconClock, IconCart } from "../icons";

const MENU = [
  { id: "1", name: "Citrus Herb Chicken", desc: "Lemon zest, grilled chicken, herb rice", price: 289, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80" },
  { id: "2", name: "Charred Veg Tandoor", desc: "Seasonal vegetables, smoky yogurt", price: 249, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&q=80" },
  { id: "3", name: "Sesame Citrus Bowl", desc: "Greens, grains, citrus dressing", price: 229, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80" },
  { id: "4", name: "Spice Butter Prawns", desc: "Garlic butter, chilli oil, basmati", price: 349, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80" },
  { id: "5", name: "Sourdough Melt", desc: "Toasted loaf, tomato jam, cheese", price: 179, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80" },
  { id: "6", name: "Green Tahini Salad", desc: "Cucumber, herbs, lemon tahini", price: 199, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&q=80" },
  { id: "7", name: "Smoky Pepper Paneer", desc: "Paneer, roasted peppers, onion", price: 239, image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=300&q=80" },
  { id: "8", name: "Roast Chicken Plate", desc: "Gravy, herbed potatoes", price: 319, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&q=80" },
  { id: "9", name: "Cold Brew Tonic", desc: "Citrus tonic, coffee over ice", price: 139, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80" },
  { id: "10", name: "Rose Milk Pudding", desc: "Creamy milk pudding, pistachio", price: 159, image: "https://images.unsplash.com/photo-1505253213348-fc83a9f8e0d8?w=300&q=80" },
  { id: "11", name: "Chilli Garlic Rice", desc: "Wok tossed rice, scallions", price: 189, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&q=80" },
  { id: "12", name: "Basil Pesto Pasta", desc: "Pesto cream, toasted nuts", price: 269, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&q=80" },
  { id: "13", name: "Warm Olive Focaccia", desc: "Olive oil, sea salt, herbs", price: 149, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80" },
  { id: "14", name: "Miso Veg Skewer", desc: "Charred veg, miso glaze", price: 219, image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=300&q=80" },
  { id: "15", name: "Lime Mint Cooler", desc: "Crushed ice, citrus fizz", price: 109, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80" },
  { id: "16", name: "Dark Cocoa Tart", desc: "Bittersweet tart, cream", price: 189, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&q=80" },
];

const FALLBACK = {
  name: "Juniper Kitchen",
  price: 279,
  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=85",
  cuisine: "Seasonal plates",
  rating: "4.7",
  time: "24 min",
};

export default function RestaurantDetailScreen({ route, navigation }: any) {
  const params = route.params ?? {};
  const name = params.name ?? FALLBACK.name;
  const price = params.price ?? FALLBACK.price;
  const image = params.image ?? FALLBACK.image;
  const cuisine = params.cuisine ?? FALLBACK.cuisine;
  const rating = params.rating ?? FALLBACK.rating;
  const time = params.time ?? FALLBACK.time;
  const { cartCount, setCartCount } = useAuth();
  const [menuCounts, setMenuCounts] = useState<Record<string, number>>({});

  const addToCart = (itemId: string) => {
    setMenuCounts((counts) => ({ ...counts, [itemId]: (counts[itemId] ?? 0) + 1 }));
    setCartCount((count) => count + 1);
  };

  const removeFromCart = (itemId: string) => {
    setMenuCounts((counts) => {
      const current = counts[itemId] ?? 0;

      if (current <= 1) {
        const { [itemId]: _removed, ...nextCounts } = counts;
        return nextCounts;
      }

      return { ...counts, [itemId]: current - 1 };
    });
    setCartCount((count) => Math.max(count - 1, 0));
  };

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Image source={{ uri: image }} style={s.hero} />

        <SafeAreaView edges={["bottom"]}>
          <View style={s.content}>
            <Text style={s.name}>{name}</Text>
            <Text style={s.cuisine}>{cuisine}</Text>

            <View style={s.metaRow}>
              <View style={s.meta}>
                <IconStar size={14} color="#E06B4F" />
                <Text style={s.metaText}>{rating}</Text>
              </View>
              <View style={s.meta}>
                <IconClock size={14} color="#8A7F73" />
                <Text style={s.metaText}>{time}</Text>
              </View>
              <Text style={s.metaPrice}>From ₹{price}</Text>
            </View>

            <View style={s.divider} />
            <Text style={s.menuTitle}>Menu ({MENU.length} items)</Text>

            {MENU.map((item) => (
              <View key={item.id} style={s.menuItem}>
                <Image source={{ uri: item.image }} style={s.menuImg} />
                <View style={s.menuInfo}>
                  <Text style={s.menuName}>{item.name}</Text>
                  <Text style={s.menuDesc} numberOfLines={2}>{item.desc}</Text>
                  <Text style={s.menuPrice}>₹{item.price}</Text>
                </View>
                {(menuCounts[item.id] ?? 0) > 0 ? (
                  <View style={s.qtyControl}>
                    <Pressable style={s.qtyBtn} onPress={() => removeFromCart(item.id)}>
                      <Text style={s.qtyBtnText}>-</Text>
                    </Pressable>
                    <Text style={s.qtyCount}>{menuCounts[item.id]}</Text>
                    <Pressable style={s.qtyBtn} onPress={() => addToCart(item.id)}>
                      <Text style={s.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={s.addBtn} onPress={() => addToCart(item.id)}>
                    <Text style={s.addBtnText}>+</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>

      {/* Sticky cart button */}
      {cartCount > 0 && (
        <SafeAreaView edges={["bottom"]} style={s.cartBar}>
          <Pressable style={s.cartBtn} onPress={() => navigation.navigate("Cart", { restaurantName: name })}>
            <IconCart size={18} color="#fff" />
            <Text style={s.cartBtnText}>View Cart ({cartCount})</Text>
          </Pressable>
        </SafeAreaView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9" },
  hero: { width: "100%", height: 260 },
  content: { padding: 20 },
  name: { fontSize: 26, fontWeight: "800", color: "#1F1A14", letterSpacing: -0.5 },
  cuisine: { fontSize: 14, color: "#6C6258", marginTop: 4, marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13, color: "#8A7F73" },
  metaPrice: { marginLeft: "auto" as any, fontSize: 14, color: "#E06B4F", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#E6DACB", marginVertical: 20 },
  menuTitle: { fontSize: 18, fontWeight: "800", color: "#1F1A14", marginBottom: 16 },
  menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  menuImg: { width: 72, height: 72, borderRadius: 12 },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 15, fontWeight: "700", color: "#1F1A14" },
  menuDesc: { fontSize: 12, color: "#6C6258", marginTop: 3, lineHeight: 17 },
  menuPrice: { fontSize: 14, color: "#E06B4F", fontWeight: "700", marginTop: 6 },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E06B4F", alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 20, lineHeight: 22 },
  qtyControl: { minWidth: 88, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "#E06B4F", backgroundColor: "rgba(224,107,79,0.12)", flexDirection: "row", alignItems: "center", justifyContent: "space-between", overflow: "hidden" },
  qtyBtn: { width: 30, height: "100%", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { color: "#E06B4F", fontSize: 20, lineHeight: 22, fontWeight: "800" },
  qtyCount: { minWidth: 20, textAlign: "center", color: "#1F1A14", fontSize: 13, fontWeight: "900" },
  cartBar: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: "#F6F1E9" },
  cartBtn: { backgroundColor: "#E06B4F", borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
