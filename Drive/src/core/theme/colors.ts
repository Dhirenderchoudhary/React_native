export const colors = {
  bg: {
    canvas:  "#050505",   // deep obsidian
    surface: "rgba(20, 20, 25, 0.65)", // frosted glass
    raised:  "rgba(35, 35, 45, 0.8)",  // raised panel
    sunken:  "#020202",   // recessed well
    scrim:   "rgba(0,0,0,0.85)",
  },
  ink: {
    primary:  "#ffffff",  // pure white
    secondary: "#a0a5b5", // cool grey
    tertiary:  "#505565",
    muted:     "#2a2f3a",
    inverse:   "#050505",
  },
  
  accent: {
    ivory: "#00f0ff", // reusing ivory name to not break other files, but it's neonBlue
    ivoryDim: "#b026ff", // neonPurple
    glow:     "rgba(0, 240, 255, 0.15)",
  },
  line: {
    hairline: "rgba(255,255,255,0.03)",
    soft:     "rgba(255,255,255,0.08)",
    strong:   "rgba(255,255,255,0.15)",
    bevel:    "rgba(0, 240, 255, 0.3)",  // neon top-edge highlight
    groove:   "rgba(0,0,0,0.8)",       // bottom-edge shadow
  },
  status: {
    success:    "#00ffaa",
    successDim: "rgba(0, 255, 170, 0.15)",
    warning:    "#ffb800",
    warningDim: "rgba(255, 184, 0, 0.15)",
    danger:     "#ff0055",
    dangerDim:  "rgba(255, 0, 85, 0.15)",
    info:       "#00f0ff",
    infoDim:    "rgba(0, 240, 255, 0.15)",
  },
  chip: {
    bg:       "rgba(255,255,255,0.05)",
    bgActive: "#00f0ff",
    ink:      "#a0a5b5",
    inkActive: "#050505",
    border:   "rgba(0, 240, 255, 0.2)",
  },
  score: {
    excellent: "#00ffaa",
    good:      "#00f0ff",
    fair:      "#ffb800",
    poor:      "#ff0055",
  },
} as const;

export type ColorToken = keyof typeof colors;
