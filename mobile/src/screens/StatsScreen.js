import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import GlassCard from "../components/GlassCard";
import { statsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function StatsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await statsAPI.myStats();
      setStats(res.data);
    } catch (err) { console.log("Error:", err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.loadingContainer}>
        <Ionicons name="stats-chart" size={48} color={COLORS.accent} />
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 16 }} />
      </LinearGradient>
    );
  }

  const elo = stats?.current_elo || user?.elo_rating || 1200;
  const peak = stats?.peak_elo || user?.elo_peak || elo;
  const winRate = stats?.win_rate || 0;

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Ionicons name="stats-chart" size={26} color={COLORS.accent} style={{ marginRight: 10 }} />
          <Text style={styles.title}>My Statistics</Text>
        </View>

        {/* ELO Hero Card */}
        <GlassCard style={styles.eloCard}>
          <LinearGradient
            colors={["rgba(255,215,0,0.12)", "rgba(255,215,0,0.02)"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.eloValue}>{elo}</Text>
          <Text style={styles.eloLabel}>Current ELO Rating</Text>
          <View style={styles.peakRow}>
            <MaterialCommunityIcons name="crown" size={16} color={COLORS.goldDark} style={{ marginRight: 4 }} />
            <Text style={styles.eloPeak}>Peak: {peak}</Text>
          </View>
          {/* ELO Progress */}
          <View style={styles.eloBarTrack}>
            <LinearGradient
              colors={COLORS.gradientGold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.eloBarFill, { width: `${Math.min((elo / 3000) * 100, 100)}%` }]}
            />
          </View>
          <View style={styles.eloTicks}>
            <Text style={styles.tickText}>0</Text>
            <Text style={styles.tickText}>1500</Text>
            <Text style={styles.tickText}>3000</Text>
          </View>
        </GlassCard>

        {/* Win/Loss/Draw Grid */}
        <View style={styles.statsGrid}>
          <StatBox label="Games" value={stats?.total_games || 0} iconName="game-controller-outline" iconLib="ion" color={COLORS.info} gradient={COLORS.gradientBlue} />
          <StatBox label="Wins" value={stats?.wins || 0} iconName="checkmark-circle" iconLib="ion" color={COLORS.success} gradient={COLORS.gradientSuccess} />
          <StatBox label="Losses" value={stats?.losses || 0} iconName="close-circle" iconLib="ion" color={COLORS.danger} gradient={COLORS.gradientAccent} />
          <StatBox label="Draws" value={stats?.draws || 0} iconName="remove-circle-outline" iconLib="ion" color={COLORS.gray} gradient={COLORS.gradientPurple} />
        </View>

        {/* Win Rate Ring */}
        <GlassCard style={styles.winRateCard}>
          <View style={styles.winRateCircle}>
            <LinearGradient
              colors={winRate >= 50 ? COLORS.gradientSuccess : COLORS.gradientAccent}
              style={styles.winRateInner}
            >
              <Text style={styles.winRateValue}>{winRate}%</Text>
            </LinearGradient>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.winRateLabel}>Win Rate</Text>
            <View style={styles.winBarTrack}>
              <View style={[styles.winBarFill, { width: `${winRate}%`, backgroundColor: COLORS.success }]} />
            </View>
            <View style={styles.winBarLabels}>
              <Text style={[styles.winBarText, { color: COLORS.success }]}>{stats?.wins || 0}W</Text>
              <Text style={[styles.winBarText, { color: COLORS.gray }]}>{stats?.draws || 0}D</Text>
              <Text style={[styles.winBarText, { color: COLORS.danger }]}>{stats?.losses || 0}L</Text>
            </View>
          </View>
        </GlassCard>

        {/* Detail Stats */}
        <GlassCard style={styles.detailCard}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
            <MaterialCommunityIcons name="chart-box-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.detailTitle}>Detailed Statistics</Text>
          </View>
          <StatRow label="Avg Game Length" value={`${stats?.avg_game_length || 0} moves`} iconName="resize" iconLib="ion" />
          <StatRow label="Puzzles Solved" value={stats?.puzzles_solved || 0} iconName="puzzle" iconLib="mci" />
          <StatRow label="Current Streak" value={stats?.current_streak || 0} iconName="flame" iconLib="mci" />
          <StatRow label="Best Streak" value={stats?.best_streak || 0} iconName="flash" iconLib="ion" />
          {stats?.favorite_opening && (
            <StatRow label="Favorite Opening" value={stats.favorite_opening} iconName="book-open-variant" iconLib="mci" />
          )}
        </GlassCard>

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const StatBox = ({ label, value, iconName, iconLib, color, gradient }) => (
  <View style={styles.statBox}>
    <LinearGradient
      colors={[gradient[0] + "18", gradient[1] + "08"]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
    {iconLib === "ion" ? (
      <Ionicons name={iconName} size={24} color={color} style={{ marginBottom: 4 }} />
    ) : (
      <MaterialCommunityIcons name={iconName} size={24} color={color} style={{ marginBottom: 4 }} />
    )}
    <Text style={styles.statBoxValue}>{value}</Text>
    <Text style={styles.statBoxLabel}>{label}</Text>
  </View>
);

const StatRow = ({ label, value, iconName, iconLib }) => (
  <View style={styles.statRow}>
    {iconLib === "ion" ? (
      <Ionicons name={iconName} size={18} color={COLORS.gray} style={{ marginRight: 10 }} />
    ) : (
      <MaterialCommunityIcons name={iconName} size={18} color={COLORS.gray} style={{ marginRight: 10 }} />
    )}
    <Text style={styles.statRowLabel}>{label}</Text>
    <Text style={styles.statRowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 55, paddingHorizontal: SPACING.md, paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md, paddingHorizontal: SPACING.xs },
  title: { ...FONTS.h1, color: COLORS.white },

  // ELO Card
  eloCard: { alignItems: "center", padding: SPACING.lg, overflow: "hidden", marginBottom: SPACING.md },
  eloValue: { fontSize: 56, fontWeight: "800", color: COLORS.gold },
  eloLabel: { ...FONTS.caption, color: COLORS.gray, marginTop: 4 },
  peakRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  eloPeak: { ...FONTS.caption, color: COLORS.goldDark },
  eloBarTrack: {
    width: "100%", height: 6, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)", marginTop: SPACING.sm, overflow: "hidden",
  },
  eloBarFill: { height: "100%", borderRadius: 3 },
  eloTicks: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 4 },
  tickText: { ...FONTS.small, color: COLORS.darkGray, fontSize: 10 },

  // Grid
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 8, marginBottom: SPACING.md,
  },
  statBox: {
    width: "48%", flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: "center", overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  statBoxValue: { fontSize: 28, fontWeight: "800", color: COLORS.white },
  statBoxLabel: { ...FONTS.small, color: COLORS.gray, marginTop: 2 },

  // Win Rate
  winRateCard: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md, padding: SPACING.md },
  winRateCircle: { width: 72, height: 72, borderRadius: 36, padding: 3, backgroundColor: "rgba(255,255,255,0.08)" },
  winRateInner: {
    flex: 1, borderRadius: 34,
    justifyContent: "center", alignItems: "center",
  },
  winRateValue: { fontSize: 20, fontWeight: "800", color: COLORS.white },
  winRateLabel: { ...FONTS.bodyBold, color: COLORS.white, marginBottom: 8 },
  winBarTrack: {
    height: 6, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden",
  },
  winBarFill: { height: "100%", borderRadius: 3 },
  winBarLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  winBarText: { ...FONTS.small, fontWeight: "700" },

  // Detail Card
  detailCard: { padding: SPACING.md },
  detailTitle: { ...FONTS.h3, color: COLORS.white },
  statRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  statRowLabel: { ...FONTS.body, color: COLORS.gray, flex: 1 },
  statRowValue: { ...FONTS.bodyBold, color: COLORS.white },
});
