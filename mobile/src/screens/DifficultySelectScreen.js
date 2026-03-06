import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, DIFFICULTY_LABELS } from "../constants/theme";

const DIFF_ICONS = {
  beginner: { lib: MaterialCommunityIcons, name: "sprout", size: 28 },
  easy: { lib: MaterialCommunityIcons, name: "leaf", size: 28 },
  medium: { lib: Ionicons, name: "flash", size: 28 },
  hard: { lib: Ionicons, name: "flame", size: 28 },
  expert: { lib: MaterialCommunityIcons, name: "diamond-stone", size: 28 },
};

export default function DifficultySelectScreen({ navigation }) {
  const difficulties = Object.entries(DIFFICULTY_LABELS);

  const handleSelect = (key) => {
    navigation.navigate("Game", { mode: "vs_ai", difficulty: key });
  };

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="sword-cross" size={40} color={COLORS.accent} />
        <Text style={styles.title}>Choose Opponent</Text>
        <Text style={styles.subtitle}>Select your AI opponent's strength</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {difficulties.map(([key, info], index) => {
          const iconConfig = DIFF_ICONS[key] || DIFF_ICONS.medium;
          const IconComponent = iconConfig.lib;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleSelect(key)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[info.gradient[0] + "18", info.gradient[1] + "08"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.card}
              >
                <View style={[styles.iconCircle, { backgroundColor: info.color + "20" }]}>
                  <IconComponent name={iconConfig.name} size={iconConfig.size} color={info.color} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{info.name}</Text>
                  <View style={styles.eloBadge}>
                    <Text style={[styles.eloText, { color: info.color }]}>ELO {info.elo}</Text>
                  </View>
                </View>
                <LinearGradient
                  colors={info.gradient}
                  style={styles.playBadge}
                >
                  <Ionicons name="play" size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.playText}>PLAY</Text>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={18} color={COLORS.gray} />
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  title: { ...FONTS.h1, color: COLORS.white, marginTop: SPACING.sm },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 4 },
  list: { flex: 1, paddingHorizontal: SPACING.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: "center", alignItems: "center",
    marginRight: SPACING.md,
  },
  cardText: { flex: 1 },
  cardTitle: { ...FONTS.h3, color: COLORS.white },
  eloBadge: { marginTop: 2 },
  eloText: { ...FONTS.small, fontWeight: "700", letterSpacing: 0.5 },
  playBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS.round,
  },
  playText: { ...FONTS.small, color: COLORS.white, fontWeight: "800", letterSpacing: 1 },
  backBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  backText: { ...FONTS.body, color: COLORS.gray },
});