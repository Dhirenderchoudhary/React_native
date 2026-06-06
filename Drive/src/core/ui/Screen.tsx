import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ViewProps,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, layout } from "@/core/theme";

export type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  edges?: ReadonlyArray<"top" | "bottom" | "left" | "right">;
  keyboard?: boolean;
  background?: "canvas" | "surface" | "raised";
  children?: React.ReactNode;
  contentContainerStyle?: ViewProps["style"];
  refreshControl?: React.ReactElement<unknown>;
  ScrollComponent?: typeof ScrollView;
};

export function Screen({
  scroll = false,
  padded = true,
  edges = ["top", "bottom", "left", "right"],
  keyboard = false,
  background = "canvas",
  children,
  style,
  contentContainerStyle,
  refreshControl,
  ...rest
}: ScreenProps) {
  const bg = colors.bg[background];
  const Wrap = keyboard ? KeyboardAvoidingView : View;
  const inner = (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={edges as any}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            padded && styles.padded,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl as any}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.flex,
            padded && styles.padded,
            style as any,
            contentContainerStyle as any,
          ]}
          {...rest}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
  return (
    <Wrap
      style={[styles.root, { backgroundColor: bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={bg} />
      {inner}
    </Wrap>
  );
}

export function useScreenBottomInset() {
  return useSafeAreaInsets().bottom;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  padded: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
  },
});
