import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import GlassCard from "../components/GlassCard";
import { statsAPI } from "../services/api";

const CATEGORY_ICONS = {
  Open: "lock-open-variant-outline",
  "Semi-Open": "lock-open-outline",
  Closed: "lock-outline",
  Indian: "elephant",
  Flank: "arrow-expand-horizontal",
};

export default function OpeningsScreen({ navigation }) {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = ["Open", "Semi-Open", "Closed", "Indian", "Flank"];

  useEffect(() => { loadOpenings(); }, [selectedCategory]);

  const loadOpenings = async () => {
    setLoading(true);
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const res = await statsAPI.openings(params);
      setOpenings(res.data);
    } catch (err) { console.log("Error:", err); }
    finally { setLoading(false); }
  };

  const renderOpening = ({ item }) => (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <LinearGradient colors={COLORS.gradientPurple} style={styles.ecoBadge}>
          <Text style={styles.ecoCode}>{item.eco_code}</Text>
        </LinearGradient>
        <Text style={styles.openingName} numberOfLines={2}>{item.name}</Text>
      </View>
      <View style={styles.pgnRow}>
        <MaterialCommunityIcons name="chess-pawn" size={14} color={COLORS.gold} style={{ marginRight: 6 }} />
        <Text style={styles.pgn}>{item.pgn}</Text>
      </View>
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
      {/* Win rate bar */}
      <View style={styles.barContainer}>
        <View style={[styles.barSegment, { flex: item.win_rate_white || 1, backgroundColor: COLORS.success }]} />
        <View style={[styles.barSegment, { flex: item.draw_rate || 1, backgroundColor: COLORS.darkGray }]} />
        <View style={[styles.barSegment, { flex: item.win_rate_black || 1, backgroundColor: COLORS.danger }]} />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <View style={[styles.statDot, { backgroundColor: COLORS.success }]} />
          <Text style={[styles.statText, { color: COLORS.success }]}>W {item.win_rate_white}%</Text>
        </View>
        <View style={styles.statPill}>
          <View style={[styles.statDot, { backgroundColor: COLORS.darkGray }]} />
          <Text style={[styles.statText, { color: COLORS.gray }]}>D {item.draw_rate}%</Text>
        </View>
        <View style={styles.statPill}>
          <View style={[styles.statDot, { backgroundColor: COLORS.danger }]} />
          <Text style={[styles.statText, { color: COLORS.danger }]}>B {item.win_rate_black}%</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: "rgba(68,138,255,0.12)" }]}>
          <MaterialCommunityIcons name={CATEGORY_ICONS[item.category] || "book-open-variant"} size={12} color={COLORS.info} style={{ marginRight: 4 }} />
          <Text style={[styles.statText, { color: COLORS.info }]}>{item.category}</Text>
        </View>
      </View>
    </GlassCard>
  );

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="book-open-variant" size={26} color={COLORS.accent} style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.title}>Openings Library</Text>
            <Text style={styles.subtitle}>{openings.length} openings</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        data={[null, ...categories]}
        renderItem={({ item }) => {
          const active = selectedCategory === item;
          return (
            <TouchableOpacity
              style={[styles.catChip, active && styles.catChipActive]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              {active && (
                <LinearGradient colors={COLORS.gradientAccent} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              )}
              {item ? (
                <MaterialCommunityIcons
                  name={CATEGORY_ICONS[item] || "book-open-variant"}
                  size={14}
                  color={active ? COLORS.white : COLORS.gray}
                  style={{ marginRight: 6 }}
                />
              ) : (
                <Ionicons name="grid-outline" size={14} color={active ? COLORS.white : COLORS.gray} style={{ marginRight: 6 }} />
              )}
              <Text style={[styles.catText, active && styles.catTextActive]}>
                {item || "All"}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item || "all"}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
      />

      {loading ? (
        <View style={styles.loadingArea}>
          <MaterialCommunityIcons name="book-open-page-variant" size={48} color={COLORS.accent} />
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <FlatList
          data={openings}
          renderItem={renderOpening}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Ionicons name="search-outline" size={48} color={COLORS.darkGray} />
              <Text style={styles.emptyText}>No openings found</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  title: { ...FONTS.h1, color: COLORS.white },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 2 },
  loadingArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  catList: { maxHeight: 46, marginBottom: SPACING.sm },
  catChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.round, paddingHorizontal: 16, paddingVertical: 8,
    marginRight: 8, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  catChipActive: { borderColor: COLORS.accent },
  catText: { ...FONTS.caption, color: COLORS.gray, fontWeight: "600" },
  catTextActive: { color: COLORS.white, fontWeight: "700" },
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ecoBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm, marginRight: 10,
  },
  ecoCode: { ...FONTS.small, color: COLORS.white, fontWeight: "800" },
  openingName: { ...FONTS.bodyBold, color: COLORS.white, flex: 1 },
  pgnRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  pgn: { color: COLORS.gold, fontSize: 13, fontVariant: ["tabular-nums"], flex: 1 },
  description: { ...FONTS.caption, color: COLORS.gray, marginBottom: 8, lineHeight: 18 },
  barContainer: {
    flexDirection: "row", height: 4, borderRadius: 2,
    overflow: "hidden", marginBottom: 8,
  },
  barSegment: { height: "100%" },
  statsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  statPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 3,
  },
  statDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statText: { ...FONTS.small, fontWeight: "600" },
  emptyText: { ...FONTS.body, color: COLORS.gray, marginTop: 8 },
});
