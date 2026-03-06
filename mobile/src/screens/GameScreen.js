import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  ScrollView, Dimensions, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import ChessBoard from "../components/ChessBoard";
import EvalBar from "../components/EvalBar";
import GlassCard from "../components/GlassCard";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../constants/theme";
import { gamesAPI, analysisAPI } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";

const { width } = Dimensions.get("window");

export default function GameScreen({ route, navigation }) {
  const { mode = "vs_ai", difficulty = "medium" } = route.params || {};
  const confettiRef = useRef(null);
  const { settings } = useSettings();

  const [game, setGame] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moveLoading, setMoveLoading] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [evaluation, setEvaluation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameOverInfo, setGameOverInfo] = useState(null);
  const [moveTimer, setMoveTimer] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing AI thinking indicator
  useEffect(() => {
    if (moveLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [moveLoading]);

  // Move timer
  useEffect(() => {
    if (game && game.status === "active") {
      const interval = setInterval(() => setMoveTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [game?.status]);

  useEffect(() => {
    createGame();
  }, []);

  const createGame = async () => {
    setGameOverInfo(null);
    setShowConfetti(false);
    setMoveHistory([]);
    setEvaluation(0);
    setMoveTimer(0);
    setLoading(true);
    try {
      const res = await gamesAPI.create({
        mode,
        ai_difficulty: mode === "vs_ai" ? difficulty : undefined,
        time_control: 600,
        color_preference: "white",
      });
      setGame(res.data);
      await fetchLegalMoves(res.data.id);
    } catch (err) {
      Alert.alert("Error", "Failed to create game");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchLegalMoves = async (gameId) => {
    try {
      const res = await gamesAPI.getLegalMoves(gameId);
      setLegalMoves(res.data.legal_moves || []);
    } catch (err) {}
  };

  const handleMove = async (moveData) => {
    if (!game || moveLoading) return;
    setMoveLoading(true);
    setMoveTimer(0);

    try {
      const res = await gamesAPI.makeMove(game.id, moveData);
      const result = res.data;

      if (settings.hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      const newHistory = [...moveHistory];
      newHistory.push(result.player_move);
      if (result.ai_move) {
        newHistory.push(result.ai_move);
        setLastMove(result.ai_move);
      } else {
        setLastMove(result.player_move);
      }
      setMoveHistory(newHistory);

      if (result.evaluation !== null && result.evaluation !== undefined) {
        setEvaluation(result.evaluation);
      }

      const gameRes = await gamesAPI.get(game.id);
      setGame(gameRes.data);

      if (result.game_result) {
        handleGameOver(result.game_result);
      } else {
        setLegalMoves(result.legal_moves || []);
        fetchEvaluation(gameRes.data.current_fen);
      }
    } catch (err) {
      Alert.alert("Invalid Move", err.response?.data?.detail || "Try another move");
    } finally {
      setMoveLoading(false);
    }
  };

  const fetchEvaluation = async (fen) => {
    try {
      const res = await analysisAPI.evaluate({ fen, depth: 2 });
      setEvaluation(res.data.evaluation || 0);
    } catch (e) {}
  };

  const handleGameOver = (result) => {
    const isWin = result === "white_win";
    if (isWin) setShowConfetti(true);

    const messages = {
      white_win:    { title: "Victory!", icon: "trophy", iconColor: COLORS.gold, subtitle: "White wins!", color: COLORS.success },
      black_win:    { title: "Defeat", icon: "skull-outline", iconColor: COLORS.danger, subtitle: "Black wins", color: COLORS.danger },
      draw:         { title: "Draw", icon: "handshake-outline", iconColor: COLORS.warning, subtitle: "Game ended in draw", color: COLORS.warning },
      stalemate:    { title: "Stalemate", icon: "hand-left-outline", iconColor: COLORS.warning, subtitle: "No legal moves", color: COLORS.warning },
      resignation:  { title: "Resigned", icon: "flag-outline", iconColor: COLORS.gray, subtitle: "Game resigned", color: COLORS.gray },
      timeout:      { title: "Time's Up!", icon: "timer-outline", iconColor: COLORS.danger, subtitle: "Clock ran out", color: COLORS.danger },
    };

    setGameOverInfo(messages[result] || { title: "Game Over", icon: "help-circle-outline", iconColor: COLORS.gray, subtitle: result, color: COLORS.gray });
    setLegalMoves([]);
  };

  const handleResign = () => {
    Alert.alert("Resign?", "Are you sure you want to resign?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Resign",
        style: "destructive",
        onPress: async () => {
          try {
            await gamesAPI.resign(game.id);
            handleGameOver("resignation");
          } catch (err) {
            Alert.alert("Error", "Failed to resign");
          }
        },
      },
    ]);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const difficultyElo = { beginner: 800, easy: 1200, medium: 1600, hard: 2000, expert: 2400 };

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons name="chess-king" size={64} color={COLORS.gold} />
          <Text style={styles.loadingText}>Setting up the board...</Text>
          <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 16 }} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={120}
          origin={{ x: width / 2, y: -10 }}
          fadeOut
          autoStart
          colors={["#FFD700", "#FF6B6B", "#448AFF", "#00E676", "#FF9800"]}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.gray} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <MaterialCommunityIcons
              name={mode === "vs_ai" ? "robot" : "account-group"}
              size={18}
              color={COLORS.accent}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.headerTitle}>
              {mode === "vs_ai" ? `vs AI (${difficulty})` : "Local PvP"}
            </Text>
          </View>
          <View style={styles.headerMeta}>
            <Ionicons name="layers-outline" size={12} color={COLORS.gray} style={{ marginRight: 3 }} />
            <Text style={styles.headerMoves}>Move {game?.moves_count || 0}</Text>
            <Ionicons name="time-outline" size={12} color={COLORS.gold} style={{ marginLeft: 8, marginRight: 3 }} />
            <Text style={styles.headerTimer}>{formatTime(moveTimer)}</Text>
          </View>
        </View>
        {moveLoading && (
          <Animated.View style={{ opacity: pulseAnim }}>
            <MaterialCommunityIcons name="brain" size={22} color={COLORS.accent} />
          </Animated.View>
        )}
      </View>

      {/* Opponent Bar */}
      <GlassCard style={styles.playerBar}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons
            name={mode === "vs_ai" ? "robot" : "account"}
            size={22}
            color={COLORS.white}
          />
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{mode === "vs_ai" ? "AI Engine" : "Black"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="trending-up" size={12} color={COLORS.gray} style={{ marginRight: 4 }} />
            <Text style={styles.playerElo}>
              {mode === "vs_ai" ? `ELO ~${difficultyElo[difficulty] || 1200}` : "Player 2"}
            </Text>
          </View>
        </View>
        {game?.black_time_remaining && (
          <View style={styles.clockBox}>
            <Ionicons name="time" size={14} color={COLORS.white} style={{ marginRight: 4 }} />
            <Text style={styles.clock}>{formatTime(Math.round(game.black_time_remaining))}</Text>
          </View>
        )}
      </GlassCard>

      {/* Board + Eval Bar */}
      <View style={styles.boardRow}>
        <EvalBar evaluation={evaluation} />
        <ChessBoard
          fen={game?.current_fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}
          legalMoves={legalMoves}
          onMove={handleMove}
          playerColor="w"
          disabled={moveLoading || game?.status === "completed"}
          lastMove={lastMove}
        />
      </View>

      {/* Player Bar */}
      <GlassCard style={styles.playerBar}>
        <View style={[styles.avatarCircle, { backgroundColor: "rgba(108,99,255,0.25)" }]}>
          <Ionicons name="person" size={20} color={COLORS.accent} />
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>You (White)</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="chess-pawn" size={13} color={COLORS.gray} style={{ marginRight: 4 }} />
            <Text style={styles.playerElo}>Playing</Text>
          </View>
        </View>
        {game?.white_time_remaining && (
          <View style={[styles.clockBox, { backgroundColor: "rgba(108,99,255,0.2)" }]}>
            <Ionicons name="time" size={14} color={COLORS.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.clock, { color: COLORS.accent }]}>{formatTime(Math.round(game.white_time_remaining))}</Text>
          </View>
        )}
      </GlassCard>

      {/* Game Over Banner */}
      {gameOverInfo && (
        <GlassCard
          style={[styles.gameOverBanner, { borderColor: gameOverInfo.color + "40" }]}
          gradient={[COLORS.surface, COLORS.secondary]}
        >
          <Ionicons name={gameOverInfo.icon} size={36} color={gameOverInfo.iconColor} />
          <Text style={[styles.gameOverTitle, { color: gameOverInfo.color }]}>
            {gameOverInfo.title}
          </Text>
          <Text style={styles.gameOverSubtitle}>{gameOverInfo.subtitle}</Text>
          <View style={styles.gameOverBtns}>
            <TouchableOpacity style={styles.gameOverBtn} onPress={createGame}>
              <Ionicons name="refresh" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.gameOverBtnText}>New Game</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gameOverBtn}
              onPress={() => navigation.navigate("GameReview", { gameId: game?.id })}
            >
              <Ionicons name="analytics-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.gameOverBtnText}>Review</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {/* Move History */}
      <ScrollView style={styles.movesContainer} horizontal showsHorizontalScrollIndicator={false}>
        {moveHistory.map((move, i) => (
          <View key={i} style={[styles.moveTag, move.is_check && styles.moveTagCheck]}>
            <Text style={styles.moveText}>
              {move.player_color === "white" ? `${move.move_number}.` : ""} {move.san}
            </Text>
            {move.is_check && (
              <MaterialCommunityIcons name="alert-circle" size={10} color={COLORS.danger} style={{ marginLeft: 3 }} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Actions */}
      {!gameOverInfo && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleResign}>
            <Ionicons name="flag-outline" size={22} color={COLORS.danger} />
            <Text style={[styles.actionText, { color: COLORS.danger }]}>Resign</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={createGame}>
            <Ionicons name="refresh" size={22} color={COLORS.success} />
            <Text style={[styles.actionText, { color: COLORS.success }]}>New Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => {
            if (game?.current_fen) {
              navigation.navigate("Analyze", { fen: game.current_fen });
            }
          }}>
            <Ionicons name="search" size={22} color={COLORS.accent} />
            <Text style={[styles.actionText, { color: COLORS.accent }]}>Analyze</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingContent: { alignItems: "center" },
  loadingText: { ...FONTS.body, color: COLORS.gray, marginTop: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { ...FONTS.bodyBold, color: COLORS.white },
  headerMeta: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  headerMoves: { ...FONTS.small, color: COLORS.gray },
  headerTimer: { ...FONTS.small, color: COLORS.gold },
  playerBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.md,
    marginVertical: 4,
    padding: 10,
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
    marginRight: 10,
  },
  playerInfo: { flex: 1 },
  playerName: { ...FONTS.bodyBold, color: COLORS.white },
  playerElo: { ...FONTS.small, color: COLORS.gray },
  clockBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  clock: {
    fontSize: 15, fontWeight: "700", color: COLORS.white,
    fontVariant: ["tabular-nums"],
  },
  boardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 6,
  },
  gameOverBanner: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    alignItems: "center",
    padding: SPACING.md,
  },
  gameOverTitle: { ...FONTS.h2, marginTop: 6 },
  gameOverSubtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 4 },
  gameOverBtns: { flexDirection: "row", marginTop: SPACING.sm, gap: 12 },
  gameOverBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.charcoal,
  },
  gameOverBtnText: { ...FONTS.caption, color: COLORS.white },
  movesContainer: {
    maxHeight: 36,
    paddingHorizontal: SPACING.md,
    marginVertical: 4,
  },
  moveTag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    marginRight: 4,
  },
  moveTagCheck: {
    borderWidth: 1, borderColor: COLORS.danger + "60",
  },
  moveText: {
    fontSize: 13, color: COLORS.white,
    fontVariant: ["tabular-nums"],
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 24,
    gap: 16,
  },
  actionBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: RADIUS.md,
    paddingVertical: 10, paddingHorizontal: 22,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  actionText: { ...FONTS.small, marginTop: 3, fontWeight: "600" },
});
