// Use your machine's LAN IP so the phone can reach the backend
// Change this to "http://localhost:8000" if using an emulator
const API_URL = "http://10.25.20.90:8000";

// ──────────────── Premium Color Palette ────────────────
export const COLORS = {
  // Core
  primary: "#0B0D17",
  secondary: "#131629",
  tertiary: "#1B1F3B",
  surface: "#1E2243",
  surfaceLight: "#262B50",

  // Accents
  accent: "#FF6B6B",
  accentLight: "#FF8E8E",
  accentDark: "#E05050",
  gold: "#FFD700",
  goldLight: "#FFE44D",
  goldDark: "#C9A800",
  
  // Semantic
  success: "#00E676",
  successDark: "#00C853",
  danger: "#FF5252",
  dangerDark: "#D32F2F",
  warning: "#FFB300",
  info: "#448AFF",
  infoLight: "#82B1FF",

  // Chess board premium
  boardLight: "#EECFAD",
  boardDark: "#B07650",
  boardLightAlt: "#F0E4D4",
  boardDarkAlt: "#8B6F5E",
  boardLightNeon: "#2A3A5C",
  boardDarkNeon: "#1A2640",

  // Neutrals
  white: "#FFFFFF",
  lightGray: "#E8EAF0",
  gray: "#8B92A8",
  darkGray: "#4A5068",
  charcoal: "#2D3250",
  
  // Highlights
  moveHighlight: "rgba(255, 215, 0, 0.45)",
  checkHighlight: "rgba(255, 82, 82, 0.5)",
  selectedSquare: "rgba(100, 200, 255, 0.4)",
  legalMoveGlow: "rgba(0, 230, 118, 0.35)",

  // Gradients (use with LinearGradient)
  gradientPrimary: ["#0B0D17", "#131629"],
  gradientCard: ["#1B1F3B", "#131629"],
  gradientAccent: ["#FF6B6B", "#E05050"],
  gradientGold: ["#FFD700", "#FFB300"],
  gradientSuccess: ["#00E676", "#00C853"],
  gradientBlue: ["#448AFF", "#2962FF"],
  gradientPurple: ["#7C4DFF", "#651FFF"],
  gradientNight: ["#0B0D17", "#1B1F3B", "#131629"],
};

// ──────────────── Typography ────────────────
export const FONTS = {
  h1: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  h2: { fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 16, fontWeight: "400" },
  bodyBold: { fontSize: 16, fontWeight: "600" },
  caption: { fontSize: 13, fontWeight: "500" },
  small: { fontSize: 11, fontWeight: "500" },
  mono: { fontSize: 14, fontFamily: "monospace", fontWeight: "500" },
};

// ──────────────── Spacing & Radius ────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  round: 999,
};

// ──────────────── Shadows ────────────────
export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ──────────────── Pieces ────────────────
export const PIECES = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

// ──────────────── Difficulty System ────────────────
export const DIFFICULTY_LABELS = {
  beginner:  { name: "Beginner",      emoji: "🌱", elo: "~800",  color: "#4CAF50", gradient: ["#4CAF50", "#388E3C"] },
  easy:      { name: "Intermediate",  emoji: "🌿", elo: "~1200", color: "#8BC34A", gradient: ["#8BC34A", "#689F38"] },
  medium:    { name: "Advanced",      emoji: "⚡", elo: "~1600", color: "#FF9800", gradient: ["#FF9800", "#F57C00"] },
  hard:      { name: "Expert",        emoji: "🔥", elo: "~2000", color: "#F44336", gradient: ["#F44336", "#D32F2F"] },
  expert:    { name: "Grandmaster",   emoji: "💎", elo: "~2400", color: "#9C27B0", gradient: ["#9C27B0", "#7B1FA2"] },
};

// ──────────────── Move Classifications ────────────────
export const MOVE_CLASSIFICATION = {
  brilliant:   { icon: "💡", color: "#00BCD4", label: "Brilliant" },
  great:       { icon: "✨", color: "#4CAF50", label: "Great" },
  good:        { icon: "✓",  color: "#8BC34A", label: "Good" },
  inaccuracy:  { icon: "?!", color: "#FFB300", label: "Inaccuracy" },
  mistake:     { icon: "?",  color: "#FF9800", label: "Mistake" },
  blunder:     { icon: "??", color: "#F44336", label: "Blunder" },
};

// ──────────────── Board Themes ────────────────
export const BOARD_THEMES = {
  classic:  { light: "#EECFAD", dark: "#B07650", name: "Classic Wood" },
  marble:   { light: "#F0E4D4", dark: "#8B6F5E", name: "Marble" },
  neon:     { light: "#2A3A5C", dark: "#1A2640", name: "Midnight Neon" },
  emerald:  { light: "#FFFFDD", dark: "#86A666", name: "Emerald" },
  coral:    { light: "#F5DEB3", dark: "#CD853F", name: "Coral" },
  ice:      { light: "#E3F2FD", dark: "#90CAF9", name: "Ice Blue" },
};

export { API_URL };
