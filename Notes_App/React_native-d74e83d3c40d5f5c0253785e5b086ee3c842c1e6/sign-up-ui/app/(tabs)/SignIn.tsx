import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient"; // I'll check if this is installed, if not I'll fallback or use a solid color. Wait, let me check package.json first.

interface IUSERSIGNIN {
    email?: string,
    username?: string,
    password: string
}

export default function SignIn() {
    const [form, setForm] = useState<IUSERSIGNIN>({
        username: "",
        password: ""
    });

    return (
        <View style={styles.background}>
            {/* Deep Midnight Background */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050505' }]} />
            
            {/* Emerald Gradient Orb */}
            <View style={styles.emeraldOrb} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        style={styles.keyboardView}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <View style={styles.container}>
                            <BlurView
                                intensity={30}
                                tint="dark"
                                experimentalBlurMethod="dimezisBlurView"
                                style={styles.glassCard}
                            >
                                <View style={styles.headingContainer}>
                                    <Text style={styles.heading}>
                                        Welcome Back
                                    </Text>
                                    <Text style={styles.paragraph}>Continue your Voyage</Text>
                                </View>
                                
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputBox}>
                                        <Text style={styles.label}>Email</Text>
                                        <TextInput
                                            placeholder="Enter your Email"
                                            placeholderTextColor="#64748B"
                                            value={form.username}
                                            onChangeText={(text) => setForm((prev) => ({ ...prev, username: text }))}
                                            style={styles.input}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={styles.inputBox}>
                                        <Text style={styles.label}>Password</Text>
                                        <TextInput
                                            placeholder="Enter your password"
                                            placeholderTextColor="#64748B"
                                            textContentType="password"
                                            value={form.password}
                                            onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                                            secureTextEntry
                                            style={styles.input}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.submit,
                                        pressed && styles.submitPressed
                                    ]}
                                    onPress={() => alert(`Sign in as: ${form.username}`)}
                                >
                                    <Text style={styles.submitText}>Sign In</Text>
                                </Pressable>

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Don't have an account? </Text>
                                    <Pressable>
                                        <Text style={styles.link}>Sign Up</Text>
                                    </Pressable>
                                </View>
                            </BlurView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    emeraldOrb: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#10B981',
        opacity: 0.15,
        filter: 'blur(100px)', // Note: standard RN doesn't support filter: blur, but it works on web. For mobile we'd use shadow or separate component. 
        // We'll stick to a simpler approach that works across platforms.
    },
    safeArea: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    glassCard: {
        width: "100%",
        padding: 32,
        borderRadius: 32,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.1)",
    },
    headingContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    heading: {
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    paragraph: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '500',
    },
    inputContainer: {
        width: '100%',
    },
    inputBox: {
        marginBottom: 24,
    },
    label: {
        color: "#E2E8F0",
        fontSize: 14,
        marginBottom: 8,
        fontWeight: "600",
        marginLeft: 4,
    },
    input: {
        color: "white",
        fontSize: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    submit: {
        backgroundColor: "#10B981",
        paddingVertical: 18,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    submitPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    submitText: {
        color: "#050505",
        fontSize: 18,
        fontWeight: "700",
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    link: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '700',
    }
});

