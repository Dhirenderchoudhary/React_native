import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import CartScreen from "../screens/CartScreen";
import OrderPlacedScreen from "../screens/OrderPlacedScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#F6F1E9" },
        headerTintColor: "#1F1A14",
        headerTitleStyle: { fontWeight: "800" },
        headerBackTitle: "Back",
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F6F1E9" },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({ route }) => ({
          title: (route.params as any)?.name ?? "Restaurant",
        })}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Your Cart", animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="OrderPlaced"
        component={OrderPlacedScreen}
        options={{ headerShown: false, animation: "fade" }}
      />
    </Stack.Navigator>
  );
}
