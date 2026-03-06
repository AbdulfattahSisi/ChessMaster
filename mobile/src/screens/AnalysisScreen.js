import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ChessBoard from "../components/ChessBoard";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { analysisAPI } from "../services/api";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function AnalysisScreen({ navigation }) {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState(3);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await analysisAPI.evaluate({ fen, depth });
      setAnalysis(res.data);
    } catch (err) { console.log("Error:", err); }
    finally { setLoading(false); }
  };

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await analysisAPI.suggest({ fen, depth });
      setAnalysis(res.data);
    } catch (err) { console.log("Error:", err); }
    finally { setLoading(false); }
  };

  const evalColor = analysis
    ? analysis.evaluation > 0 ? COLORS.success : analysis.evaluation < 0 ? COLORS.danger : COLORS.gray
    : COLORS.gray;

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="search" size={26} color={COLORS.accent} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.title}>Analysis</Text>
              <Text style={styles.subtitle}>Deep position evaluation</Text>
            </View>
          </View>
        </View>

        {/* Board */}
        <View style={styles.boardWrapper}>
          <ChessBoard fen={fen} disabled={true} />
        </View>

        {/* FEN Input */}
        <GlassCard style={styles.fenCard}>
          <View style={styles.fenLabelRow}>
            <MaterialCommunityIcons name="code-brackets" size={16} color={COLORS.gray} style={{ marginRight: 6 }} />
            <Text style={styles.label}>FEN Notation</Text>
          </View>
          <TextInput
            style={styles.fenInput}
            value={fen}
            onChangeText={setFen}
            multiline
            placeholder="Paste FEN here..."
            placeholderTextColor={COLORS.darkGray}
          />
        </GlassCard>

        {/* Depth Control */}
        <View style={styles.depthRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="layers-outline" size={16} color={COLORS.gray} style={{ marginRight: 6 }} />
            <Text style={styles.label}>Search Depth</Text>
          </View>
          <View style={styles.depthButtons}>
            {[2, 3, 4, 5].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.depthBtn, depth === d && styles.depthBtnActive]}
                onPress={() => setDepth(d)}
                activeOpacity={0.7}
              >
                {depth === d ? (
                  <LinearGradient colors={COLORS.gradientAccent} style={StyleSheet.absoluteFill} />
                ) : null}
                <Text style={[styles.depthBtnText, depth === d && styles.depthBtnTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <GradientButton
            title={loading ? "Analyzing..." : "Analyze"}
            icon={<Ionicons name="flash" size={18} color={COLORS.white} />}
            onPress={handleAnalyze}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            style={styles.suggestBtn}
            onPress={handleSuggest}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons name="bulb-outline" size={18} color={COLORS.accent} style={{ marginRight: 6 }} />
            <Text style={styles.suggestBtnText}>Suggest</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text style={styles.loadingText}>Engine thinking at depth {depth}...</Text>
          </View>
        )}

        {/* Results */}
        {analysis && (
          <GlassCard style={styles.resultsCard}>
            <View style={styles.resultsTitleRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="analytics" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.resultsTitle}>Analysis Results</Text>
              </View>
              {analysis.depth && (
                <View style={styles.depthTag}>
                  <Ionicons name="layers" size={12} color={COLORS.info} style={{ marginRight: 4 }} />
                  <Text style={styles.depthTagText}>Depth {analysis.depth}</Text>
                </View>
              )}
            </View>

            {/* Evaluation */}
            <View style={styles.evalRow}>
              <Text style={[styles.evalBig, { color: evalColor }]}>
                {analysis.evaluation > 0 ? "+" : ""}{analysis.evaluation}
              </Text>
              <Text style={styles.evalLabel}>
                {analysis.evaluation > 1.5 ? "White is winning" :
                  analysis.evaluation > 0.5 ? "White is better" :
                    analysis.evaluation < -1.5 ? "Black is winning" :
                      analysis.evaluation < -0.5 ? "Black is better" : "Equal position"}
              </Text>
            </View>

            {analysis.best_move && (
              <View style={styles.resultRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons name="star-four-points" size={16} color={COLORS.gold} style={{ marginRight: 6 }} />
                  <Text style={styles.resultLabel}>Best Move</Text>
                </View>
                <View style={styles.moveBadge}>
                  <Text style={styles.moveBadgeText}>{analysis.best_move}</Text>
                </View>
              </View>
            )}

            {analysis.best_line && analysis.best_line.length > 0 && (
              <View style={styles.lineBox}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <MaterialCommunityIcons name="arrow-right-bold-box-outline" size={16} color={COLORS.gray} style={{ marginRight: 6 }} />
                  <Text style={styles.resultLabel}>Principal Variation</Text>
                </View>
                <Text style={styles.lineText}>
                  {analysis.best_line.map((m, i) => (i < analysis.best_line.length - 1 ? m + " \u2192 " : m)).join("")}
                </Text>
              </View>
            )}

            {analysis.is_checkmate && (
              <LinearGradient colors={COLORS.gradientAccent} style={styles.mateBanner}>
                <MaterialCommunityIcons name="chess-king" size={22} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.mateText}>Mate in {analysis.mate_in}</Text>
              </LinearGradient>
            )}

            {analysis.explanation && (
              <View style={styles.explanationBox}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.gray} style={{ marginRight: 8 }} />
                <Text style={styles.explanationText}>{analysis.explanation}</Text>
              </View>
            )}
          </GlassCard>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  title: { ...FONTS.h1, color: COLORS.white },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 2 },
  boardWrapper: { alignItems: "center", marginBottom: SPACING.sm },
  fenCard: { marginHorizontal: SPACING.md },
  fenLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { ...FONTS.caption, color: COLORS.gray },
  fenInput: {
    backgroundColor: "rgba(0,0,0,0.3)", color: COLORS.white,
    borderRadius: RADIUS.sm, padding: 12, fontSize: 12,
    fontVariant: ["tabular-nums"],
    minHeight: 44, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  depthRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.lg, marginTop: SPACING.md,
  },
  depthButtons: { flexDirection: "row", gap: 8 },
  depthBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
    overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  depthBtnActive: { borderColor: COLORS.accent },
  depthBtnText: { ...FONTS.bodyBold, color: COLORS.gray },
  depthBtnTextActive: { color: COLORS.white },
  actions: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: SPACING.lg, marginTop: SPACING.md,
  },
  suggestBtn: {
    flex: 1, borderRadius: RADIUS.md, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: COLORS.accent,
    backgroundColor: "rgba(255,107,107,0.08)",
  },
  suggestBtnText: { ...FONTS.bodyBold, color: COLORS.accent, fontSize: 15 },
  loadingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: SPACING.md, gap: 8,
  },
  loadingText: { ...FONTS.caption, color: COLORS.gray },
  resultsCard: { marginHorizontal: SPACING.md, marginTop: SPACING.md },
  resultsTitleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: SPACING.sm,
  },
  resultsTitle: { ...FONTS.h3, color: COLORS.white },
  depthTag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(108,99,255,0.15)",
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.round,
  },
  depthTagText: { ...FONTS.small, color: COLORS.info },
  evalRow: { alignItems: "center", paddingVertical: SPACING.sm },
  evalBig: { fontSize: 42, fontWeight: "800" },
  evalLabel: { ...FONTS.caption, color: COLORS.gray, marginTop: 4 },
  resultRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  resultLabel: { ...FONTS.body, color: COLORS.gray },
  moveBadge: {
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.sm,
  },
  moveBadgeText: { color: COLORS.gold, fontWeight: "700", fontVariant: ["tabular-nums"] },
  lineBox: {
    paddingVertical: 10, borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  lineText: { color: COLORS.white, marginTop: 2, fontSize: 13, fontVariant: ["tabular-nums"] },
  mateBanner: {
    borderRadius: RADIUS.sm, padding: 12, marginTop: SPACING.sm,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  mateText: { ...FONTS.bodyBold, color: COLORS.white, fontSize: 18 },
  explanationBox: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.3)", borderRadius: RADIUS.sm,
    padding: 12, marginTop: SPACING.sm,
  },
  explanationText: { ...FONTS.body, color: COLORS.white, fontSize: 13, lineHeight: 20, flex: 1 },
});
