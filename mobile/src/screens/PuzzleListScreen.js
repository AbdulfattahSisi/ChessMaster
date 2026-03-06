import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { puzzlesAPI } from "../services/api";

const CATEGORY_ICONS = {
  tactics: "sword-cross",
  endgame: "chess-king",
  opening: "book-open-variant",
  checkmate: "crown",
  defense: "shield-half-full",
  fork: "source-fork",
  pin: "pin",
  skewer: "arrow-right-bold",
  discovery: "magnify",
  sacrifice: "fire",
};

export default function PuzzleListScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [puzzles, setPuzzles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [catRes, puzzleRes] = await Promise.all([
        puzzlesAPI.categories(),
        puzzlesAPI.list({ limit: 50 }),
      ]);
      setCategories(catRes.data);
      setPuzzles(puzzleRes.data);
    } catch (err) { console.log("Error loading puzzles:", err); }
    finally { setLoading(false); }
  };

  const loadByCategory = async (cat) => {
    setSelectedCategory(cat);
    setLoading(true);
    try {
      const res = await puzzlesAPI.list({ category: cat, limit: 50 });
      setPuzzles(res.data);
    } catch (err) { console.log("Error:", err); }
    finally { setLoading(false); }
  };

  const handleRandomPuzzle = async () => {
    try {
      const res = await puzzlesAPI.random();
      navigation.navigate("PuzzleSolve", { puzzle: res.data });
    } catch (err) { console.log("Error:", err); }
  };

  const getCategoryIcon = (catId) => {
    const key = (catId || "").toLowerCase();
    return CATEGORY_ICONS[key] || "puzzle";
  };

  const renderCategory = ({ item }) => {
    const active = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[styles.catChip, active && styles.catChipActive]}
        onPress={() => loadByCategory(item.id)}
        activeOpacity={0.7}
      >
        {active && (
          <LinearGradient colors={COLORS.gradientAccent} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        )}
        <MaterialCommunityIcons
          name={getCategoryIcon(item.id)}
          size={16}
          color={active ? COLORS.white : COLORS.gray}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.catText, active && styles.catTextActive]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const getDifficultyGradient = (d) => {
    if (d <= 1) return ["#4CAF50", "#388E3C"];
    if (d === 2) return ["#8BC34A", "#689F38"];
    if (d === 3) return ["#FF9800", "#F57C00"];
    if (d === 4) return ["#F44336", "#D32F2F"];
    return ["#9C27B0", "#7B1FA2"];
  };

  const getDifficultyIcon = (d) => {
    if (d <= 1) return "sprout";
    if (d === 2) return "leaf";
    if (d === 3) return "flash";
    if (d === 4) return "flame";
    return "diamond-stone";
  };

  const renderPuzzle = ({ item, index }) => (
    <TouchableOpacity
      style={styles.puzzleCard}
      onPress={() => navigation.navigate("PuzzleSolve", { puzzle: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.puzzleLeft}>
        <LinearGradient
          colors={getDifficultyGradient(item.difficulty)}
          style={styles.puzzleNumBadge}
        >
          <Text style={styles.puzzleNumber}>{index + 1}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.puzzleTitle}>{item.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
            <MaterialCommunityIcons name={getCategoryIcon(item.category)} size={12} color={COLORS.gray} style={{ marginRight: 4 }} />
            <Text style={styles.puzzleCategory}>{item.category}</Text>
            <View style={styles.dotSep} />
            <MaterialCommunityIcons name={getDifficultyIcon(item.difficulty)} size={12} color={COLORS.gray} style={{ marginRight: 2 }} />
            <Text style={styles.puzzleStars}>Lv.{item.difficulty}</Text>
          </View>
        </View>
      </View>
      <View style={styles.puzzleRight}>
        <Ionicons name="trending-up" size={12} color={COLORS.gold} style={{ marginBottom: 2 }} />
        <Text style={styles.puzzleElo}>{item.elo_rating}</Text>
        <Text style={styles.puzzleEloLabel}>ELO</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={COLORS.gradientNight} style={styles.loadingContainer}>
        <MaterialCommunityIcons name="puzzle" size={48} color={COLORS.accent} />
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 16 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="puzzle" size={26} color={COLORS.accent} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.title}>Puzzles</Text>
            <Text style={styles.subtitle}>{puzzles.length} puzzles available</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.randomBtn}
          onPress={handleRandomPuzzle}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradientAccent}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Ionicons name="dice-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.randomBtnText}>Random</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
      />

      {/* Puzzle List */}
      <FlatList
        data={puzzles}
        renderItem={renderPuzzle}
        keyExtractor={(item) => item.id}
        style={styles.puzzleList}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.darkGray} />
            <Text style={styles.emptyText}>No puzzles found</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  title: { ...FONTS.h1, color: COLORS.white },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 2 },
  randomBtn: {
    flexDirection: "row", alignItems: "center",
    borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 10,
    overflow: "hidden", ...SHADOWS.small,
  },
  randomBtnText: { ...FONTS.bodyBold, color: COLORS.white, fontSize: 14 },
  catList: { maxHeight: 48, marginBottom: SPACING.sm },
  catChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.round, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  catChipActive: { borderColor: COLORS.accent },
  catText: { ...FONTS.caption, color: COLORS.gray },
  catTextActive: { color: COLORS.white, fontWeight: "700" },
  puzzleList: { flex: 1 },
  puzzleCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: RADIUS.md, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  puzzleLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  puzzleNumBadge: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  puzzleNumber: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
  puzzleTitle: { ...FONTS.bodyBold, color: COLORS.white, fontSize: 15 },
  puzzleCategory: { ...FONTS.small, color: COLORS.gray },
  dotSep: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: COLORS.darkGray, marginHorizontal: 6,
  },
  puzzleStars: { ...FONTS.small, color: COLORS.gray },
  puzzleRight: { alignItems: "center", marginLeft: 8 },
  puzzleElo: { color: COLORS.gold, fontSize: 18, fontWeight: "800" },
  puzzleEloLabel: { ...FONTS.small, color: COLORS.gray },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { ...FONTS.body, color: COLORS.gray, marginTop: 8 },
});
