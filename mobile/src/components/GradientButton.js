import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, RADIUS, SHADOWS, FONTS } from "../constants/theme";

/**
 * GradientButton — Premium button with gradient background.
 * Supports both string (emoji) and React element icons.
 */
export default function GradientButton({
  title,
  onPress,
  gradient = COLORS.gradientAccent,
  icon,
  loading = false,
  disabled = false,
  size = "normal",
  style,
}) {
  const isSmall = size === "small";

  const renderIcon = () => {
    if (!icon) return null;
    // If icon is a React element (e.g. <Ionicons />), render directly
    if (typeof icon === "object" && React.isValidElement(icon)) {
      return <View style={{ marginRight: 8 }}>{icon}</View>;
    }
    // String icon (emoji)
    return <Text style={[styles.icon, isSmall && styles.iconSmall]}>{icon}</Text>;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && { opacity: 0.5 }, style]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          isSmall && styles.buttonSmall,
          SHADOWS.small,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            {renderIcon()}
            <Text style={[styles.text, isSmall && styles.textSmall]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: RADIUS.md,
  },
  buttonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.sm,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  iconSmall: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
  textSmall: {
    fontSize: 14,
  },
});