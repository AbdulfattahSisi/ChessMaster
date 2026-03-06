import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../constants/theme";
import GlassCard from "../components/GlassCard";
import AchievementBadge from "../components/AchievementBadge";
import XPLevelBar from "../components/XPLevelBar";
import { achievementsAPI } from "../services/api";

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achRes, sumRes] = await Promise.all([
        achievementsAPI.list(),
        achievementsAPI.summary(),
      ]);
      setAchievements(achRes.data);
      setSummary(sumRes.data);
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.loading}>
        <MaterialCommunityIcons name="medal" size={52} color={COLORS.gold} />
        <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 16 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.type}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 50 }}>
              <MaterialCommunityIcons name="medal" size={30} color={COLORS.gold} />
              <Text style={styles.title}> Achievements</Text>
            </View>

            {/* Level & XP */}
            {summary && (
              <View style={styles.section}>
                <XPLevelBar
                  level={summary.level}
                  currentXP={summary.next_level_xp?.current_xp_in_level || 0}
                  requiredXP={summary.next_level_xp?.required || 100}
                  totalXP={summary.total_xp}
                />
              </View>
            )}

            {/* Progress Summary */}
            <GlassCard style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="lock-open" size={18} color={COLORS.success} style={{ marginBottom: 4 }} />
                  <Text style={styles.summaryValue}>{unlockedCount}</Text>
                  <Text style={styles.summaryLabel}>Unlocked</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="grid" size={18} color={COLORS.info} style={{ marginBottom: 4 }} />
                  <Text style={styles.summaryValue}>{totalCount}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="star" size={18} color={COLORS.gold} style={{ marginBottom: 4 }} />
                  <Text style={[styles.summaryValue, { color: COLORS.gold }]}>
                    {summary?.total_xp || 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Total XP</Text>
                </View>
              </View>
              {/* Completion bar */}
              <View style={styles.completionTrack}>
                <LinearGradient
                  colors={COLORS.gradientGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.completionFill, {
                    width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%`
                  }]}
                />
              </View>
              <Text style={styles.completionText}>
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}% Complete
              </Text>
            </GlassCard>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: SPACING.sm, marginBottom: SPACING.sm }}>
              <MaterialCommunityIcons name="view-grid" size={18} color={COLORS.accent} />
              <Text style={styles.sectionTitle}> All Achievements</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => <AchievementBadge achievement={item} />}
        contentContainerStyle={{ padding: SPACING.lg }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { ...FONTS.h1, color: COLORS.white, marginBottom: SPACING.md },
  section: { marginBottom: SPACING.md },
  summaryCard: { marginBottom: SPACING.md },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  summaryItem: { alignItems: "center" },
  summaryValue: { ...FONTS.h2, color: COLORS.white },
  summaryLabel: { ...FONTS.small, color: COLORS.gray },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.charcoal,
  },
  completionTrack: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  completionFill: {
    height: "100%",
    borderRadius: 3,
  },
  completionText: {
    ...FONTS.small,
    color: COLORS.gray,
    textAlign: "center",
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});