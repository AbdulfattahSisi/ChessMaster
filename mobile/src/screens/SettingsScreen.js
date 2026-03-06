import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  Modal, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS, BOARD_THEMES } from "../constants/theme";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { authAPI } from "../services/api";

const BOARD_THEME_KEYS = Object.keys(BOARD_THEMES);

const SETTING_ICONS = {
  soundEnabled:  { lib: "ion", name: "volume-high-outline" },
  hapticEnabled: { lib: "ion", name: "phone-portrait-outline" },
  showCoords:    { lib: "mci", name: "grid" },
  showLastMove:  { lib: "mci", name: "square-opacity" },
  moveConfirm:   { lib: "ion", name: "hand-left-outline" },
};

export default function SettingsScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const { settings, updateSetting } = useSettings();

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const [profileName, setProfileName] = useState(user?.full_name || "");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => { await logout(); },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setProfileSaving(true);
    try {
      await authAPI.updateProfile({ full_name: profileName.trim() });
      await refreshUser();
      setEditProfileVisible(false);
      Alert.alert("Success", "Profile updated!");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.detail || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setChangePasswordVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed successfully!");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.detail || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const renderBoardPreview = (themeKey) => {
    const theme = BOARD_THEMES[themeKey];
    const selected = settings.boardTheme === themeKey;
    return (
      <TouchableOpacity
        key={themeKey}
        style={[styles.themeCard, selected && styles.themeSelected]}
        onPress={() => updateSetting("boardTheme", themeKey)}
      >
        <View style={styles.miniBoard}>
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <View
                key={`${row}${col}`}
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: (row + col) % 2 === 0 ? theme.light : theme.dark,
                }}
              />
            ))
          )}
        </View>
        <Text style={[styles.themeLabel, selected && styles.themeLabelSelected]}>
          {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
        </Text>
        {selected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={10} color={COLORS.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderIcon = (cfg, size, color) => {
    if (cfg.lib === "mci")
      return <MaterialCommunityIcons name={cfg.name} size={size} color={color} />;
    return <Ionicons name={cfg.name} size={size} color={color} />;
  };

  return (
    <LinearGradient colors={COLORS.gradientNight} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={28} color={COLORS.accent} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Board Theme */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="palette-outline" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Board Theme</Text>
        </View>
        <View style={styles.themesRow}>
          {BOARD_THEME_KEYS.map(renderBoardPreview)}
        </View>

        {/* Gameplay */}
        <View style={styles.sectionHeader}>
          <Ionicons name="game-controller-outline" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Gameplay</Text>
        </View>
        <GlassCard style={styles.settingsGroup}>
          <SettingRow label="Sound Effects" iconCfg={SETTING_ICONS.soundEnabled} value={settings.soundEnabled} onToggle={(v) => updateSetting("soundEnabled", v)} renderIcon={renderIcon} />
          <View style={styles.divider} />
          <SettingRow label="Haptic Feedback" iconCfg={SETTING_ICONS.hapticEnabled} value={settings.hapticEnabled} onToggle={(v) => updateSetting("hapticEnabled", v)} renderIcon={renderIcon} />
          <View style={styles.divider} />
          <SettingRow label="Board Coordinates" iconCfg={SETTING_ICONS.showCoords} value={settings.showCoords} onToggle={(v) => updateSetting("showCoords", v)} renderIcon={renderIcon} />
          <View style={styles.divider} />
          <SettingRow label="Highlight Last Move" iconCfg={SETTING_ICONS.showLastMove} value={settings.showLastMove} onToggle={(v) => updateSetting("showLastMove", v)} renderIcon={renderIcon} />
          <View style={styles.divider} />
          <SettingRow label="Move Confirmation" iconCfg={SETTING_ICONS.moveConfirm} value={settings.moveConfirm} onToggle={(v) => updateSetting("moveConfirm", v)} renderIcon={renderIcon} />
        </GlassCard>

        {/* Account */}
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <GlassCard style={styles.settingsGroup}>
          <TouchableOpacity style={styles.actionRow} onPress={() => {
            setProfileName(user?.full_name || "");
            setEditProfileVisible(true);
          }}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.accent} style={{ marginRight: 12 }} />
            <Text style={styles.actionLabel}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate("Export")}>
            <Ionicons name="share-outline" size={20} color={COLORS.accent} style={{ marginRight: 12 }} />
            <Text style={styles.actionLabel}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setChangePasswordVisible(true);
          }}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.accent} style={{ marginRight: 12 }} />
            <Text style={styles.actionLabel}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        </GlassCard>

        {/* About */}
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        <GlassCard style={styles.aboutCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="chess-queen" size={24} color={COLORS.gold} style={{ marginRight: 8 }} />
            <Text style={styles.appName}>ChessMaster</Text>
          </View>
          <Text style={styles.version}>Version 2.0.0</Text>
          <Text style={styles.copyright}>Portfolio Project — OCP Khouribga / MyEPI</Text>
          <View style={styles.techRow}>
            {[
              { label: "React Native", icon: "logo-react" },
              { label: "FastAPI", icon: "flash-outline" },
              { label: "Python-Chess", icon: "logo-python" },
              { label: "AI Engine", icon: "hardware-chip-outline" },
            ].map((t) => (
              <View key={t.label} style={styles.techTag}>
                <Ionicons name={t.icon} size={12} color={COLORS.accent} style={{ marginRight: 4 }} />
                <Text style={styles.techText}>{t.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Logout */}
        <GradientButton
          title="Sign Out"
          icon={<Ionicons name="log-out-outline" size={18} color={COLORS.white} />}
          gradient={["#B71C1C", "#D32F2F"]}
          onPress={handleLogout}
          style={{ marginTop: SPACING.lg }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ——— Edit Profile Modal ——— */}
      <Modal visible={editProfileVisible} transparent animationType="slide" onRequestClose={() => setEditProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: SPACING.md }}>
              <Ionicons name="person-circle-outline" size={24} color={COLORS.accent} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Edit Profile</Text>
            </View>
            <Text style={styles.modalLabel}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="text-outline" size={18} color={COLORS.gray} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditProfileVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, profileSaving && { opacity: 0.6 }]}
                onPress={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} style={{ marginRight: 4 }} />
                    <Text style={styles.modalSaveText}>Save</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* ——— Change Password Modal ——— */}
      <Modal visible={changePasswordVisible} transparent animationType="slide" onRequestClose={() => setChangePasswordVisible(false)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: SPACING.md }}>
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.accent} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Change Password</Text>
            </View>
            <Text style={styles.modalLabel}>Current Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="key-outline" size={18} color={COLORS.gray} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
            <Text style={styles.modalLabel}>New Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-open-outline" size={18} color={COLORS.gray} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="At least 6 characters"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.gray} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Repeat new password"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setChangePasswordVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, passwordSaving && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={passwordSaving}
              >
                {passwordSaving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} style={{ marginRight: 4 }} />
                    <Text style={styles.modalSaveText}>Update</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </LinearGradient>
  );
}

function SettingRow({ label, iconCfg, value, onToggle, renderIcon }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconWrap}>
        {renderIcon(iconCfg, 18, COLORS.accent)}
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.surfaceLight, true: COLORS.accent }}
        thumbColor={value ? COLORS.gold : COLORS.gray}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: 55, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
  headerTitle: { ...FONTS.h1, color: COLORS.white, marginLeft: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  sectionTitle: {
    ...FONTS.bodyBold,
    color: COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  themesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  themeCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: RADIUS.md,
    padding: 10,
    alignItems: "center",
    width: "30%",
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeSelected: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(108,99,255,0.15)",
  },
  miniBoard: {
    width: 56,
    height: 56,
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 4,
    overflow: "hidden",
  },
  themeLabel: { ...FONTS.small, color: COLORS.gray, marginTop: 6 },
  themeLabelSelected: { color: COLORS.accent, fontWeight: "700" },
  checkBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsGroup: { padding: 0, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  settingIconWrap: { width: 28, alignItems: "center", marginRight: 10 },
  settingLabel: { ...FONTS.body, color: COLORS.white, flex: 1 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  actionLabel: { ...FONTS.body, color: COLORS.white, flex: 1 },
  aboutCard: { alignItems: "center", padding: SPACING.lg },
  appName: { ...FONTS.h2, color: COLORS.gold },
  version: { ...FONTS.caption, color: COLORS.gray, marginTop: 4 },
  copyright: { ...FONTS.small, color: COLORS.gray, marginTop: 2 },
  techRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: SPACING.sm,
  },
  techTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108,99,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  techText: { ...FONTS.small, color: COLORS.accent },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  modalContent: { padding: SPACING.lg },
  modalTitle: { ...FONTS.h3, color: COLORS.white },
  modalLabel: {
    ...FONTS.caption,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  modalInput: {
    flex: 1,
    color: COLORS.white,
    ...FONTS.body,
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.lg,
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.charcoal,
  },
  modalCancelText: { ...FONTS.bodyBold, color: COLORS.gray },
  modalSaveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
    minWidth: 80,
    alignItems: "center",
  },
  modalSaveText: { ...FONTS.bodyBold, color: COLORS.white },
});
