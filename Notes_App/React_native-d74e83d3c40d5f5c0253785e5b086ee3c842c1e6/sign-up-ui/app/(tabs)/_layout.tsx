import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                sceneStyle: {
                    backgroundColor: "transparent",
                },

                tabBarStyle: {
                    position: "absolute",
                    bottom: 40,
                    left: 20,
                    marginHorizontal: 20,
                    paddingVertical: 40,
                    right: 20,
                    height: 70,
                    borderRadius: 24,
                    borderTopWidth: 0,
                    backgroundColor: "transparent",
                    elevation: 0,
                    overflow: "hidden",
                },

                tabBarBackground: () => (
                    <BlurView
                        tint="dark"
                        intensity={80}
                        experimentalBlurMethod="dimezisBlurView"
                        style={{
                            flex: 1,
                        }}
                    />
                ),

                tabBarActiveTintColor: "#10B981",
                tabBarInactiveTintColor: "#64748B",
            }}
        >
            <Tabs.Screen
                name="SignUp"
                options={{
                    title: "Sign Up",

                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-add"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="SignIn"
                options={{
                    title: "Sign In",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="log-in-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
