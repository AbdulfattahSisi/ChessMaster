import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { parseFEN, toAlgebraic, fromAlgebraic, isPlayerPiece, getPieceSymbol } from "../engine/chessLogic";
import { COLORS, BOARD_THEMES } from "../constants/theme";
import { useSettings } from "../contexts/SettingsContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BOARD_SIZE = SCREEN_WIDTH - 32;
const SQUARE_SIZE = BOARD_SIZE / 8;

export default function ChessBoard({
  fen,
  legalMoves = [],
  onMove,
  playerColor = "w",
  disabled = false,
  lastMove = null,
}) {
  const { settings } = useSettings();
  const boardColors = BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.classic;
  const [selectedSquare, setSelectedSquare] = useState(null);
  const { board, turn } = useMemo(() => parseFEN(fen), [fen]);

  // Find legal destinations for the selected piece
  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return [];
    return legalMoves
      .filter((m) => m.startsWith(selectedSquare))
      .map((m) => m.substring(2, 4));
  }, [selectedSquare, legalMoves]);

  const handleSquarePress = (row, col) => {
    if (disabled) return;

    const square = toAlgebraic(row, col);
    const piece = board[row][col];

    // If a piece is already selected
    if (selectedSquare) {
      // If tapping the same square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      // If tapping a legal destination, make the move
      if (legalDestinations.includes(square)) {
        const uci = selectedSquare + square;
        // Check for pawn promotion
        const fromPos = fromAlgebraic(selectedSquare);
        const movingPiece = board[fromPos.row][fromPos.col];
        const isPromotion =
          (movingPiece === "P" && row === 0) || (movingPiece === "p" && row === 7);

        onMove?.({
          from_square: selectedSquare,
          to_square: square,
          promotion: isPromotion ? "q" : undefined, // Auto-queen for simplicity
        });
        setSelectedSquare(null);
        return;
      }

      // If tapping own piece, reselect
      if (piece && isPlayerPiece(piece, turn)) {
        setSelectedSquare(square);
        return;
      }

      setSelectedSquare(null);
      return;
    }

    // Select a piece
    if (piece && isPlayerPiece(piece, turn)) {
      setSelectedSquare(square);
    }
  };

  const renderSquare = (row, col) => {
    const isLight = (row + col) % 2 === 0;
    const square = toAlgebraic(row, col);
    const piece = board[row][col];
    const isSelected = selectedSquare === square;
    const isLegalDest = legalDestinations.includes(square);
    const isLastMoveSquare =
      lastMove && (lastMove.from_square === square || lastMove.to_square === square);

    let bgColor = isLight ? boardColors.light : boardColors.dark;
    if (isSelected) bgColor = COLORS.moveHighlight;
    if (settings.showLastMove && isLastMoveSquare) bgColor = isLight ? "#f7ec7d" : "#dac34b";

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[styles.square, { backgroundColor: bgColor }]}
        onPress={() => handleSquarePress(row, col)}
        activeOpacity={0.7}
      >
        {/* Coordinate labels */}
        {settings.showCoords && col === 0 && (
          <Text style={[styles.coordRank, { color: isLight ? boardColors.dark : boardColors.light }]}>
            {8 - row}
          </Text>
        )}
        {settings.showCoords && row === 7 && (
          <Text style={[styles.coordFile, { color: isLight ? boardColors.dark : boardColors.light }]}>
            {"abcdefgh"[col]}
          </Text>
        )}

        {/* Legal move dot */}
        {isLegalDest && !piece && <View style={styles.legalDot} />}
        {isLegalDest && piece && <View style={styles.legalCapture} />}

        {/* Piece */}
        {piece && (
          <Text style={[styles.piece, piece === piece.toLowerCase() && styles.blackPiece]}>
            {getPieceSymbol(piece)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const rows = playerColor === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = playerColor === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <View style={styles.boardContainer}>
      <View style={styles.board}>
        {rows.map((row) => (
          <View key={row} style={styles.row}>
            {cols.map((col) => renderSquare(row, col))}
          </View>
        ))}
      </View>
      <View style={styles.turnIndicator}>
        <View style={[styles.turnDot, { backgroundColor: turn === "w" ? "#fff" : "#000" }]} />
        <Text style={styles.turnText}>
          {turn === "w" ? "White" : "Black"} to move
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  piece: {
    fontSize: SQUARE_SIZE * 0.7,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  blackPiece: {
    textShadowColor: "rgba(255,255,255,0.3)",
  },
  legalDot: {
    width: SQUARE_SIZE * 0.25,
    height: SQUARE_SIZE * 0.25,
    borderRadius: SQUARE_SIZE * 0.125,
    backgroundColor: "rgba(0,0,0,0.2)",
    position: "absolute",
  },
  legalCapture: {
    width: SQUARE_SIZE * 0.9,
    height: SQUARE_SIZE * 0.9,
    borderRadius: SQUARE_SIZE * 0.45,
    borderWidth: SQUARE_SIZE * 0.08,
    borderColor: "rgba(0,0,0,0.2)",
    position: "absolute",
  },
  coordRank: {
    position: "absolute",
    top: 1,
    left: 2,
    fontSize: 9,
    fontWeight: "bold",
  },
  coordFile: {
    position: "absolute",
    bottom: 1,
    right: 2,
    fontSize: 9,
    fontWeight: "bold",
  },
  turnIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  turnDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#666",
    marginRight: 6,
  },
  turnText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
});
