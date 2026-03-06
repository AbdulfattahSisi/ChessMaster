/**
 * Lightweight chess logic for the mobile client.
 * Handles FEN parsing, piece placement, and basic validation.
 * Heavy computation (AI, full validation) is done server-side.
 */

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

/**
 * Parse a FEN string into an 8x8 board array.
 * Returns: { board: string[][], turn: 'w'|'b', castling, enPassant, halfmove, fullmove }
 */
export function parseFEN(fen = INITIAL_FEN) {
  const parts = fen.split(" ");
  const rows = parts[0].split("/");
  const board = [];

  for (let r = 0; r < 8; r++) {
    const row = [];
    for (const char of rows[r]) {
      if (isNaN(char)) {
        row.push(char);
      } else {
        for (let i = 0; i < parseInt(char); i++) {
          row.push(null);
        }
      }
    }
    board.push(row);
  }

  return {
    board,
    turn: parts[1] || "w",
    castling: parts[2] || "-",
    enPassant: parts[3] || "-",
    halfmove: parseInt(parts[4]) || 0,
    fullmove: parseInt(parts[5]) || 1,
  };
}

/**
 * Convert board row/col to algebraic notation (e.g., 0,0 -> "a8")
 */
export function toAlgebraic(row, col) {
  return FILES[col] + RANKS[row];
}

/**
 * Convert algebraic notation to row/col (e.g., "e2" -> {row:6, col:4})
 */
export function fromAlgebraic(square) {
  const col = FILES.indexOf(square[0]);
  const row = RANKS.indexOf(square[1]);
  return { row, col };
}

/**
 * Check if a piece belongs to the current player.
 */
export function isPlayerPiece(piece, turn) {
  if (!piece) return false;
  if (turn === "w") return piece === piece.toUpperCase();
  return piece === piece.toLowerCase();
}

/**
 * Get the unicode symbol for a piece character.
 */
export function getPieceSymbol(piece) {
  const symbols = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
  };
  return symbols[piece] || "";
}

/**
 * Get piece color
 */
export function getPieceColor(piece) {
  if (!piece) return null;
  return piece === piece.toUpperCase() ? "white" : "black";
}

export { INITIAL_FEN, FILES, RANKS };


/**
 * Convert an 8x8 board array back into a FEN string.
 */
export function boardToFEN(board, turn = "w", castling = "-", enPassant = "-", halfmove = 0, fullmove = 1) {
  const rows = [];
  for (let r = 0; r < 8; r++) {
    let row = "";
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) {
        if (empty > 0) { row += empty; empty = 0; }
        row += board[r][c];
      } else {
        empty++;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
}

/**
 * Apply a UCI move (e.g. "e2e4", "e7e8q") to a FEN and return the new FEN.
 * Handles pawn promotion, en passant, and castling.
 */
export function applyMoveToFEN(fen, uci) {
  if (!uci || uci.length < 4) return fen;
  const parsed = parseFEN(fen);
  const { board, turn, castling, halfmove, fullmove } = parsed;

  const fromCol = FILES.indexOf(uci[0]);
  const fromRow = RANKS.indexOf(uci[1]);
  const toCol = FILES.indexOf(uci[2]);
  const toRow = RANKS.indexOf(uci[3]);
  const promotion = uci[4] || null;

  if (fromRow < 0 || fromCol < 0 || toRow < 0 || toCol < 0) return fen;

  const piece = board[fromRow][fromCol];
  const captured = board[toRow][toCol];

  // Move piece
  board[fromRow][fromCol] = null;
  board[toRow][toCol] = promotion
    ? (turn === "w" ? promotion.toUpperCase() : promotion.toLowerCase())
    : piece;

  // En passant capture
  const pieceLower = piece ? piece.toLowerCase() : "";
  if (pieceLower === "p" && toCol !== fromCol && !captured) {
    board[fromRow][toCol] = null;
  }

  // Castling rook movement
  if (pieceLower === "k" && Math.abs(toCol - fromCol) === 2) {
    if (toCol > fromCol) {
      // Kingside
      board[fromRow][5] = board[fromRow][7];
      board[fromRow][7] = null;
    } else {
      // Queenside
      board[fromRow][3] = board[fromRow][0];
      board[fromRow][0] = null;
    }
  }

  // Update castling rights (simplified)
  let newCastling = castling;
  if (piece === "K") newCastling = newCastling.replace(/[KQ]/g, "");
  if (piece === "k") newCastling = newCastling.replace(/[kq]/g, "");
  if (uci.startsWith("a1") || uci.substring(2,4) === "a1") newCastling = newCastling.replace("Q", "");
  if (uci.startsWith("h1") || uci.substring(2,4) === "h1") newCastling = newCastling.replace("K", "");
  if (uci.startsWith("a8") || uci.substring(2,4) === "a8") newCastling = newCastling.replace("q", "");
  if (uci.startsWith("h8") || uci.substring(2,4) === "h8") newCastling = newCastling.replace("k", "");
  if (!newCastling) newCastling = "-";

  // En passant square
  let newEnPassant = "-";
  if (pieceLower === "p" && Math.abs(toRow - fromRow) === 2) {
    const epRow = (fromRow + toRow) / 2;
    newEnPassant = FILES[toCol] + RANKS[epRow];
  }

  const newTurn = turn === "w" ? "b" : "w";
  const newHalfmove = (pieceLower === "p" || captured) ? 0 : halfmove + 1;
  const newFullmove = turn === "b" ? fullmove + 1 : fullmove;

  return boardToFEN(board, newTurn, newCastling, newEnPassant, newHalfmove, newFullmove);
}
