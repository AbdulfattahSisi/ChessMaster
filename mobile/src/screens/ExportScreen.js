import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, FlatList,
  ActivityIndicator, Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { exportAPI, gamesAPI } from "../services/api";

export default function ExportScreen() {
  const [games, setGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadGames(); }, []);

  const loadGames = async () => {
    try {
      const res = await gamesAPI.list({ limit: 50 });
      setGames(res.data);
    } catch (err) { console.log("Error:", err); }
    finally { setLoading(false); }
  };

  const toggleGame = (gameId) => {
    setSelectedGames((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  const selectAll = () => {
    setSelectedGames(
      selectedGames.length === games.length ? [] : games.map((g) => g.id)
    );
  };

  const handleExport = async (format) => {
    if (selectedGames.length === 0) {
      Alert.alert("No Games Selected", "Please select at least one game to export.");
      return;
    }
    setExporting(true);
    try {
      const params = { game_ids: selectedGames };
      let result;
      switch (format) {
        case "pgn":
          result = await exportAPI.pgn(params);
          await Share.share({ message: result.data.pgn_content || JSON.stringify(result.data), title: "ChessMaster - PGN" });
          break;
        case "csv":
          result = await exportAPI.csv(params);
          await Share.share({ message: result.data.csv_content || JSON.stringify(result.data), title: "ChessMaster - CSV" });
          break;
        case "pdf":
          result = await exportAPI.pdf(params);
          Alert.alert("PDF Export", "PDF generated successfully!");
          break;
      }
    } catch (err) {
      Alert.alert("Export Error", err.response?.data?.detail || "Failed to export");
    } finally { setExporting(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getResultInfo = (result) => {
    switch (result) {
      case "white_win": return { icon: "checkbox-blank-circle", label: "White", color: COLORS.success };
      case "black_win": return { icon: "checkbox-blank-circle", label: "Black", color: COLORS.danger };
      case "draw":      return { icon: "minus-circle-outline", label: "Draw",  color: COLORS.gray };
      default:          return { icon: "timer-sand", label: "Live",  color: COLORS.info };
    }
  };

  const exportFormats = [
    { key: "pgn", label: "PGN", iconName: "chess-pawn", desc: "Standard notation", gradient: COLORS.gradientPurple },
    { key: "csv", label: "CSV", iconName: "file-delimited-outline", desc: "Spreadsheet", gradient: COLORS.gradientBlue },
    { key: "pdf", label: "PDF", iconName: "file-pdf-box", desc: "Report", gradient: COLORS.gradientAccent },
  ];

  const renderGame = ({ item }) => {
    const selected = selectedGames.includes(item.id);
    const result = getResultInfo(item.result);
    return (
      <TouchableOpacity
        style={[styles.gameCard, selected && styles.gameCardSelected]}
        onPress={() => toggleGame(item.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={selected ? ["rgba(255,107,107,0.08)", "rgba(255,107,107,0.02)"] : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name={item.mode === "ai" ? "robot" : "account-group"}
              size={16}
              color={COLORS.gray}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.gameMode}>
              {item.mode === "ai" ? `vs AI (${item.ai_difficulty || "?"})` : "Local PvP"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <Ionicons name="layers-outline" size={12} color={COLORS.darkGray} style={{ marginRight: 4 }} />
            <Text style={styles.gameMoves}>{item.moves_count || 0} moves</Text>
            <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.darkGray, marginHorizontal: 6 }} />
            <Ionicons name="calendar-outline" size={12} color={COLORS.darkGray} style={{ marginRight: 4 }} />
            <Text style={styles.gameMoves}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        <View style={[styles.resultTag, { backgroundColor: result.color + "18" }]}>
          <MaterialCommunityIcons name={result.icon} size={14} color={result.color} />
          <Text style={[styles.resultText, { color: result.color }]}>{result.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="share-outline" size={26} color={COLORS.accent} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.title}>Export Games</Text>
            <Text style={styles.subtitle}>Share your chess history</Text>
          </View>
        </View>
      </View>

      {/* Export Format Buttons */}
      <View style={styles.formatRow}>
        {exportFormats.map((fmt) => (
          <TouchableOpacity
            key={fmt.key}
            style={styles.formatCard}
            onPress={() => handleExport(fmt.key)}
            disabled={exporting}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[fmt.gradient[0] + "22", fmt.gradient[1] + "08"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <MaterialCommunityIcons name={fmt.iconName} size={30} color={COLORS.white} style={{ marginBottom: 4 }} />
            <Text style={styles.formatLabel}>{fmt.label}</Text>
            <Text style={styles.formatDesc}>{fmt.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {exporting && (
        <View style={styles.exportingBar}>
          <ActivityIndicator size="small" color={COLORS.accent} />
          <Text style={styles.exportingText}>Exporting...</Text>
        </View>
      )}

      {/* Selection Bar */}
      <View style={styles.selectionBar}>
        <TouchableOpacity onPress={selectAll} activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name={selectedGames.length === games.length ? "checkbox" : "square-outline"} size={18} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.selectAllText}>
            {selectedGames.length === games.length ? "Deselect All" : "Select All"}
          </Text>
        </TouchableOpacity>
        <View style={styles.countPill}>
          <Ionicons name="albums-outline" size={13} color={COLORS.gray} style={{ marginRight: 4 }} />
          <Text style={styles.countText}>{selectedGames.length}/{games.length}</Text>
        </View>
      </View>

      {/* Game List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={games}
          renderItem={renderGame}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Ionicons name="game-controller-outline" size={48} color={COLORS.darkGray} />
              <Text style={styles.emptyText}>No games to export yet</Text>
              <Text style={[styles.emptyText, { fontSize: 13 }]}>Play some games first!</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  title: { ...FONTS.h1, color: COLORS.white },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 2 },
  formatRow: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  formatCard: {
    flex: 1, borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: "center", overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  formatLabel: { ...FONTS.bodyBold, color: COLORS.white, fontSize: 15 },
  formatDesc: { ...FONTS.small, color: COLORS.gray, textAlign: "center" },
  exportingBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,107,107,0.08)",
    borderRadius: RADIUS.sm, padding: 10, marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: "rgba(255,107,107,0.15)",
  },
  exportingText: { ...FONTS.caption, color: COLORS.accent, marginLeft: 8 },
  selectionBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  selectAllText: { ...FONTS.caption, color: COLORS.accent, fontWeight: "700" },
  countPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.round,
  },
  countText: { ...FONTS.small, color: COLORS.gray },
  gameCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: RADIUS.md, padding: 14, marginBottom: 6,
    overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  gameCardSelected: { borderColor: "rgba(255,107,107,0.35)" },
  checkbox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 2,
    borderColor: COLORS.darkGray, marginRight: 12,
    justifyContent: "center", alignItems: "center",
  },
  checkboxSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  gameMode: { ...FONTS.bodyBold, color: COLORS.white, fontSize: 14 },
  gameMoves: { ...FONTS.small, color: COLORS.gray },
  resultTag: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, gap: 4,
  },
  resultText: { ...FONTS.small, fontWeight: "700" },
  emptyText: { ...FONTS.body, color: COLORS.gray, marginTop: 4, textAlign: "center" },
});
