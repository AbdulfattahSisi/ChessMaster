import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from "../constants/theme";
import ChessBoard from "../components/ChessBoard";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { dailyChallengeAPI, puzzlesAPI } from "../services/api";

export default function DailyChallengeScreen({ route, navigation }) {
  const [challenge, setChallenge] = useState(route?.params?.challenge || null);
  const [loading, setLoading] = useState(!challenge);
  const [moveIndex, setMoveIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [currentFen, setCurrentFen] = useState("");
  const [solution, setSolution] = useState([]);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (!challenge) loadChallenge();
    else setupPuzzle();
  }, []);

  const loadChallenge = async () => {
    try {
      const res = await dailyChallengeAPI.today();
      setChallenge(res.data);
      if (res.data.puzzle) {
        setCurrentFen(res.data.puzzle.fen);
      }
    } catch (e) {}
    setLoading(false);
  };

  const setupPuzzle = () => {
    if (challenge?.puzzle) {
      setCurrentFen(challenge.puzzle.fen);
    }
  };

  const handleMove = async (moveData) => {
    if (solved || failed) return;

    const uci = moveData.from_square + moveData.to_square + (moveData.promotion || "");

    try {
      const puzzle = challenge.puzzle;
      const res = await dailyChallengeAPI.attempt(challenge.challenge_id || challenge.id, {
        moves_made: [uci],
        time_taken: 30,
      });

      if (res.data.solved) {
        setSolved(true);
        setXpEarned(challenge.bonus_xp || 50);
        setSolution(res.data.correct_solution);
      } else {
        setFailed(true);
        setSolution(res.data.correct_solution);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to submit attempt");
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.center}>
        <Ionicons name="flame" size={48} color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading Daily Challenge...</Text>
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 16 }} />
      </LinearGradient>
    );
  }

  if (challenge?.already_attempted) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.center}>
        <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
        <Text style={styles.completedTitle}>Challenge Complete!</Text>
        <Text style={styles.completedText}>You've already completed today's challenge.</Text>
        <Text style={styles.completedText}>Come back tomorrow for a new one!</Text>
        <GradientButton
          title="Back to Home"
          icon={<Ionicons name="home-outline" size={18} color={COLORS.white} />}
          onPress={() => navigation.goBack()}
          style={{ marginTop: 24 }}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dailyBadge}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="flame" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.dailyBadgeText}>DAILY CHALLENGE</Text>
          </View>
        </LinearGradient>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.gray} style={{ marginRight: 4 }} />
          <Text style={styles.date}>{challenge?.date}</Text>
        </View>
      </View>

      {/* Puzzle Info */}
      <GlassCard style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <MaterialCommunityIcons name="puzzle" size={20} color={COLORS.accent} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.puzzleTitle}>{challenge?.puzzle?.title || "Today's Puzzle"}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <MaterialCommunityIcons name="tag-outline" size={13} color={COLORS.gray} style={{ marginRight: 4 }} />
                <Text style={styles.puzzleCategory}>{challenge?.puzzle?.category}</Text>
              </View>
            </View>
          </View>
          <View style={styles.xpTag}>
            <Ionicons name="star" size={14} color={COLORS.gold} style={{ marginRight: 4 }} />
            <Text style={styles.xpText}>+{challenge?.bonus_xp || 50} XP</Text>
          </View>
        </View>
      </GlassCard>

      {/* Board */}
      <View style={styles.boardWrapper}>
        <ChessBoard
          fen={currentFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}
          legalMoves={[]}
          onMove={handleMove}
          playerColor="w"
          disabled={solved || failed}
        />
      </View>

      {/* Result */}
      {solved && (
        <GlassCard style={styles.resultCard} gradient={["#1B5E20", "#2E7D32"]}>
          <Ionicons name="trophy" size={36} color={COLORS.gold} />
          <Text style={styles.resultTitle}>Brilliant!</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name="star" size={16} color={COLORS.gold} style={{ marginRight: 4 }} />
            <Text style={styles.resultText}>+{xpEarned} XP earned</Text>
          </View>
        </GlassCard>
      )}
      {failed && (
        <GlassCard style={styles.resultCard} gradient={["#B71C1C", "#C62828"]}>
          <Ionicons name="bulb-outline" size={36} color={COLORS.warning} />
          <Text style={styles.resultTitle}>Not quite</Text>
          <Text style={styles.resultText}>
            Solution: {solution.map((m, i) => (i < solution.length - 1 ? m + " \u2192 " : m)).join("")}
          </Text>
        </GlassCard>
      )}

      {(solved || failed) && (
        <GradientButton
          title="Back to Home"
          icon={<Ionicons name="home-outline" size={18} color={COLORS.white} />}
          onPress={() => navigation.goBack()}
          style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.md }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.lg },
  loadingText: { ...FONTS.body, color: COLORS.gray, marginTop: 12 },
  completedTitle: { ...FONTS.h2, color: COLORS.success, marginTop: 16 },
  completedText: { ...FONTS.body, color: COLORS.gray, marginTop: 4, textAlign: "center" },
  header: {
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: SPACING.sm,
  },
  dailyBadge: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: RADIUS.round,
    ...SHADOWS.medium,
  },
  dailyBadgeText: {
    ...FONTS.bodyBold, color: COLORS.white, letterSpacing: 1,
  },
  date: { ...FONTS.caption, color: COLORS.gray },
  infoCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  puzzleTitle: { ...FONTS.bodyBold, color: COLORS.white },
  puzzleCategory: { ...FONTS.caption, color: COLORS.gray },
  xpTag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.round,
  },
  xpText: { color: COLORS.gold, fontWeight: "800", fontSize: 14 },
  boardWrapper: { alignItems: "center", marginVertical: SPACING.sm },
  resultCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    alignItems: "center",
    padding: SPACING.md,
  },
  resultTitle: { ...FONTS.h2, color: COLORS.white, marginTop: 4 },
  resultText: { ...FONTS.caption, color: "rgba(255,255,255,0.8)", marginTop: 4 },
});
