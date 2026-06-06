import React from "react";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { StyleSheet, View } from "react-native";
import { colors } from "@/core/theme";

export type AvatarDesignId =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18
  | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27;

export type AvatarProps = {
  size?: number;
  initials?: string;
  variant: "preset" | "initials";
  presetId?: AvatarDesignId;
  initialsColor?: string;
};

type FacePreset = {
  bg: [string, string];
  skin: string;
  skinShade: string;
  hair: string;
  shirt: string;
  hairStyle: "crop" | "curl" | "part" | "bun" | "wave" | "short";
  accessory?: "beard" | "glasses" | "freckles";
};

const FACE_PRESETS: Record<number, FacePreset> = {
  1: { bg: ["#d4c9b8", "#a99a87"], skin: "#d79b74", skinShade: "#b87958", hair: "#33251f", shirt: "#344951", hairStyle: "crop" },
  2: { bg: ["#b5c8c6", "#789596"], skin: "#8f573f", skinShade: "#70402f", hair: "#211b1a", shirt: "#755746", hairStyle: "curl", accessory: "beard" },
  3: { bg: ["#c5b9ce", "#887d96"], skin: "#efbd98", skinShade: "#cf9875", hair: "#a55735", shirt: "#4d5269", hairStyle: "part", accessory: "freckles" },
  4: { bg: ["#d6c6ad", "#a48f72"], skin: "#70412e", skinShade: "#573023", hair: "#1d1918", shirt: "#596a53", hairStyle: "bun" },
  5: { bg: ["#bfc7d6", "#7c8ba2"], skin: "#c9855e", skinShade: "#a96549", hair: "#2a2020", shirt: "#654e68", hairStyle: "wave", accessory: "glasses" },
  6: { bg: ["#c7d1b8", "#879875"], skin: "#e4ad83", skinShade: "#bf805f", hair: "#59412c", shirt: "#4a6572", hairStyle: "short" },
  7: { bg: ["#d1b9b3", "#a17872"], skin: "#a9684a", skinShade: "#874d39", hair: "#241b1b", shirt: "#435f5b", hairStyle: "crop", accessory: "glasses" },
  8: { bg: ["#c9c2ad", "#958b73"], skin: "#f0c5a2", skinShade: "#ce9c7a", hair: "#d2b080", shirt: "#6c5961", hairStyle: "wave" },
  9: { bg: ["#b7c9d0", "#718d98"], skin: "#88513b", skinShade: "#6d3d2f", hair: "#171719", shirt: "#625c3f", hairStyle: "short", accessory: "freckles" },
};

type MonoPreset = {
  bg: string;
  ink: string;
  mid: string;
  light: string;
  face: "round" | "long" | "wide" | "small";
  hair: "cap" | "bob" | "mohawk" | "bald" | "side" | "afro";
  eyes: "dots" | "calm" | "wide" | "wink" | "sharp" | "sleepy";
  detail?: "glasses" | "beard" | "earring";
};

const MONO_PRESETS: MonoPreset[] = [
  { bg: "#e3e1dc", ink: "#28292a", mid: "#858581", light: "#c7c5bf", face: "long", hair: "side", eyes: "calm" },
  { bg: "#c9cccb", ink: "#202223", mid: "#737776", light: "#b1b5b3", face: "wide", hair: "afro", eyes: "dots", detail: "glasses" },
  { bg: "#dedbd4", ink: "#363533", mid: "#92908b", light: "#c8c5be", face: "small", hair: "mohawk", eyes: "sharp" },
  { bg: "#bfc2c1", ink: "#222425", mid: "#767978", light: "#aeb2b0", face: "round", hair: "bob", eyes: "wide", detail: "earring" },
  { bg: "#dad9d5", ink: "#292a2b", mid: "#898a88", light: "#c1c1bd", face: "wide", hair: "bald", eyes: "sleepy", detail: "beard" },
  { bg: "#c8c5bf", ink: "#333230", mid: "#85827d", light: "#b6b2ab", face: "long", hair: "cap", eyes: "wink" },
  { bg: "#d5d7d6", ink: "#252728", mid: "#7f8383", light: "#bec2c1", face: "small", hair: "afro", eyes: "wide" },
  { bg: "#c8c9c5", ink: "#303130", mid: "#81827f", light: "#b3b5b0", face: "round", hair: "side", eyes: "sharp", detail: "glasses" },
  { bg: "#e0ddd6", ink: "#292826", mid: "#8c8984", light: "#c8c4bc", face: "wide", hair: "bob", eyes: "calm" },
];

type DepthPreset = {
  bg: [string, string];
  skin: [string, string, string];
  hair: string;
  shirt: string;
  head: "huge" | "large" | "medium" | "small";
  hairStyle: FacePreset["hairStyle"];
  detail?: "glasses" | "beard" | "freckles";
};

const DEPTH_PRESETS: DepthPreset[] = [
  { bg: ["#b6ced2", "#6f9298"], skin: ["#f7c29a", "#d98f69", "#a96045"], hair: "#4b2d21", shirt: "#506979", head: "huge", hairStyle: "wave" },
  { bg: ["#d3c2aa", "#9a8061"], skin: ["#9e684d", "#744431", "#4d2b22"], hair: "#211a19", shirt: "#646044", head: "small", hairStyle: "short", detail: "beard" },
  { bg: ["#c7b8d4", "#826e98"], skin: ["#f7cfb0", "#dea17f", "#a66d53"], hair: "#8a4a32", shirt: "#655372", head: "large", hairStyle: "part", detail: "freckles" },
  { bg: ["#bed0b3", "#78906e"], skin: ["#be825f", "#955c43", "#663a2d"], hair: "#211b1b", shirt: "#46615a", head: "medium", hairStyle: "bun" },
  { bg: ["#c7d1df", "#768ba6"], skin: ["#e7b18d", "#bd795a", "#824a39"], hair: "#2d2422", shirt: "#5e536e", head: "small", hairStyle: "curl", detail: "glasses" },
  { bg: ["#dac4b9", "#a67869"], skin: ["#8d5b45", "#653b30", "#44261f"], hair: "#191719", shirt: "#3f5c6c", head: "huge", hairStyle: "crop" },
  { bg: ["#d7d0b4", "#9d936b"], skin: ["#f5cba7", "#d69771", "#985d47"], hair: "#c49a67", shirt: "#6c604c", head: "large", hairStyle: "wave" },
  { bg: ["#b7c8cf", "#6c8691"], skin: ["#b97858", "#8e533e", "#603429"], hair: "#1e1a1b", shirt: "#475f5c", head: "medium", hairStyle: "short", detail: "glasses" },
  { bg: ["#c7becb", "#837487"], skin: ["#edb38d", "#c47e5d", "#884d3b"], hair: "#543326", shirt: "#665365", head: "small", hairStyle: "part", detail: "freckles" },
];

function initialsColorFor(hex: string): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? colors.ink.inverse : colors.ink.primary;
}

function FaceAvatar({
  size,
  preset,
  id,
}: {
  size: number;
  preset: FacePreset;
  id: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={preset.bg[0]} />
          <Stop offset="1" stopColor={preset.bg[1]} />
        </LinearGradient>
        <ClipPath id={`${id}-clip`}>
          <Circle cx="60" cy="60" r="60" />
        </ClipPath>
      </Defs>
      <Circle cx="60" cy="60" r="60" fill={`url(#${id}-bg)`} />
      <G clipPath={`url(#${id}-clip)`}>
        <Circle cx="98" cy="18" r="30" fill="#ffffff" opacity={0.1} />
        <Path d="M 14 126 C 18 94, 39 84, 60 84 C 81 84, 102 94, 106 126 Z" fill={preset.shirt} />
        <Path d="M 47 78 L 47 91 Q 60 100 73 91 L 73 78 Z" fill={preset.skinShade} />
        <Circle cx="60" cy="55" r="31" fill={preset.skin} />
        <Circle cx="30" cy="58" r="6" fill={preset.skinShade} />
        <Circle cx="90" cy="58" r="6" fill={preset.skinShade} />
        <Hair style={preset.hairStyle} color={preset.hair} />
        <Path d="M 43 52 Q 49 49 54 52" fill="none" stroke={preset.hair} strokeWidth="2.2" strokeLinecap="round" />
        <Path d="M 66 52 Q 71 49 77 52" fill="none" stroke={preset.hair} strokeWidth="2.2" strokeLinecap="round" />
        <Circle cx="49" cy="58" r="2.2" fill="#252122" />
        <Circle cx="71" cy="58" r="2.2" fill="#252122" />
        <Path d="M 60 59 Q 57 67 61 68" fill="none" stroke={preset.skinShade} strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M 50 74 Q 60 81 70 74" fill="none" stroke="#7e4540" strokeWidth="2.2" strokeLinecap="round" />
        <FaceAccessory accessory={preset.accessory} hair={preset.hair} skinShade={preset.skinShade} />
        <Path d="M 35 119 Q 60 101 85 119" fill="none" stroke="#ffffff" strokeOpacity={0.14} strokeWidth="2" />
      </G>
    </Svg>
  );
}

function MonoAvatar({ size, preset }: { size: number; preset: MonoPreset }) {
  const dimensions = {
    round: { cx: 60, cy: 55, rx: 27, ry: 29 },
    long: { cx: 60, cy: 55, rx: 23, ry: 33 },
    wide: { cx: 60, cy: 56, rx: 32, ry: 25 },
    small: { cx: 60, cy: 59, rx: 21, ry: 25 },
  }[preset.face];
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="60" fill={preset.bg} />
      <Path d="M 8 126 Q 18 91 60 89 Q 102 91 112 126 Z" fill={preset.ink} />
      <Path d="M 35 126 Q 43 99 60 97 Q 77 99 85 126 Z" fill={preset.mid} opacity={0.85} />
      <Ellipse {...dimensions} fill={preset.light} />
      <MonoHair kind={preset.hair} ink={preset.ink} />
      <MonoEyes kind={preset.eyes} ink={preset.ink} />
      <Path d="M 59 58 L 57 68 L 62 68" fill="none" stroke={preset.mid} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 51 75 Q 60 79 69 75" fill="none" stroke={preset.ink} strokeWidth="2" strokeLinecap="round" />
      <MonoDetail detail={preset.detail} ink={preset.ink} mid={preset.mid} />
    </Svg>
  );
}

function MonoEyes({ kind, ink }: { kind: MonoPreset["eyes"]; ink: string }) {
  if (kind === "dots") {
    return (
      <>
        <Circle cx="48" cy="56" r="2.7" fill={ink} />
        <Circle cx="72" cy="56" r="2.7" fill={ink} />
      </>
    );
  }
  if (kind === "wide") {
    return (
      <>
        <Ellipse cx="48" cy="56" rx="4" ry="5" fill="#ffffff" stroke={ink} strokeWidth="1.8" />
        <Ellipse cx="72" cy="56" rx="4" ry="5" fill="#ffffff" stroke={ink} strokeWidth="1.8" />
        <Circle cx="48" cy="57" r="1.6" fill={ink} />
        <Circle cx="72" cy="57" r="1.6" fill={ink} />
      </>
    );
  }
  if (kind === "wink") {
    return (
      <>
        <Path d="M 43 56 Q 48 51 53 56" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
        <Path d="M 67 56 Q 72 59 77 56" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      </>
    );
  }
  if (kind === "sharp") {
    return (
      <>
        <Path d="M 43 53 L 53 56" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <Path d="M 67 56 L 77 53" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
      </>
    );
  }
  if (kind === "sleepy") {
    return (
      <>
        <Path d="M 43 56 Q 48 59 53 56" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
        <Path d="M 67 56 Q 72 59 77 56" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <Path d="M 43 56 Q 48 53 53 56" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <Path d="M 67 56 Q 72 53 77 56" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

function MonoHair({ kind, ink }: { kind: MonoPreset["hair"]; ink: string }) {
  if (kind === "afro") {
    return <Path d="M 27 54 Q 18 32 31 21 Q 43 8 60 14 Q 78 8 91 23 Q 102 37 91 56 Q 78 37 60 37 Q 42 37 27 54 Z" fill={ink} />;
  }
  if (kind === "bob") {
    return <Path d="M 29 72 Q 20 28 60 19 Q 101 28 91 76 L 82 69 Q 88 39 60 35 Q 32 39 38 69 Z" fill={ink} />;
  }
  if (kind === "mohawk") {
    return <Path d="M 49 34 Q 50 4 61 7 Q 75 11 72 36 Q 62 30 49 34 Z" fill={ink} />;
  }
  if (kind === "bald") {
    return <Path d="M 38 38 Q 60 20 82 38" fill="none" stroke={ink} strokeOpacity={0.35} strokeWidth="3" />;
  }
  if (kind === "cap") {
    return <Path d="M 28 46 Q 33 19 61 20 Q 89 20 94 46 L 72 41 Q 50 37 28 46 Z" fill={ink} />;
  }
  return <Path d="M 31 51 Q 28 22 61 19 Q 88 21 91 47 Q 75 32 56 34 Q 45 47 31 51 Z" fill={ink} />;
}

function MonoDetail({ detail, ink, mid }: { detail?: MonoPreset["detail"]; ink: string; mid: string }) {
  if (detail === "glasses") {
    return (
      <>
        <Rect x="39" y="49" width="19" height="14" rx="4" fill="none" stroke={ink} strokeWidth="2" />
        <Rect x="62" y="49" width="19" height="14" rx="4" fill="none" stroke={ink} strokeWidth="2" />
        <Path d="M 58 55 L 62 55" stroke={ink} strokeWidth="2" />
      </>
    );
  }
  if (detail === "beard") {
    return <Path d="M 39 67 Q 43 90 60 93 Q 77 90 81 67 Q 73 81 60 83 Q 47 81 39 67 Z" fill={ink} opacity={0.75} />;
  }
  if (detail === "earring") {
    return <Circle cx="88" cy="67" r="3" fill="none" stroke={mid} strokeWidth="2" />;
  }
  return null;
}

function DepthAvatar({ size, preset, id }: { size: number; preset: DepthPreset; id: string }) {
  const head = {
    huge: { cy: 56, rx: 38, ry: 39, eyeGap: 15 },
    large: { cy: 56, rx: 33, ry: 35, eyeGap: 13 },
    medium: { cy: 56, rx: 29, ry: 32, eyeGap: 12 },
    small: { cy: 59, rx: 24, ry: 27, eyeGap: 10 },
  }[preset.head];
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={preset.bg[0]} />
          <Stop offset="1" stopColor={preset.bg[1]} />
        </LinearGradient>
        <RadialGradient id={`${id}-skin`} cx="38%" cy="28%" rx="68%" ry="72%">
          <Stop offset="0" stopColor={preset.skin[0]} />
          <Stop offset="0.62" stopColor={preset.skin[1]} />
          <Stop offset="1" stopColor={preset.skin[2]} />
        </RadialGradient>
        <ClipPath id={`${id}-clip`}>
          <Circle cx="60" cy="60" r="60" />
        </ClipPath>
      </Defs>
      <Circle cx="60" cy="60" r="60" fill={`url(#${id}-bg)`} />
      <G clipPath={`url(#${id}-clip)`}>
        <Circle cx="91" cy="18" r="31" fill="#ffffff" opacity={0.18} />
        <Ellipse cx="62" cy="101" rx="45" ry="18" fill="#000000" opacity={0.18} />
        <Path d="M 8 126 Q 18 91 60 89 Q 102 91 112 126 Z" fill={preset.shirt} />
        <Ellipse cx="62" cy={head.cy + 4} rx={head.rx + 3} ry={head.ry + 4} fill="#000000" opacity={0.16} />
        <Ellipse cx="60" cy={head.cy} rx={head.rx} ry={head.ry} fill={`url(#${id}-skin)`} />
        <Ellipse cx={60 - head.rx + 2} cy={head.cy + 5} rx="5" ry="7" fill={preset.skin[1]} />
        <Ellipse cx={60 + head.rx - 2} cy={head.cy + 5} rx="5" ry="7" fill={preset.skin[2]} />
        <DepthHair style={preset.hairStyle} color={preset.hair} head={preset.head} />
        <Path d={`M ${60 - head.eyeGap - 6} ${head.cy - 3} Q ${60 - head.eyeGap} ${head.cy - 6} ${60 - head.eyeGap + 5} ${head.cy - 3}`} fill="none" stroke={preset.hair} strokeWidth="2.2" strokeLinecap="round" />
        <Path d={`M ${60 + head.eyeGap - 5} ${head.cy - 3} Q ${60 + head.eyeGap} ${head.cy - 6} ${60 + head.eyeGap + 6} ${head.cy - 3}`} fill="none" stroke={preset.hair} strokeWidth="2.2" strokeLinecap="round" />
        <Circle cx={60 - head.eyeGap} cy={head.cy + 3} r="3" fill="#242021" />
        <Circle cx={60 + head.eyeGap} cy={head.cy + 3} r="3" fill="#242021" />
        <Circle cx={59 - head.eyeGap} cy={head.cy + 2} r="1" fill="#ffffff" opacity={0.9} />
        <Circle cx={59 + head.eyeGap} cy={head.cy + 2} r="1" fill="#ffffff" opacity={0.9} />
        <Path d={`M 60 ${head.cy + 5} Q 56 ${head.cy + 15} 62 ${head.cy + 16}`} fill="none" stroke={preset.skin[2]} strokeWidth="2" strokeLinecap="round" />
        <Path d={`M 49 ${head.cy + 23} Q 60 ${head.cy + 31} 71 ${head.cy + 23}`} fill="#ffffff" stroke="#9b5a54" strokeWidth="1.6" strokeLinejoin="round" />
        <FaceAccessory accessory={preset.detail} hair={preset.hair} skinShade={preset.skin[2]} />
        <Ellipse cx="47" cy={head.cy - 14} rx="9" ry="5" fill="#ffffff" opacity={0.18} />
      </G>
    </Svg>
  );
}

function DepthHair({
  style,
  color,
  head,
}: {
  style: FacePreset["hairStyle"];
  color: string;
  head: DepthPreset["head"];
}) {
  const scale = { huge: 1.18, large: 1.08, medium: 1, small: 0.82 }[head];
  const translateY = { huge: -4, large: -2, medium: 0, small: 9 }[head];
  return (
    <G origin="60,40" scale={scale} translateY={translateY}>
      <Hair style={style} color={color} />
    </G>
  );
}

function Hair({ style, color }: { style: FacePreset["hairStyle"]; color: string }) {
  if (style === "bun") {
    return (
      <>
        <Circle cx="60" cy="20" r="15" fill={color} />
        <Path d="M 29 52 Q 27 20 60 19 Q 93 20 91 52 Q 81 34 60 34 Q 39 34 29 52 Z" fill={color} />
      </>
    );
  }
  if (style === "curl") {
    return (
      <>
        <Path d="M 28 55 Q 23 21 60 19 Q 97 21 92 55 Q 83 38 60 36 Q 37 38 28 55 Z" fill={color} />
        {[33, 43, 53, 63, 73, 83].map((cx) => <Circle key={cx} cx={cx} cy={cx % 20 === 3 ? 28 : 34} r="9" fill={color} />)}
      </>
    );
  }
  if (style === "part") {
    return <Path d="M 28 54 Q 26 21 60 20 Q 89 21 93 53 Q 73 36 56 32 Q 42 45 28 54 Z" fill={color} />;
  }
  if (style === "wave") {
    return <Path d="M 27 57 Q 24 20 58 18 Q 96 20 92 60 Q 83 38 68 35 Q 50 42 30 37 Z" fill={color} />;
  }
  if (style === "short") {
    return <Path d="M 30 48 Q 31 20 60 20 Q 89 20 90 48 Q 77 33 60 34 Q 43 33 30 48 Z" fill={color} />;
  }
  return <Path d="M 29 51 Q 29 20 60 20 Q 91 20 91 51 Q 78 35 60 35 Q 42 35 29 51 Z" fill={color} />;
}

function FaceAccessory({
  accessory,
  hair,
  skinShade,
}: {
  accessory?: FacePreset["accessory"];
  hair: string;
  skinShade: string;
}) {
  if (accessory === "glasses") {
    return (
      <>
        <Rect x="39" y="53" width="19" height="13" rx="5" fill="none" stroke={hair} strokeWidth="2" />
        <Rect x="62" y="53" width="19" height="13" rx="5" fill="none" stroke={hair} strokeWidth="2" />
        <Path d="M 58 58 L 62 58" stroke={hair} strokeWidth="2" />
      </>
    );
  }
  if (accessory === "beard") {
    return <Path d="M 39 67 Q 42 91 60 94 Q 78 91 81 67 Q 72 83 60 84 Q 48 83 39 67 Z" fill={hair} opacity={0.8} />;
  }
  if (accessory === "freckles") {
    return (
      <>
        <Circle cx="43" cy="66" r="1" fill={skinShade} />
        <Circle cx="47" cy="68" r="1" fill={skinShade} />
        <Circle cx="73" cy="68" r="1" fill={skinShade} />
        <Circle cx="77" cy="66" r="1" fill={skinShade} />
      </>
    );
  }
  return null;
}

export function Avatar({
  size = 96,
  initials,
  variant,
  presetId,
  initialsColor,
}: AvatarProps) {
  if (variant === "preset" && presetId) {
    const localId = ((presetId - 1) % 9) + 1;
    return (
      <View
        style={[
          styles.frame,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        {presetId <= 9 ? (
          <FaceAvatar size={size} preset={FACE_PRESETS[localId]!} id={`av-${presetId}`} />
        ) : presetId <= 18 ? (
          <MonoAvatar size={size} preset={MONO_PRESETS[localId - 1]!} />
        ) : (
          <DepthAvatar size={size} preset={DEPTH_PRESETS[localId - 1]!} id={`av-${presetId}`} />
        )}
      </View>
    );
  }
  const c = initialsColor ?? colors.accent.ivory;
  const fontSize = Math.round(size * 0.38);
  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <SvgText
          x="60"
          y="60"
          fontSize={Math.round(size * 0.45)}
          fontWeight="700"
          fill={initialsColorFor(c)}
          textAnchor="middle"
          alignmentBaseline="central"
          fontFamily="Inter"
        >
          {initials?.slice(0, 2) || "?"}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
});
