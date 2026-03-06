import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import GradientButton from "../components/GradientButton";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password, fullName);
    } catch (err) {
      Alert.alert("Registration Failed", err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const chessPieces = ["chess-rook", "chess-knight", "chess-bishop", "chess-queen", "chess-king", "chess-bishop", "chess-knight", "chess-rook"];

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Decorative chess pieces row */}
          <Animated.View style={[styles.decoRow, { opacity: fadeAnim }]}>
            {chessPieces.map((piece, i) => (
              <MaterialCommunityIcons
                key={i}
                name={piece}
                size={26}
                color={COLORS.white}
                style={{ opacity: 0.08 + i * 0.015, marginHorizontal: 2 }}
              />
            ))}
          </Animated.View>

          {/* Header with animated icon */}
          <Animated.View style={[styles.header, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-plus" size={30} color={COLORS.accent} />
            </View>
            <Text style={styles.title}>Join the Arena</Text>
            <Text style={styles.subtitle}>Create your ChessMaster account</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View style={[styles.form, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }]}>
            {/* Username */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username *"
                placeholderTextColor={COLORS.darkGray}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor={COLORS.darkGray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <Ionicons name="text-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name (optional)"
                placeholderTextColor={COLORS.darkGray}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password * (min 6 chars)"
                placeholderTextColor={COLORS.darkGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <GradientButton
              title="Create Account"
              icon={<Ionicons name="rocket-outline" size={20} color={COLORS.white} />}
              onPress={handleRegister}
              loading={loading}
              gradient={COLORS.gradientAccent}
              style={{ marginTop: SPACING.sm }}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <MaterialCommunityIcons name="chess-pawn" size={20} color={COLORS.darkGray} style={{ marginHorizontal: 12 }} />
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkRow}>
              <Text style={styles.link}>Already have an account? </Text>
              <Text style={styles.linkBold}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footerRow}>
            <MaterialCommunityIcons name="chess-queen" size={14} color={COLORS.darkGray} />
            <Text style={styles.footer}> ChessMaster v2.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: SPACING.lg },
  decoRow: {
    flexDirection: "row", justifyContent: "center",
    marginBottom: SPACING.md,
  },
  header: { alignItems: "center", marginBottom: SPACING.lg },
  iconCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 2, borderColor: COLORS.accent,
    justifyContent: "center", alignItems: "center", marginBottom: SPACING.sm,
  },
  title: { ...FONTS.h1, color: COLORS.white },
  subtitle: { ...FONTS.caption, color: COLORS.gray, marginTop: 4 },
  form: {
    backgroundColor: "rgba(19,22,41,0.7)",
    borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: "rgba(108,99,255,0.15)",
    ...SHADOWS.medium,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(11,13,23,0.6)",
    borderRadius: RADIUS.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: "rgba(139,146,168,0.1)",
    paddingHorizontal: SPACING.md,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1, paddingVertical: 14,
    fontSize: 16, color: COLORS.white,
  },
  eyeBtn: { padding: 8 },
  divider: {
    flexDirection: "row", alignItems: "center",
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1, height: 1,
    backgroundColor: "rgba(139,146,168,0.15)",
  },
  linkRow: {
    flexDirection: "row", justifyContent: "center",
  },
  link: { ...FONTS.caption, color: COLORS.gray },
  linkBold: { ...FONTS.caption, color: COLORS.accent, fontWeight: "700" },
  footerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: SPACING.xl,
  },
  footer: {
    ...FONTS.small, color: COLORS.darkGray,
  },
});
