import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "../screens/ProfileScreen";
import { MyOrdersScreen, SettingsScreen, HelpScreen } from "../screens/DrawerScreens";
import CustomDrawer from "./CustomDrawer";

const Drawer = createDrawerNavigator();

export default function ProfileDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#F6F1E9" },
        headerTintColor: "#1F1A14",
        headerTitleStyle: { fontWeight: "800" },
        drawerType: "front",
        drawerStyle: { width: 280 },
        sceneStyle: { backgroundColor: "#F6F1E9" },
      }}
    >
      <Drawer.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Profile", headerShown: false }} />
      <Drawer.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: "My Orders" }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      <Drawer.Screen name="Help" component={HelpScreen} options={{ title: "Help & Support" }} />
    </Drawer.Navigator>
  );
}
