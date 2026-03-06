import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { statsAPI } from "../services/api";

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await statsAPI.leaderboard(50);
      setPlayers(res.data);
    } catch (err) { console.log("Error:", err); }
    finally { setLoading(false); }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Ionicons name="medal" size={24} color="#FFD700" />;
    if (rank === 2) return <Ionicons name="medal" size={22} color="#C0C0C0" />;
    if (rank === 3) return <Ionicons name="medal" size={22} color="#CD7F32" />;
    return <Text style={styles.rankText}>{rank}</Text>;
  };

  const renderPlayer = ({ item }) => {
    const isTop3 = item.rank <= 3;
    const rowGradient = isTop3
      ? ["rgba(255,215,0,0.10)", "rgba(255,215,0,0.02)"]
      : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"];

    return (
      <View style={[styles.row, isTop3 && styles.topRow]}>
        <LinearGradient
          colors={rowGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={[styles.rankCircle, isTop3 && styles.topRankCircle]}>
          {getMedalIcon(item.rank)}
        </View>
        <View style={styles.playerInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="chess-king" size={14} color={isTop3 ? COLORS.gold : COLORS.gray} style={{ marginRight: 4 }} />
            <Text style={styles.username}>{item.username}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="game-controller-outline" size={10} color={COLORS.gray} style={{ marginRight: 3 }} />
            <Text style={styles.record}>{item.games_played} games</Text>
            <View style={styles.dotSep} />
            <Ionicons name="trending-up" size={10} color={COLORS.accent} style={{ marginRight: 3 }} />
            <Text style={styles.winRate}>{item.win_rate}%</Text>
          </View>
        </View>
        <View style={styles.eloBox}>
          <Text style={[styles.elo, isTop3 && { color: COLORS.gold }]}>{item.elo_rating}</Text>
          <Text style={styles.eloLabel}>ELO</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.loadingContainer}>
        <Ionicons name="trophy" size={52} color={COLORS.gold} />
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 16 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="trophy" size={28} color={COLORS.gold} />
          <Text style={styles.title}> Leaderboard</Text>
        </View>
        <Text style={styles.subtitle}>{players.length} players ranked</Text>
      </View>

      {/* Column Labels */}
      <View style={styles.colLabels}>
        <Text style={[styles.colLabel, { width: 50 }]}>Rank</Text>
        <Text style={[styles.colLabel, { flex: 1 }]}>Player</Text>
        <Text style={styles.colLabel}>Rating</Text>
      </View>

      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.username}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <MaterialCommunityIcons name="chess-king" size={52} color={COLORS.gray} />
            <Text style={styles.emptyText}>No players yet. Be the first!</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  title: { ...FONTS.h1, color: COLORS.white },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 2 },
  colLabels: {
    flexDirection: "row", paddingHorizontal: SPACING.lg + 4,
    marginBottom: SPACING.xs,
  },
  colLabel: { ...FONTS.small, color: COLORS.darkGray, textTransform: "uppercase", letterSpacing: 1 },
  row: {
    flexDirection: "row", alignItems: "center",
    borderRadius: RADIUS.md, padding: 14, marginBottom: 6,
    overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  topRow: { borderColor: "rgba(255,215,0,0.25)" },
  rankCircle: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  topRankCircle: { backgroundColor: "rgba(255,215,0,0.12)" },
  rankText: { ...FONTS.bodyBold, color: COLORS.gray },
  playerInfo: { flex: 1 },
  username: { ...FONTS.bodyBold, color: COLORS.white },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  record: { ...FONTS.small, color: COLORS.gray },
  dotSep: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: COLORS.darkGray, marginHorizontal: 6,
  },
  winRate: { ...FONTS.small, color: COLORS.accent, fontWeight: "700" },
  eloBox: { alignItems: "center", marginLeft: 8 },
  elo: { ...FONTS.h3, color: COLORS.white, fontSize: 20 },
  eloLabel: { ...FONTS.small, color: COLORS.darkGray },
  emptyText: { ...FONTS.body, color: COLORS.gray, marginTop: 8, textAlign: "center" },
});