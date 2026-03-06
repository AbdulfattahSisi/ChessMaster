import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, FONTS } from "../constants/theme";

/**
 * XPLevelBar — Shows player level, XP progress, and rank title.
 */
export default function XPLevelBar({ level = 1, currentXP = 0, requiredXP = 100, totalXP = 0 }) {
  const percent = Math.min(100, Math.round((currentXP / Math.max(requiredXP, 1)) * 100));
  const rankTitle = getRankTitle(level);

  return (
    <View style={styles.container}>
      <View style={styles.levelCircle}>
        <Text style={styles.levelNumber}>{level}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.rankTitle}>{rankTitle}</Text>
          <Text style={styles.xpText}>{currentXP} / {requiredXP} XP</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
          <View style={[styles.progressGlow, { width: `${percent}%` }]} />
        </View>
      </View>
    </View>
  );
}

function getRankTitle(level) {
  if (level >= 20) return "♛ Grandmaster";
  if (level >= 15) return "♛ Master";
  if (level >= 12) return "♜ Expert";
  if (level >= 9) return "♞ Advanced";
  if (level >= 6) return "♟ Intermediate";
  if (level >= 3) return "♟ Beginner";
  return "♟ Novice";
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.12)",
  },
  levelCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  levelNumber: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rankTitle: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  xpText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: "500",
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: 4,
  },
});
