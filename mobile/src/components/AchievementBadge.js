import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, RADIUS, SHADOWS } from "../constants/theme";

/**
 * AchievementBadge — Displays an achievement with unlock state and progress.
 */
export default function AchievementBadge({ achievement, size = "normal" }) {
  const { icon, title, description, xp, unlocked, progress } = achievement;
  const isSmall = size === "small";

  return (
    <View style={[styles.container, isSmall && styles.containerSmall, !unlocked && styles.locked]}>
      <LinearGradient
        colors={unlocked ? ["#FFD700", "#FFB300"] : [COLORS.tertiary, COLORS.secondary]}
        style={[styles.iconCircle, isSmall && styles.iconCircleSmall]}
      >
        <Text style={[styles.icon, isSmall && styles.iconSmall]}>
          {unlocked ? icon : "🔒"}
        </Text>
      </LinearGradient>
      
      {!isSmall && (
        <View style={styles.info}>
          <Text style={[styles.title, !unlocked && styles.lockedText]}>{title}</Text>
          <Text style={[styles.desc, !unlocked && styles.lockedText]}>{description}</Text>
          
          {/* Progress bar */}
          {!unlocked && progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {progress.current}/{progress.target}
              </Text>
            </View>
          )}

          {unlocked && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{xp} XP</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
    ...SHADOWS.small,
  },
  containerSmall: {
    padding: 6,
    marginBottom: 4,
    borderRadius: RADIUS.sm,
  },
  locked: {
    borderColor: "rgba(255,255,255,0.05)",
    opacity: 0.65,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 0,
  },
  icon: { fontSize: 22 },
  iconSmall: { fontSize: 14 },
  info: { flex: 1 },
  title: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  desc: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 2,
  },
  lockedText: {
    color: COLORS.darkGray,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  progressText: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  xpBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  xpText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
  },
});
