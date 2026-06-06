import React from "react";
import { Text } from "react-native";
import { Screen } from "@/core/ui/Screen";
import { colors, type } from "@/core/theme";

export default function HistoryTab() {
  return (
    <Screen padded>
      <Text style={[type.title, { color: colors.ink.primary }]}>History</Text>
      <Text style={[type.body, { color: colors.ink.tertiary, marginTop: 8 }]}>
        Day 3 fills this in.
      </Text>
    </Screen>
  );
}
