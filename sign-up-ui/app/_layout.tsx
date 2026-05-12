import { Stack } from "expo-router";

export default function RootLayout() {

    return (

        <Stack screenOptions={{
            headerShown: false, contentStyle: {
                backgroundColor: "#3F001A80",
            },
        }}>
            <Stack.Screen name="(tabs)" />
        </Stack>

    );
}
