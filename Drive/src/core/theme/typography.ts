import { Platform, TextStyle } from "react-native";

const family = "Inter";

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

type T = TextStyle;

const tabularNums: T = {
  fontVariant: ["tabular-nums"],
};

export const type = {
  display: {
    fontFamily: family,
    fontSize: 48,
    lineHeight: 52,
    fontWeight: fontWeight.bold,
    letterSpacing: -1.2,
  } satisfies T,
  title: {
    fontFamily: family,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.6,
  } satisfies T,
  headline: {
    fontFamily: family,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
  } satisfies T,
  subhead: {
    fontFamily: family,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.2,
  } satisfies T,
  body: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeight.regular,
    letterSpacing: 0,
  } satisfies T,
  bodyStrong: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0,
  } satisfies T,
  caption: {
    fontFamily: family,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeight.regular,
    letterSpacing: 0.1,
  } satisfies T,
  label: {
    fontFamily: family,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  } satisfies T,
  micro: {
    fontFamily: family,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  } satisfies T,
  metric: {
    fontFamily: family,
    fontSize: 64,
    lineHeight: 68,
    fontWeight: fontWeight.bold,
    letterSpacing: -2,
    ...tabularNums,
  } satisfies T,
  metricSm: {
    fontFamily: family,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.8,
    ...tabularNums,
  } satisfies T,
  numeric: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    ...tabularNums,
  } satisfies T,
} as const;

export const fontFamily = family;
export const platform = Platform.OS;
