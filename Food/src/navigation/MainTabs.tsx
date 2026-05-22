import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import HomeStack from "./HomeStack";
import SearchScreen from "../screens/SearchScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileDrawer from "./ProfileDrawer";
import { IconHome, IconSearch, IconOrders, IconProfile } from "../icons";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { cartCount } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: "#F6F1E9" },
        tabBarStyle: { backgroundColor: "#FFF9F2", borderTopColor: "#E6DACB", borderTopWidth: 1, height: 64, paddingBottom: 10 },
        tabBarActiveTintColor: "#E06B4F",
        tabBarInactiveTintColor: "#8A7F73",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, React.ReactNode> = {
            Home:    <IconHome size={size} color={color} />,
            Search:  <IconSearch size={size} color={color} />,
            Orders:  <IconOrders size={size} color={color} />,
            Profile: <IconProfile size={size} color={color} />,
          };
          return icons[route.name] ?? null;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "HomeMain";

          return {
            tabBarStyle: [
              { backgroundColor: "#FFF9F2", borderTopColor: "#E6DACB", borderTopWidth: 1, height: 64, paddingBottom: 10 },
              (routeName === "RestaurantDetail" || routeName === "Cart" || routeName === "OrderPlaced") && { display: "none" },
            ],
          };
        }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }}
      />
      <Tab.Screen name="Profile" component={ProfileDrawer} />
    </Tab.Navigator>
  );
}
