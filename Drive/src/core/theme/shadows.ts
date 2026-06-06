import { Platform, ViewStyle } from "react-native";
import { colors } from "./colors";

type Shadow = ViewStyle;

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } satisfies Shadow,

  card: Platform.select<Shadow>({
    ios: {
      shadowColor: "#00f0ff", // neon blue glow
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: { elevation: 8, shadowColor: "#00f0ff" },
    default: {},
  }) as Shadow,

  lift: Platform.select<Shadow>({
    ios: {
      shadowColor: "#b026ff", // neon purple glow
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
    android: { elevation: 16, shadowColor: "#b026ff" },
    default: {},
  }) as Shadow,

  inset: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  } satisfies Shadow,

  glow: {
    shadowColor: colors.accent.ivory,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  } satisfies Shadow,
} as const;
