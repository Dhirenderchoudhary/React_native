import { View, Text, FlatList, Pressable, StyleSheet, Image, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSearch, IconStar, IconClock, IconLocation, IconBolt, IconRestaurant } from "../icons";

const CATEGORIES = [
  { label: "Bakery", image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=200&q=80" },
  { label: "Bowls", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80" },
  { label: "Tandoor", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&q=80" },
  { label: "Seafood", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80" },
  { label: "Dessert", image: "https://images.unsplash.com/photo-1505253213348-fc83a9f8e0d8?w=200&q=80" },
  { label: "Coffee", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80" },
];

const RESTAURANTS = [
  { id: "1", name: "Juniper Bakehouse", cuisine: "Sourdough, brunch, pastry", price: 219, rating: "4.7", time: "18 min", offer: "Morning set", distance: "1.0 km", type: "veg", category: "Bakery", image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=500&q=80" },
  { id: "2", name: "Copper Bowl Co.", cuisine: "Grain bowls, greens, feta", price: 279, rating: "4.6", time: "24 min", offer: "Protein boost", distance: "2.4 km", type: "veg", category: "Bowls", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80" },
  { id: "3", name: "Charcoal Tandoor", cuisine: "Kebab, tikka, naan", price: 329, rating: "4.8", time: "26 min", offer: "Chef pick", distance: "1.7 km", type: "nonveg", category: "Tandoor", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80" },
  { id: "4", name: "Bay Leaf Catch", cuisine: "Prawn curry, grills, rice", price: 399, rating: "4.5", time: "32 min", offer: "Seafood night", distance: "3.1 km", type: "nonveg", category: "Seafood", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80" },
  { id: "5", name: "Bloom Dessert Bar", cuisine: "Tarts, gelato, jars", price: 169, rating: "4.7", time: "14 min", offer: "Sweet hour", distance: "1.3 km", type: "veg", category: "Dessert", image: "https://images.unsplash.com/photo-1505253213348-fc83a9f8e0d8?w=500&q=80" },
  { id: "6", name: "Drift Coffee", cuisine: "Pour-over, cold brew", price: 149, rating: "4.6", time: "12 min", offer: "Flat white", distance: "900 m", type: "veg", category: "Coffee", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80" },
  { id: "7", name: "Stone & Steam", cuisine: "Grilled plates, herb rice", price: 319, rating: "4.8", time: "28 min", offer: "Signature plate", distance: "2.2 km", type: "nonveg", category: "Tandoor", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80" },
  { id: "8", name: "Harbor Bowl", cuisine: "Citrus salmon, soba", price: 429, rating: "4.7", time: "30 min", offer: "Fresh catch", distance: "3.6 km", type: "nonveg", category: "Seafood", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80" },
  { id: "9", name: "Basil & Grain", cuisine: "Millet bowls, hummus", price: 259, rating: "4.5", time: "16 min", offer: "Green bowl", distance: "1.4 km", type: "veg", category: "Bowls", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80" },
  { id: "10", name: "Pecan Yard", cuisine: "Banana bread, croissant", price: 189, rating: "4.6", time: "15 min", offer: "Bakery box", distance: "1.8 km", type: "veg", category: "Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80" },
  { id: "11", name: "Salted Caramel Lab", cuisine: "Cheesecake, cold desserts", price: 199, rating: "4.8", time: "13 min", offer: "New jar", distance: "1.1 km", type: "veg", category: "Dessert", image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=500&q=80" },
  { id: "12", name: "Hearth & Spice", cuisine: "Roast chicken, brown rice", price: 349, rating: "4.7", time: "29 min", offer: "Dinner set", distance: "2.9 km", type: "nonveg", category: "Tandoor", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80" },
];

export default function HomeScreen({ navigation }: any) {
  const [foodType, setFoodType] = useState<"veg" | "nonveg">("nonveg");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  const visibleRestaurants = RESTAURANTS.filter((item) => {
    const typeMatches = item.type === foodType;
    const categoryMatches = !category || item.category === category;
    return typeMatches && categoryMatches;
  });

  const openRestaurant = (item: (typeof RESTAURANTS)[number]) => {
    navigation.navigate("RestaurantDetail", {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      cuisine: item.cuisine,
      rating: item.rating,
      time: item.time,
    });
  };

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <View style={s.header}>
        <View style={s.locationBlock}>
          <View style={s.locationRow}>
            <IconLocation size={14} color="#FF6B00" />
            <Text style={s.locationLabel}>18 min delivery</Text>
          </View>
          <Text style={s.locationCity}>Bengaluru, India</Text>
        </View>
        <View style={s.foodToggle}>
          <Pressable
            style={[s.toggleOption, foodType === "veg" && s.toggleVegActive]}
            onPress={() => setFoodType("veg")}
          >
            <View style={[s.foodDot, s.vegDot]} />
            <Text style={[s.toggleText, foodType === "veg" && s.toggleActiveText]}>Veg</Text>
          </Pressable>
          <Pressable
            style={[s.toggleOption, foodType === "nonveg" && s.toggleNonVegActive]}
            onPress={() => setFoodType("nonveg")}
          >
            <View style={[s.foodDot, s.nonVegDot]} />
            <Text style={[s.toggleText, foodType === "nonveg" && s.toggleActiveText]}>Non-veg</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={s.searchBar} onPress={() => navigation.navigate("Search")}>
        <IconSearch size={18} color="#8A7F73" />
        <Text style={s.searchText}>Search for bowls, tandoor, desserts</Text>
      </Pressable>

      <FlatList
        data={visibleRestaurants}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            <View style={s.promoRow}>
              <Pressable style={[s.promoCard, s.promoPrimary, selectedPromo === "bakery" && s.promoSelected]} onPress={() => { setFoodType("veg"); setCategory("Bakery"); setSelectedPromo(selectedPromo === "bakery" ? null : "bakery"); }}>
                <View style={s.wrapidoTop}>
                  <View style={s.promoIcon}>
                    <IconBolt size={18} color="#fff" />
                  </View>
                  <View style={s.wrapidoTime}>
                    <Text style={s.wrapidoTimeValue}>10</Text>
                    <Text style={s.wrapidoTimeUnit}>mins</Text>
                  </View>
                </View>
                <Text style={s.wrapidoTitle}>Juniper Rush</Text>
                <Text style={s.promoText}>Fresh bakery runs in record time</Text>
              </Pressable>
              <Pressable style={[s.promoCard, s.promoGreen, selectedPromo === "bowls" && s.promoSelected]} onPress={() => { setFoodType("veg"); setCategory("Bowls"); setSelectedPromo(selectedPromo === "bowls" ? null : "bowls"); }}>
                <View style={[s.promoIcon, s.promoGreenIcon]}>
                  <IconRestaurant size={18} color="#fff" />
                </View>
                <Text style={s.promoTitle}>Clean bowls</Text>
                <Text style={s.promoText}>Bright salads and grains that travel well</Text>
              </Pressable>
            </View>

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Find your mood</Text>
              <Text style={s.sectionAction} onPress={() => { setCategory(null); setSelectedPromo(null); }}>All</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catContent}>
              {CATEGORIES.map((cat) => (
                <Pressable key={cat.label} style={s.catItem} onPress={() => { setCategory(cat.label); setSelectedPromo(null); }}>
                  <Image source={{ uri: cat.image }} style={s.catImg} />
                  <Text style={[s.catText, category === cat.label && s.catTextActive]}>{cat.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recommended near you</Text>
              <Text style={s.sectionAction}>Sort</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => openRestaurant(item)}>
            <View style={s.imageWrap}>
              <Image source={{ uri: item.image }} style={s.cardImg} />
              <View style={s.offerPill}>
                <Text style={s.offerText}>{item.offer}</Text>
              </View>
            </View>
            <View style={s.cardBody}>
              <View style={s.cardTitleRow}>
                <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={s.ratingPill}>
                  <IconStar size={11} color="#fff" />
                  <Text style={s.ratingText}>{item.rating}</Text>
                </View>
              </View>
              <Text style={s.cardCuisine} numberOfLines={1}>{item.cuisine}</Text>
              <View style={s.cardMeta}>
                <View style={s.metaRow}>
                  <IconClock size={13} color="#8A7F73" />
                  <Text style={s.metaText}>{item.time}</Text>
                </View>
                <Text style={s.dot}>.</Text>
                <Text style={s.metaText}>{item.distance}</Text>
                <Text style={s.priceText}>From ₹{item.price}</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={s.emptyResults}>
            <Text style={s.emptyTitle}>No {foodType} picks here yet</Text>
            <Text style={s.emptyText} onPress={() => setCategory(null)}>Clear category filter</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 14 },
  locationBlock: { flex: 1, gap: 3 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationLabel: { fontSize: 11, color: "#2F7D6B", fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  locationCity: { fontSize: 20, fontWeight: "800", color: "#1F1A14" },
  foodToggle: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF9F2", borderRadius: 999, borderWidth: 1, borderColor: "#E6DACB", padding: 3 },
  toggleOption: { height: 30, paddingHorizontal: 9, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 5 },
  toggleVegActive: { backgroundColor: "#2F7D6B" },
  toggleNonVegActive: { backgroundColor: "#E06B4F" },
  toggleText: { color: "#8A7F73", fontSize: 11, fontWeight: "800" },
  toggleActiveText: { color: "#fff" },
  foodDot: { width: 7, height: 7, borderRadius: 4 },
  vegDot: { backgroundColor: "#2F7D6B" },
  nonVegDot: { backgroundColor: "#E06B4F" },

  searchBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF9F2",
    borderWidth: 1,
    borderColor: "#E6DACB",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  searchText: { color: "#8A7F73", fontSize: 14, fontWeight: "600" },
  listContent: { paddingBottom: 28 },

  promoRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  promoCard: {
    flex: 1,
    minHeight: 116,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FFF9F2",
    borderWidth: 1,
    borderColor: "#E6DACB",
    justifyContent: "flex-end",
  },
  promoPrimary: { backgroundColor: "#E06B4F", borderColor: "#E06B4F" },
  promoGreen: { backgroundColor: "#2F7D6B", borderColor: "#2F7D6B" },
  promoSelected: { borderWidth: 2, borderColor: "#1F1A14" },
  promoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.16)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  wrapidoTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  wrapidoTime: { minWidth: 54, paddingHorizontal: 8, paddingVertical: 7, borderRadius: 12, backgroundColor: "#FFF3E6", alignItems: "center" },
  wrapidoTimeValue: { color: "#E06B4F", fontSize: 20, lineHeight: 20, fontWeight: "900" },
  wrapidoTimeUnit: { color: "#E06B4F", fontSize: 10, lineHeight: 12, fontWeight: "900", textTransform: "uppercase" },
  promoGreenIcon: { backgroundColor: "rgba(0,0,0,0.16)" },
  wrapidoTitle: { fontSize: 18, fontWeight: "900", color: "#fff", marginBottom: 4 },
  promoTitle: { fontSize: 16, fontWeight: "800", color: "#fff", marginBottom: 4 },
  promoText: { fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 16 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1F1A14" },
  sectionAction: { fontSize: 13, color: "#E06B4F", fontWeight: "800" },

  catContent: { paddingHorizontal: 20, gap: 14, paddingBottom: 26 },
  catItem: { width: 76, alignItems: "center", gap: 9 },
  catImg: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, borderColor: "#E6DACB" },
  catText: { color: "#6C6258", fontSize: 12, fontWeight: "700" },
  catTextActive: { color: "#E06B4F" },
  emptyResults: { marginHorizontal: 20, alignItems: "center", padding: 24, borderRadius: 16, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#E6DACB" },
  emptyTitle: { color: "#1F1A14", fontSize: 15, fontWeight: "800" },
  emptyText: { color: "#E06B4F", fontSize: 13, fontWeight: "800", marginTop: 8 },

  card: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#FFF9F2",
    borderWidth: 1,
    borderColor: "#E6DACB",
  },
  imageWrap: { width: 104, height: 104, borderRadius: 13, overflow: "hidden", backgroundColor: "#EFE4D6" },
  cardImg: { width: "100%", height: "100%" },
  offerPill: { position: "absolute", left: 7, bottom: 7, backgroundColor: "#E06B4F", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  offerText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  cardBody: { flex: 1, paddingVertical: 3 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 },
  cardName: { flex: 1, color: "#1F1A14", fontSize: 16, fontWeight: "800" },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#2F7D6B", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  ratingText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  cardCuisine: { color: "#6C6258", fontSize: 13, marginBottom: 12 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 7 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "#8A7F73", fontSize: 12, fontWeight: "600" },
  dot: { color: "#B5A796", fontSize: 14, lineHeight: 14 },
  priceText: { color: "#E06B4F", fontSize: 12, fontWeight: "800", marginLeft: "auto" },
});
