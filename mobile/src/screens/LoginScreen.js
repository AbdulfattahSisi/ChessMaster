import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  Dimensions, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import GradientButton from "../components/GradientButton";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      Alert.alert("Login Failed", err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Decorative chess pieces background */}
        <View style={styles.decorRow}>
          {[
            "chess-rook", "chess-knight", "chess-bishop", "chess-queen",
            "chess-king", "chess-bishop", "chess-knight", "chess-rook",
          ].map((name, i) => (
            <MaterialCommunityIcons key={i} name={name} size={28} color="rgba(255,255,255,0.04)" />
          ))}
        </View>

        {/* Logo */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient colors={COLORS.gradientGold} style={styles.logoCircle}>
                <MaterialCommunityIcons name="chess-king" size={48} color={COLORS.primary} />
              </LinearGradient>
            </Animated.View>
            <View style={styles.logoPulse} />
            <View style={[styles.logoPulse, { width: 120, height: 120, top: -15, left: -15, borderColor: "rgba(255,215,0,0.08)" }]} />
          </View>
          <Text style={styles.title}>ChessMaster</Text>
          <Text style={styles.subtitle}>AI-Powered Chess Platform</Text>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <MaterialCommunityIcons name="chess-pawn" size={18} color={COLORS.darkGray} style={{ marginHorizontal: 12 }} />
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={COLORS.gray} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.darkGray}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.darkGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>

          <GradientButton
            title="Sign In"
            icon={<MaterialCommunityIcons name="chess-king" size={18} color="#FFF" />}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            gradient={COLORS.gradientAccent}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkContainer}>
            <Text style={styles.link}>
              Don't have an account?{" "}
              <Text style={styles.linkBold}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <Text style={styles.version}>v2.0 • Built with FastAPI + React Native</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  decorRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.lg,
    opacity: 0.8,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    position: "relative",
    marginBottom: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.large,
  },
  logoPulse: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.15)",
    top: -10,
    left: -10,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    ...FONTS.caption,
    color: COLORS.gray,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    width: "60%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.charcoal,
  },
  form: {
    backgroundColor: "rgba(19, 22, 41, 0.85)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.12)",
    ...SHADOWS.large,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.charcoal,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: COLORS.white,
  },
  linkContainer: { marginTop: SPACING.lg, alignItems: "center" },
  link: {
    color: COLORS.gray,
    fontSize: 14,
  },
  linkBold: {
    color: COLORS.accent,
    fontWeight: "bold",
  },
  version: {
    ...FONTS.small,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});