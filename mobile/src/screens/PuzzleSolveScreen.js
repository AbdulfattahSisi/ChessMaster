import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ChessBoard from "../components/ChessBoard";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { puzzlesAPI } from "../services/api";
import { applyMoveToFEN } from "../engine/chessLogic";

export default function PuzzleSolveScreen({ route, navigation }) {
  const { puzzle } = route.params;
  const [currentFen, setCurrentFen] = useState(puzzle.fen);
  const [moveIndex, setMoveIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [startTime] = useState(Date.now());
  const [userMoves, setUserMoves] = useState([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      if (!solved && !failed) setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [solved, failed]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleMove = (moveData) => {
    const uci = moveData.from_square + moveData.to_square + (moveData.promotion || "");
    const expectedMove = puzzle.solution_moves?.[moveIndex];
    if (!expectedMove) return;

    if (uci === expectedMove || uci.startsWith(expectedMove)) {
      const newMoves = [...userMoves, uci];
      setUserMoves(newMoves);
      if (moveIndex + 1 >= (puzzle.solution_moves?.length || 0)) {
        setSolved(true);
        submitAttempt(newMoves, true);
      } else {
        const newFen = applyMoveToFEN(currentFen, uci);
        setCurrentFen(newFen);
        setMoveIndex(moveIndex + 1);
      }
    } else {
      setFailed(true);
      const newMoves = [...userMoves, uci];
      submitAttempt(newMoves, false);
    }
  };

  const submitAttempt = async (moves, success) => {
    try {
      await puzzlesAPI.attempt(puzzle.id, {
        moves_made: moves,
        time_taken: (Date.now() - startTime) / 1000,
      });
    } catch (err) { console.log("Error submitting attempt:", err); }
  };

  const resetPuzzle = () => {
    setCurrentFen(puzzle.fen);
    setMoveIndex(0);
    setSolved(false);
    setFailed(false);
    setUserMoves([]);
  };

  const loadNextPuzzle = async () => {
    try {
      const res = await puzzlesAPI.random(puzzle.difficulty);
      navigation.replace("PuzzleSolve", { puzzle: res.data });
    } catch (err) { navigation.goBack(); }
  };

  const getDifficultyIcon = (d) => {
    if (d <= 1) return "sprout";
    if (d === 2) return "leaf";
    if (d === 3) return "flash";
    if (d === 4) return "flame";
    return "diamond-stone";
  };

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{puzzle.title}</Text>
        </View>
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={14} color={COLORS.accent} style={{ marginRight: 4 }} />
          <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
        </View>
      </View>

      {/* Info Pills */}
      <View style={styles.infoBar}>
        <View style={styles.infoPill}>
          <MaterialCommunityIcons name="tag-outline" size={13} color={COLORS.gray} style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>{puzzle.category}</Text>
        </View>
        <View style={styles.infoPill}>
          <MaterialCommunityIcons name={getDifficultyIcon(puzzle.difficulty)} size={13} color={COLORS.gray} style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>Lv.{puzzle.difficulty}</Text>
        </View>
        <View style={[styles.infoPill, { backgroundColor: "rgba(255,215,0,0.12)" }]}>
          <Ionicons name="trending-up" size={13} color={COLORS.gold} style={{ marginRight: 4 }} />
          <Text style={[styles.infoText, { color: COLORS.gold }]}>ELO {puzzle.elo_rating}</Text>
        </View>
      </View>

      {puzzle.description && (
        <Text style={styles.description}>{puzzle.description}</Text>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Ionicons name="layers-outline" size={13} color={COLORS.gray} style={{ marginRight: 4 }} />
          <Text style={styles.progressLabel}>
            Move {moveIndex + 1} of {puzzle.solution_moves?.length || "?"}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={COLORS.gradientAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, {
              width: `${((moveIndex) / (puzzle.solution_moves?.length || 1)) * 100}%`,
            }]}
          />
        </View>
      </View>

      {/* Board */}
      <View style={styles.boardWrapper}>
        <ChessBoard
          fen={currentFen}
          legalMoves={[]}
          onMove={handleMove}
          playerColor="w"
          disabled={solved || failed}
        />
      </View>

      {/* Status Banner */}
      {solved && (
        <GlassCard style={styles.banner} gradient={["#1B5E20", "#2E7D32"]}>
          <Ionicons name="checkmark-circle" size={32} color={COLORS.success} style={{ marginRight: 12 }} />
          <View>
            <Text style={styles.bannerTitle}>Puzzle Solved!</Text>
            <Text style={styles.bannerSub}>Completed in {formatTime(elapsed)}</Text>
          </View>
        </GlassCard>
      )}
      {failed && (
        <GlassCard style={styles.banner} gradient={["#B71C1C", "#C62828"]}>
          <Ionicons name="bulb-outline" size={32} color={COLORS.warning} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Not Quite</Text>
            <Text style={styles.bannerSub} numberOfLines={1}>
              Answer: {puzzle.solution_moves?.[moveIndex]}
            </Text>
          </View>
        </GlassCard>
      )}
      {!solved && !failed && (
        <View style={styles.hintContainer}>
          <Ionicons name="locate-outline" size={18} color={COLORS.accent} style={{ marginRight: 8 }} />
          <Text style={styles.hintText}>Find the best move!</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={resetPuzzle} activeOpacity={0.7}>
          <Ionicons name="refresh" size={22} color={COLORS.accent} />
          <Text style={styles.actionText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert("Hint", puzzle.hints?.[0] || "No hints available")}
          activeOpacity={0.7}
        >
          <Ionicons name="bulb-outline" size={22} color={COLORS.warning} />
          <Text style={styles.actionText}>Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={loadNextPuzzle} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={22} color={COLORS.success} />
          <Text style={styles.actionText}>Next</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 52, paddingHorizontal: SPACING.md, paddingBottom: SPACING.xs,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  title: { ...FONTS.h3, color: COLORS.white },
  timerPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.round,
    marginLeft: 8,
  },
  timerText: { color: COLORS.accent, fontSize: 13, fontVariant: ["tabular-nums"] },
  infoBar: { flexDirection: "row", paddingHorizontal: SPACING.md, marginBottom: SPACING.xs, gap: 6 },
  infoPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.round, paddingHorizontal: 10, paddingVertical: 4,
  },
  infoText: { ...FONTS.small, color: COLORS.gray },
  description: { ...FONTS.caption, color: COLORS.gray, paddingHorizontal: SPACING.md, marginBottom: 4 },
  progressContainer: { paddingHorizontal: SPACING.md, marginBottom: SPACING.xs },
  progressLabel: { ...FONTS.small, color: COLORS.gray },
  progressTrack: {
    height: 4, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2, overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  boardWrapper: { alignItems: "center" },
  banner: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: SPACING.md, marginTop: SPACING.sm, padding: SPACING.md,
  },
  bannerTitle: { ...FONTS.bodyBold, color: COLORS.white },
  bannerSub: { ...FONTS.caption, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  hintContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: SPACING.sm },
  hintText: { ...FONTS.body, color: COLORS.gray },
  actions: {
    flexDirection: "row", justifyContent: "center",
    paddingBottom: 30, paddingTop: SPACING.sm, gap: 12,
  },
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.md, paddingHorizontal: 20, paddingVertical: 12,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  actionText: { ...FONTS.small, color: COLORS.white, marginTop: 4 },
});
