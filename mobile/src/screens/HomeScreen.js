import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions,
  RefreshControl, Animated, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import GlassCard from "../components/GlassCard";
import XPLevelBar from "../components/XPLevelBar";
import GradientButton from "../components/GradientButton";
import { statsAPI, dailyChallengeAPI } from "../services/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.sm) / 2;

export default function HomeScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadDailyChallenge();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      const res = await dailyChallengeAPI.today();
      setDailyChallenge(res.data);
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser?.();
    await loadDailyChallenge();
    setRefreshing(false);
  };

  const menuItems = [
    {
      IconLib: MaterialCommunityIcons, iconName: "robot",
      title: "Play vs AI", subtitle: "Challenge the engine",
      onPress: () => navigation.navigate("DifficultySelect"),
      gradient: COLORS.gradientAccent, iconColor: "#FF6B6B",
    },
    {
      IconLib: Ionicons, iconName: "people",
      title: "Local PvP", subtitle: "Play with a friend",
      onPress: () => navigation.navigate("Game", { mode: "pvp_local" }),
      gradient: COLORS.gradientPurple, iconColor: "#A78BFA",
    },
    {
      IconLib: MaterialCommunityIcons, iconName: "puzzle",
      title: "Puzzles", subtitle: "Sharpen your tactics",
      onPress: () => navigation.navigate("Puzzles"),
      gradient: COLORS.gradientGold, iconColor: "#FFD700",
    },
    {
      IconLib: MaterialCommunityIcons, iconName: "magnify-scan",
      title: "Analysis", subtitle: "AI position analyzer",
      onPress: () => navigation.navigate("Analyze"),
      gradient: COLORS.gradientSuccess, iconColor: "#00E676",
    },
    {
      IconLib: MaterialCommunityIcons, iconName: "book-open-variant",
      title: "Openings", subtitle: "Master the theory",
      onPress: () => navigation.navigate("Openings"),
      gradient: COLORS.gradientBlue || ["#448AFF", "#2979FF"], iconColor: "#448AFF",
    },
    {
      IconLib: Ionicons, iconName: "trophy",
      title: "Leaderboard", subtitle: "Top players",
      onPress: () => navigation.navigate("Ranking"),
      gradient: ["#FF9800", "#F57C00"], iconColor: "#FF9800",
    },
    {
      IconLib: MaterialCommunityIcons, iconName: "medal",
      title: "Achievements", subtitle: "Track milestones",
      onPress: () => navigation.navigate("Achievements"),
      gradient: ["#FFD700", "#FF8F00"], iconColor: "#FFD700",
    },
    {
      IconLib: MaterialCommunityIcons, iconName: "chart-timeline-variant-shimmer",
      title: "Game Review", subtitle: "Analyze your games",
      onPress: () => navigation.navigate("GameReview"),
      gradient: ["#00BCD4", "#0097A7"], iconColor: "#00BCD4",
    },
    {
      IconLib: Ionicons, iconName: "settings-sharp",
      title: "Settings", subtitle: "Themes & preferences",
      onPress: () => navigation.navigate("Settings"),
      gradient: ["#78909C", "#546E7A"], iconColor: "#90A4AE",
    },
    {
      IconLib: Feather, iconName: "download",
      title: "Export", subtitle: "PGN, CSV, PDF",
      onPress: () => navigation.navigate("Export"),
      gradient: ["#607D8B", "#455A64"], iconColor: "#78909C",
    },
  ];

  const eloRating = user?.elo_rating || 1200;
  const winRate = user?.games_played > 0
    ? Math.round((user.games_won / user.games_played) * 100) : 0;

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>
                {user?.full_name || user?.username}{" "}
                <MaterialCommunityIcons name="chess-king" size={22} color={COLORS.gold} />
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              activeOpacity={0.85}
            >
              <LinearGradient colors={COLORS.gradientGold} style={styles.eloBadge}>
                <Ionicons name="star" size={14} color={COLORS.primary} style={{ marginBottom: 2 }} />
                <Text style={styles.eloLabel}>ELO</Text>
                <Text style={styles.eloValue}>{eloRating}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* XP Level Bar */}
          <View style={styles.section}>
            <XPLevelBar
              level={Math.max(1, Math.floor((user?.total_xp || 0) / 100) + 1)}
              currentXP={(user?.total_xp || 0) % 100}
              requiredXP={100}
              totalXP={user?.total_xp || 0}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            {[
              { label: "Games", value: user?.games_played || 0, icon: "gamepad-variant", color: COLORS.white },
              { label: "Wins", value: user?.games_won || 0, icon: "check-circle", color: COLORS.success },
              { label: "Losses", value: user?.games_lost || 0, icon: "close-circle", color: COLORS.danger },
              { label: "Win Rate", value: `${winRate}%`, icon: "percent-circle", color: COLORS.info },
            ].map((stat, i) => (
              <GlassCard key={i} style={[styles.statCard, i > 0 && { borderColor: stat.color + "25" }]}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={18}
                  color={stat.color}
                  style={{ marginBottom: 4 }}
                />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </GlassCard>
            ))}
          </View>

          {/* Daily Challenge Banner */}
          {dailyChallenge && !dailyChallenge.already_attempted && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate("DailyChallenge", { challenge: dailyChallenge })}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dailyBanner}
              >
                <View style={styles.dailyIconWrap}>
                  <Ionicons name="flame" size={28} color="#FFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.dailyLabel}>DAILY CHALLENGE</Text>
                  <Text style={styles.dailyTitle}>
                    {dailyChallenge.puzzle?.title || "Today's Puzzle"}
                  </Text>
                  <Text style={styles.dailyXP}>
                    +{dailyChallenge.bonus_xp} Bonus XP
                  </Text>
                </View>
                <Ionicons name="chevron-forward-circle" size={30} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          {dailyChallenge && dailyChallenge.already_attempted && (
            <GlassCard style={styles.dailyCompleted}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
              <Text style={styles.dailyCompletedText}> Daily Challenge Completed!</Text>
            </GlassCard>
          )}

          {/* Quick Play */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.accent} />
              <Text style={styles.sectionTitle}> Quick Play</Text>
            </View>
            <View style={styles.quickPlayRow}>
              <GradientButton
                title="vs AI"
                icon={<MaterialCommunityIcons name="robot" size={18} color="#FFF" />}
                gradient={COLORS.gradientAccent}
                onPress={() => navigation.navigate("DifficultySelect")}
                style={{ flex: 1, marginRight: 8 }}
              />
              <GradientButton
                title="Local PvP"
                icon={<Ionicons name="people" size={18} color="#FFF" />}
                gradient={COLORS.gradientPurple}
                onPress={() => navigation.navigate("Game", { mode: "pvp_local" })}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>

          {/* Menu Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="compass" size={20} color={COLORS.gold} />
              <Text style={styles.sectionTitle}> Explore</Text>
            </View>
            <View style={styles.menuGrid}>
              {menuItems.slice(2).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuCard}
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.menuIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <item.IconLib name={item.iconName} size={22} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.darkGray} />
            <Text style={styles.logoutText}> Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: SPACING.md,
  },
  greeting: {
    ...FONTS.caption,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 11,
  },
  username: {
    ...FONTS.h2,
    color: COLORS.white,
    marginTop: 2,
  },
  eloBadge: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    ...SHADOWS.medium,
  },
  eloLabel: {
    ...FONTS.small,
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1,
  },
  eloValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    padding: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
  },
  statLabel: {
    ...FONTS.small,
    color: COLORS.gray,
    marginTop: 2,
    fontSize: 10,
  },
  dailyBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.large,
  },
  dailyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dailyLabel: {
    ...FONTS.small,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    letterSpacing: 1.5,
    fontSize: 10,
  },
  dailyTitle: {
    ...FONTS.bodyBold,
    color: COLORS.white,
    marginTop: 2,
  },
  dailyXP: {
    ...FONTS.caption,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  dailyCompleted: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  dailyCompletedText: {
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 15,
  },
  quickPlayRow: {
    flexDirection: "row",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  menuCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.secondary,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    ...SHADOWS.small,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  menuTitle: {
    ...FONTS.bodyBold,
    color: COLORS.white,
    marginBottom: 2,
  },
  menuSubtitle: {
    ...FONTS.small,
    color: COLORS.gray,
  },
  logoutBtn: {
    marginVertical: SPACING.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
});