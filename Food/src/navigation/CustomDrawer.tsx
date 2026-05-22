import { View, Text, Pressable, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerContentComponentProps } from "@react-navigation/drawer";
import { Image as ExpoImage } from "expo-image";
import { useAuth } from "../context/AuthContext";
import { IconOrders, IconSettings, IconHelp, IconLogout } from "../icons";

const ITEMS = [
  { label: "My Orders", screen: "MyOrders", Icon: IconOrders },
  { label: "Settings", screen: "Settings", Icon: IconSettings },
  { label: "Help & Support", screen: "Help", Icon: IconHelp },
];
const DP = require("../../assets/images/dp.gif");

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const { logout, user } = useAuth();
  const active = props.state.routes[props.state.index].name;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={s.root}>
      {/* User info */}
      <View style={s.userSection}>
        <ExpoImage source={DP} style={s.avatar} contentFit="cover" />
        <Text style={s.name}>{user?.name ?? "Juniper User"}</Text>
        <Text style={s.email}>{user?.email ?? "hello@juniper.app"}</Text>
      </View>

      {/* Nav items */}
      <View style={s.items}>
        {ITEMS.map(({ label, screen, Icon }) => {
          const isActive = active === screen;
          return (
            <Pressable
              key={screen}
              style={[s.item, isActive && s.itemActive]}
              onPress={() => props.navigation.navigate(screen)}
            >
              <Icon size={20} color={isActive ? "#E06B4F" : "#8A7F73"} />
              <Text style={[s.itemText, isActive && s.itemTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Logout */}
      <Pressable style={s.logoutBtn} onPress={async () => { props.navigation.closeDrawer(); await logout(); }}>
        <IconLogout size={20} color="#E06B4F" />
        <Text style={s.logoutText}>Logout</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F1E9", paddingTop: 0 },
  userSection: { padding: 24, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: "#E6DACB", marginBottom: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: "800", color: "#1F1A14" },
  email: { fontSize: 13, color: "#8A7F73", marginTop: 3 },
  items: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 2 },
  itemActive: { backgroundColor: "rgba(224,107,79,0.12)" },
  itemText: { fontSize: 15, color: "#6C6258", fontWeight: "600" },
  itemTextActive: { color: "#E06B4F", fontWeight: "700" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 14, margin: 12, padding: 14, borderRadius: 12, backgroundColor: "rgba(224,107,79,0.12)" },
  logoutText: { fontSize: 15, color: "#E06B4F", fontWeight: "700" },
});
