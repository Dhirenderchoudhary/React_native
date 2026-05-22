import { View, Text, TextInput, StyleSheet, FlatList, Pressable, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { IconSearch, IconClock, IconStar } from "../icons";

const RESULTS = [
  { id: "1", name: "Juniper Bakehouse", cuisine: "Sourdough, pastry", price: 219, rating: "4.7", time: "18 min", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80" },
  { id: "2", name: "Copper Bowl Co.", cuisine: "Grain bowls, greens", price: 279, rating: "4.6", time: "24 min", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80" },
  { id: "3", name: "Charcoal Tandoor", cuisine: "Kebab, tikka", price: 329, rating: "4.8", time: "26 min", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&q=80" },
  { id: "4", name: "Bloom Dessert Bar", cuisine: "Tarts, gelato", price: 169, rating: "4.7", time: "14 min", image: "https://images.unsplash.com/photo-1505253213348-fc83a9f8e0d8?w=300&q=80" },
];

const QUICK_SEARCHES = ["Bowls", "Coffee", "Tandoor", "Dessert", "Seafood", "Bakery"];
const TRENDING = ["18 min delivery", "Late night plates", "Fresh bake box"];

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const filtered = RESULTS.filter((item) => {
    const value = `${item.name} ${item.cuisine}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.title}>Search</Text>
        <View style={s.inputRow}>
          <IconSearch size={18} color="#8A7F73" />
          <TextInput
            style={s.input}
            placeholder="Search dishes or restaurants"
            placeholderTextColor="#9C8F82"
            value={query}
            onChangeText={setQuery}
            autoFocus
            selectionColor="#E06B4F"
          />
        </View>
      </View>

      <FlatList
        data={query ? filtered : RESULTS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <>
            <Text style={s.sectionTitle}>Quick searches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              {QUICK_SEARCHES.map((item) => (
                <Pressable key={item} style={s.chip} onPress={() => setQuery(item)}>
                  <Text style={s.chipText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={s.sectionTitle}>Trending now</Text>
            <View style={s.trendingGrid}>
              {TRENDING.map((item) => (
                <Pressable key={item} style={s.trendingCard} onPress={() => setQuery(item.split(" ")[0])}>
                  <Text style={s.trendingText}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.sectionTitle}>{query ? "Results" : "Popular picks"}</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={s.result}
            onPress={() =>
              navigation.navigate("Home", {
                screen: "RestaurantDetail",
                params: { id: item.id, name: item.name, price: item.price, image: item.image, cuisine: item.cuisine, rating: item.rating, time: item.time },
              })
            }
          >
            <Image source={{ uri: item.image }} style={s.resultImg} />
            <View style={s.resultBody}>
              <Text style={s.resultName}>{item.name}</Text>
              <Text style={s.resultCuisine}>{item.cuisine}</Text>
              <View style={s.metaRow}>
                <IconStar size={12} color="#E06B4F" />
                <Text style={s.metaText}>{item.rating}</Text>
                <IconClock size={12} color="#8A7F73" />
                <Text style={s.metaText}>{item.time}</Text>
                <Text style={s.priceText}>₹{item.price}</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={s.empty}>No matches nearby</Text>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, gap: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#1F1A14" },
  inputRow: { height: 48, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFF9F2", borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E6DACB" },
  input: { flex: 1, fontSize: 15, color: "#1F1A14" },
  list: { paddingHorizontal: 20, paddingBottom: 28 },
  sectionTitle: { color: "#1F1A14", fontSize: 17, fontWeight: "800", marginBottom: 12, marginTop: 10 },
  chips: { gap: 10, paddingBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#E6DACB" },
  chipText: { color: "#6C6258", fontSize: 13, fontWeight: "700" },
  trendingGrid: { gap: 10, marginBottom: 16 },
  trendingCard: { backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#E6DACB", borderRadius: 14, padding: 14 },
  trendingText: { color: "#1F1A14", fontSize: 14, fontWeight: "700" },
  result: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EDE1D3" },
  resultImg: { width: 72, height: 72, borderRadius: 14, backgroundColor: "#EFE4D6" },
  resultBody: { flex: 1, justifyContent: "center" },
  resultName: { color: "#1F1A14", fontSize: 16, fontWeight: "800", marginBottom: 3 },
  resultCuisine: { color: "#6C6258", fontSize: 13, marginBottom: 9 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#8A7F73", fontSize: 12, fontWeight: "700" },
  priceText: { color: "#E06B4F", fontSize: 12, fontWeight: "800", marginLeft: "auto" },
  empty: { color: "#8A7F73", textAlign: "center", marginTop: 36, fontSize: 14 },
});
