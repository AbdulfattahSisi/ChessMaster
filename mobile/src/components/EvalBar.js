import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { COLORS, FONTS } from "../constants/theme";

const BAR_HEIGHT = 320;
const BAR_WIDTH = 28;

/**
 * EvalBar — Visual evaluation bar like chess.com / lichess.
 * Shows white/black advantage as a sliding bar.
 *
 * @param {number} evaluation - Centipawn evaluation from white's perspective
 * @param {number|null} mateIn - Mate in N moves (positive=white, negative=black)
 */
export default function EvalBar({ evaluation = 0, mateIn = null }) {
  // API returns evaluation in pawns; convert to centipawns for internal math
  const evalCp = evaluation * 100;
  // Convert evaluation to a percentage (0-100) where 50 = equal
  let whitePercent;
  if (mateIn !== null) {
    whitePercent = mateIn > 0 ? 98 : 2;
  } else {
    // Sigmoid-like function to keep bar within bounds
    const clampedEval = Math.max(-1000, Math.min(1000, evalCp));
    whitePercent = 50 + (50 * (2 / (1 + Math.exp(-clampedEval / 250)) - 1));
  }

  const blackPercent = 100 - whitePercent;

  // Display text
  let displayText;
  if (mateIn !== null) {
    displayText = `M${Math.abs(mateIn)}`;
  } else {
    const evalInPawns = Math.abs(evaluation);
    displayText = evalInPawns < 0.1 ? "0.0" : evalInPawns.toFixed(1);
  }

  const isWhiteAdvantage = evalCp >= 0 && (mateIn === null || mateIn > 0);

  return (
    <View style={styles.container}>
      {/* Black section (top) */}
      <View style={[styles.blackSection, { flex: blackPercent }]}>
        {!isWhiteAdvantage && (
          <Text style={styles.blackText}>{displayText}</Text>
        )}
      </View>
      {/* White section (bottom) */}
      <View style={[styles.whiteSection, { flex: whitePercent }]}>
        {isWhiteAdvantage && (
          <Text style={styles.whiteText}>{displayText}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.charcoal,
  },
  blackSection: {
    backgroundColor: COLORS.charcoal,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
  },
  whiteSection: {
    backgroundColor: "#F0F0F0",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
  blackText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  whiteText: {
    color: "#333333",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "monospace",
  },
});
