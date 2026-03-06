import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS, RADIUS } from "../constants/theme";

/**
 * GlassCard — A premium glassmorphism-inspired card component.
 */
export default function GlassCard({
  children,
  style,
  gradient = COLORS.gradientCard,
  borderColor = "rgba(255,255,255,0.08)",
  padding = 16,
}) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        { padding, borderColor },
        SHADOWS.medium,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: "hidden",
  },
});
