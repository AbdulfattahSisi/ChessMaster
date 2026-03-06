import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SPACING, MOVE_CLASSIFICATION } from "../constants/theme";
import GlassCard from "../components/GlassCard";
import { gamesAPI, reviewAPI } from "../services/api";

export default function GameReviewScreen({ route }) {
  const { gameId } = route?.params || {};
  const [review, setReview] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(gameId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedGameId) {
      loadReview(selectedGameId);
    } else {
      loadGames();
    }
  }, [selectedGameId]);

  const loadGames = async () => {
    try {
      const res = await gamesAPI.list({ page: 1, page_size: 20, status: "completed" });
      setGames(res.data.games || []);
    } catch (e) {}
    setLoading(false);
  };

  const loadReview = async (gid) => {
    setLoading(true);
    try {
      const res = await reviewAPI.getReview(gid);
      setReview(res.data);
    } catch (e) {
      console.log("Review error:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.center}>
        <MaterialCommunityIcons name="magnify-scan" size={48} color={COLORS.info} />
        <Text style={styles.loadingText}>Analyzing game...</Text>
        <ActivityIndicator size="large" color={COLORS.info} style={{ marginTop: 16 }} />
      </LinearGradient>
    );
  }

  // If no game selected, show game picker
  if (!selectedGameId && !review) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
        <View style={styles.pickerHeader}>
          <Ionicons name="analytics" size={26} color={COLORS.accent} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.title}>Game Review</Text>
            <Text style={styles.subtitle}>Select a completed game to analyze</Text>
          </View>
        </View>
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedGameId(item.id)}>
              <GlassCard style={styles.gameCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons
                    name={item.mode === "vs_ai" ? "robot" : "account-group"}
                    size={18}
                    color={COLORS.gray}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.gameCardTitle}>
                    {item.mode === "vs_ai" ? `vs AI (${item.ai_difficulty})` : "PvP"} - {item.result || "?"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Ionicons name="layers-outline" size={13} color={COLORS.darkGray} style={{ marginRight: 4 }} />
                  <Text style={styles.gameCardMeta}>{item.moves_count} moves</Text>
                  <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.darkGray, marginHorizontal: 6 }} />
                  <Ionicons name="calendar-outline" size={13} color={COLORS.darkGray} style={{ marginRight: 4 }} />
                  <Text style={styles.gameCardMeta}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: SPACING.lg }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="game-controller-outline" size={48} color={COLORS.darkGray} />
              <Text style={styles.emptyText}>No completed games yet. Play some games first!</Text>
            </View>
          }
        />
      </LinearGradient>
    );
  }

  const summary = review?.summary;

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 50, marginBottom: SPACING.md }}>
          <Ionicons name="analytics" size={26} color={COLORS.accent} style={{ marginRight: 10 }} />
          <Text style={styles.title}>Game Review</Text>
        </View>

        {/* Accuracy Score */}
        {summary && (
          <GlassCard style={styles.accuracyCard}>
            <Ionicons name="speedometer-outline" size={22} color={COLORS.gray} style={{ marginBottom: 4 }} />
            <Text style={styles.accuracyLabel}>ACCURACY</Text>
            <Text style={[
              styles.accuracyValue,
              { color: summary.accuracy >= 80 ? COLORS.success :
                       summary.accuracy >= 60 ? COLORS.warning : COLORS.danger }
            ]}>
              {summary.accuracy}%
            </Text>
            <View style={styles.accuracyBar}>
              <LinearGradient
                colors={summary.accuracy >= 80 ? COLORS.gradientSuccess :
                        summary.accuracy >= 60 ? ["#FF9800", "#F57C00"] : COLORS.gradientAccent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.accuracyFill, { width: `${summary.accuracy}%` }]}
              />
            </View>
          </GlassCard>
        )}

        {/* Classification Breakdown */}
        {summary && (
          <GlassCard style={styles.breakdownCard}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
              <MaterialCommunityIcons name="chart-box-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Move Classification</Text>
            </View>
            <View style={styles.classGrid}>
              {Object.entries(MOVE_CLASSIFICATION).map(([key, meta]) => (
                <View key={key} style={styles.classItem}>
                  <Text style={styles.classIcon}>{meta.icon}</Text>
                  <Text style={[styles.classCount, { color: meta.color }]}>
                    {summary[key + "s"] || 0}
                  </Text>
                  <Text style={styles.classLabel}>{meta.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Move-by-move annotations */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm, marginTop: SPACING.sm }}>
          <MaterialCommunityIcons name="format-list-numbered" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Move-by-Move Analysis</Text>
        </View>
        {review?.annotations?.map((ann, i) => {
          const meta = MOVE_CLASSIFICATION[ann.classification] || {};
          return (
            <View key={i} style={styles.moveRow}>
              <View style={[styles.moveColorDot, {
                backgroundColor: ann.color === "white" ? "#fff" : "#333"
              }]} />
              <Text style={styles.moveNum}>{ann.move_number}.</Text>
              <Text style={styles.moveSan}>{ann.san}</Text>
              <Text style={[styles.moveClass, { color: meta.color || COLORS.gray }]}>
                {meta.icon} {ann.symbol}
              </Text>
              <Text style={styles.moveEval}>
                {ann.eval_after > 0 ? "+" : ""}{ann.eval_after}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { ...FONTS.body, color: COLORS.gray, marginTop: 12 },
  pickerHeader: { flexDirection: "row", alignItems: "center", paddingTop: 55, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  title: { ...FONTS.h1, color: COLORS.white },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 2 },
  accuracyCard: { alignItems: "center", marginBottom: SPACING.md },
  accuracyLabel: { ...FONTS.caption, color: COLORS.gray, textTransform: "uppercase", letterSpacing: 1 },
  accuracyValue: { fontSize: 56, fontWeight: "900", marginVertical: 4 },
  accuracyBar: {
    width: "100%", height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4, overflow: "hidden",
  },
  accuracyFill: { height: "100%", borderRadius: 4 },
  breakdownCard: { marginBottom: SPACING.md },
  cardTitle: { ...FONTS.h3, color: COLORS.white },
  classGrid: { flexDirection: "row", justifyContent: "space-between" },
  classItem: { alignItems: "center", flex: 1 },
  classIcon: { fontSize: 18, marginBottom: 2 },
  classCount: { ...FONTS.h3, fontWeight: "800" },
  classLabel: { ...FONTS.small, color: COLORS.gray },
  sectionTitle: { ...FONTS.h3, color: COLORS.white },
  moveRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm, marginBottom: 4,
  },
  moveColorDot: {
    width: 10, height: 10, borderRadius: 5,
    marginRight: 8, borderWidth: 1, borderColor: COLORS.charcoal,
  },
  moveNum: { color: COLORS.darkGray, width: 30, fontVariant: ["tabular-nums"] },
  moveSan: { color: COLORS.white, flex: 1, fontVariant: ["tabular-nums"] },
  moveClass: { ...FONTS.caption, width: 40, textAlign: "center" },
  moveEval: { color: COLORS.gray, width: 50, textAlign: "right", fontVariant: ["tabular-nums"] },
  gameCard: { marginBottom: SPACING.sm },
  gameCardTitle: { ...FONTS.bodyBold, color: COLORS.white },
  gameCardMeta: { ...FONTS.small, color: COLORS.gray },
  emptyText: { ...FONTS.body, color: COLORS.gray, textAlign: "center", marginTop: 12 },
});
