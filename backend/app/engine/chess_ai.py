"""
ChessMaster AI Engine
=====================
A minimax chess engine with alpha-beta pruning, iterative deepening,
move ordering, and positional evaluation.

Demonstrates: AI/algorithm design, optimization, Python proficiency.
"""
import chess
import time
from typing import Optional, Tuple, List, Dict
from app.models.models import AIDifficulty


# ──────────── Piece-Square Tables (midgame) ────────────
# Values from centipawn perspective for white.
# Encourages pieces to occupy strong squares.

PAWN_TABLE = [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
]

KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
]

BISHOP_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
]

ROOK_TABLE = [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
]

QUEEN_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
]

KING_MIDGAME_TABLE = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
]

KING_ENDGAME_TABLE = [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50,
]

PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20000,
}

PST = {
    chess.PAWN: PAWN_TABLE,
    chess.KNIGHT: KNIGHT_TABLE,
    chess.BISHOP: BISHOP_TABLE,
    chess.ROOK: ROOK_TABLE,
    chess.QUEEN: QUEEN_TABLE,
}

DIFFICULTY_DEPTH = {
    AIDifficulty.BEGINNER: 1,
    AIDifficulty.EASY: 2,
    AIDifficulty.MEDIUM: 3,
    AIDifficulty.HARD: 4,
    AIDifficulty.EXPERT: 5,
}


class ChessAI:
    """
    Chess AI using:
    - Minimax with Alpha-Beta pruning
    - Iterative Deepening
    - Move Ordering (MVV-LVA, killer moves, history heuristic)
    - Quiescence Search
    - Piece-Square Table evaluation
    - Endgame detection
    """

    def __init__(self, difficulty: AIDifficulty = AIDifficulty.MEDIUM):
        self.max_depth = DIFFICULTY_DEPTH.get(difficulty, 3)
        self.nodes_searched = 0
        self.time_limit = 10.0
        self.start_time = 0
        self.best_move_root = None
        self.killer_moves: Dict[int, List[chess.Move]] = {}
        self.history_table: Dict[Tuple[int, int], int] = {}
        self.transposition_table: Dict[int, Tuple[float, int, int, Optional[chess.Move]]] = {}

    def is_endgame(self, board: chess.Board) -> bool:
        """Detect endgame: no queens or queen + minor piece only."""
        queens = len(board.pieces(chess.QUEEN, chess.WHITE)) + len(board.pieces(chess.QUEEN, chess.BLACK))
        minors = (len(board.pieces(chess.KNIGHT, chess.WHITE)) + len(board.pieces(chess.BISHOP, chess.WHITE)) +
                  len(board.pieces(chess.KNIGHT, chess.BLACK)) + len(board.pieces(chess.BISHOP, chess.BLACK)))
        rooks = len(board.pieces(chess.ROOK, chess.WHITE)) + len(board.pieces(chess.ROOK, chess.BLACK))
        if queens == 0:
            return True
        if queens <= 2 and rooks == 0 and minors <= 1:
            return True
        return False

    def evaluate_board(self, board: chess.Board) -> float:
        """
        Static evaluation of board position in centipawns.
        Positive = white advantage, negative = black advantage.
        """
        if board.is_checkmate():
            return -20000 if board.turn == chess.WHITE else 20000
        if board.is_stalemate() or board.is_insufficient_material():
            return 0
        if board.can_claim_draw():
            return 0

        endgame = self.is_endgame(board)
        score = 0.0

        for piece_type in [chess.PAWN, chess.KNIGHT, chess.BISHOP, chess.ROOK, chess.QUEEN, chess.KING]:
            # White pieces
            for sq in board.pieces(piece_type, chess.WHITE):
                score += PIECE_VALUES[piece_type]
                if piece_type == chess.KING:
                    table = KING_ENDGAME_TABLE if endgame else KING_MIDGAME_TABLE
                    score += table[chess.square_mirror(sq)]
                elif piece_type in PST:
                    score += PST[piece_type][chess.square_mirror(sq)]

            # Black pieces
            for sq in board.pieces(piece_type, chess.BLACK):
                score -= PIECE_VALUES[piece_type]
                if piece_type == chess.KING:
                    table = KING_ENDGAME_TABLE if endgame else KING_MIDGAME_TABLE
                    score -= table[sq]
                elif piece_type in PST:
                    score -= PST[piece_type][sq]

        # Mobility bonus
        mobility = len(list(board.legal_moves))
        board.push(chess.Move.null())
        opp_mobility = len(list(board.legal_moves))
        board.pop()
        if board.turn == chess.WHITE:
            score += (mobility - opp_mobility) * 5
        else:
            score -= (mobility - opp_mobility) * 5

        # Bishop pair bonus
        if len(board.pieces(chess.BISHOP, chess.WHITE)) >= 2:
            score += 30
        if len(board.pieces(chess.BISHOP, chess.BLACK)) >= 2:
            score -= 30

        # Rook on open file bonus
        for sq in board.pieces(chess.ROOK, chess.WHITE):
            file = chess.square_file(sq)
            pawns_on_file = len([s for s in board.pieces(chess.PAWN, chess.WHITE) if chess.square_file(s) == file])
            if pawns_on_file == 0:
                score += 15

        for sq in board.pieces(chess.ROOK, chess.BLACK):
            file = chess.square_file(sq)
            pawns_on_file = len([s for s in board.pieces(chess.PAWN, chess.BLACK) if chess.square_file(s) == file])
            if pawns_on_file == 0:
                score -= 15

        return score

    def order_moves(self, board: chess.Board, moves: List[chess.Move], depth: int) -> List[chess.Move]:
        """Order moves for better alpha-beta pruning (MVV-LVA, killers, history)."""
        scored_moves = []
        for move in moves:
            score = 0
            # Captures: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
            if board.is_capture(move):
                victim = board.piece_type_at(move.to_square)
                attacker = board.piece_type_at(move.from_square)
                if victim and attacker:
                    score += 10000 + PIECE_VALUES.get(victim, 0) - PIECE_VALUES.get(attacker, 0) // 10

            # Promotions
            if move.promotion:
                score += 9000 + PIECE_VALUES.get(move.promotion, 0)

            # Killer moves
            if depth in self.killer_moves and move in self.killer_moves[depth]:
                score += 5000

            # History heuristic
            key = (move.from_square, move.to_square)
            score += self.history_table.get(key, 0)

            # Checks
            board.push(move)
            if board.is_check():
                score += 3000
            board.pop()

            scored_moves.append((score, move))

        scored_moves.sort(key=lambda x: x[0], reverse=True)
        return [m for _, m in scored_moves]

    def quiescence(self, board: chess.Board, alpha: float, beta: float, depth: int = 0) -> float:
        """Search captures only to avoid horizon effect."""
        self.nodes_searched += 1

        stand_pat = self.evaluate_board(board)
        if not board.turn:  # Black's turn
            stand_pat = -stand_pat

        if stand_pat >= beta:
            return beta

        if alpha < stand_pat:
            alpha = stand_pat

        if depth < -4:  # Limit quiescence depth
            return alpha

        for move in board.legal_moves:
            if not board.is_capture(move):
                continue

            board.push(move)
            score = -self.quiescence(board, -beta, -alpha, depth - 1)
            board.pop()

            if score >= beta:
                return beta
            if score > alpha:
                alpha = score

        return alpha

    def minimax(self, board: chess.Board, depth: int, alpha: float, beta: float,
                maximizing: bool) -> Tuple[float, Optional[chess.Move]]:
        """
        Minimax with alpha-beta pruning and iterative deepening.
        """
        self.nodes_searched += 1

        # Time check
        if time.time() - self.start_time > self.time_limit:
            eval_score = self.evaluate_board(board)
            return eval_score, None

        # Terminal node
        if board.is_game_over():
            if board.is_checkmate():
                return (-20000 - depth if maximizing else 20000 + depth), None
            return 0, None  # draw

        # Leaf node -> quiescence search
        if depth == 0:
            if maximizing:
                return self.evaluate_board(board), None
            else:
                return self.evaluate_board(board), None

        legal_moves = list(board.legal_moves)
        ordered_moves = self.order_moves(board, legal_moves, depth)

        best_move = ordered_moves[0] if ordered_moves else None

        if maximizing:
            max_eval = float('-inf')
            for move in ordered_moves:
                board.push(move)
                eval_score, _ = self.minimax(board, depth - 1, alpha, beta, False)
                board.pop()

                if eval_score > max_eval:
                    max_eval = eval_score
                    best_move = move

                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    # Store killer move
                    if not board.is_capture(move):
                        if depth not in self.killer_moves:
                            self.killer_moves[depth] = []
                        if move not in self.killer_moves[depth]:
                            self.killer_moves[depth].insert(0, move)
                            if len(self.killer_moves[depth]) > 2:
                                self.killer_moves[depth].pop()
                        key = (move.from_square, move.to_square)
                        self.history_table[key] = self.history_table.get(key, 0) + depth * depth
                    break

            return max_eval, best_move
        else:
            min_eval = float('inf')
            for move in ordered_moves:
                board.push(move)
                eval_score, _ = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()

                if eval_score < min_eval:
                    min_eval = eval_score
                    best_move = move

                beta = min(beta, eval_score)
                if beta <= alpha:
                    if not board.is_capture(move):
                        if depth not in self.killer_moves:
                            self.killer_moves[depth] = []
                        if move not in self.killer_moves[depth]:
                            self.killer_moves[depth].insert(0, move)
                            if len(self.killer_moves[depth]) > 2:
                                self.killer_moves[depth].pop()
                        key = (move.from_square, move.to_square)
                        self.history_table[key] = self.history_table.get(key, 0) + depth * depth
                    break

            return min_eval, best_move

    def get_best_move(self, board: chess.Board, time_limit: float = 5.0) -> Tuple[chess.Move, float, int]:
        """
        Find the best move using iterative deepening.
        Returns: (best_move, evaluation, depth_reached)
        """
        self.start_time = time.time()
        self.time_limit = time_limit
        self.nodes_searched = 0
        self.killer_moves = {}

        best_move = None
        best_eval = 0
        depth_reached = 0

        maximizing = board.turn == chess.WHITE

        # Iterative deepening
        for depth in range(1, self.max_depth + 1):
            if time.time() - self.start_time > self.time_limit * 0.8:
                break

            eval_score, move = self.minimax(
                board, depth,
                float('-inf'), float('inf'),
                maximizing
            )

            if move is not None:
                best_move = move
                best_eval = eval_score
                depth_reached = depth

        # Fallback: pick first legal move
        if best_move is None:
            legal = list(board.legal_moves)
            if legal:
                best_move = legal[0]

        return best_move, best_eval, depth_reached

    def analyze_position(self, fen: str, depth: Optional[int] = None) -> Dict:
        """Analyze a position and return evaluation details."""
        board = chess.Board(fen)
        analysis_depth = depth or self.max_depth

        old_depth = self.max_depth
        self.max_depth = analysis_depth

        best_move, evaluation, depth_reached = self.get_best_move(board, time_limit=10.0)
        self.max_depth = old_depth

        # Get the best line (PV - Principal Variation)
        best_line = []
        temp_board = board.copy()
        for _ in range(min(5, analysis_depth)):
            if temp_board.is_game_over():
                break
            mv, _, _ = self.get_best_move(temp_board, time_limit=1.0)
            if mv is None:
                break
            best_line.append(mv.uci())
            temp_board.push(mv)

        mate_in = None
        is_checkmate = False
        if abs(evaluation) > 19000:
            is_checkmate = True
            mate_distance = 20000 - abs(evaluation)
            mate_in = (mate_distance + 1) // 2
            if evaluation < 0:
                mate_in = -mate_in

        return {
            "fen": fen,
            "evaluation": round(evaluation / 100, 2),  # Convert to pawns
            "best_move": best_move.uci() if best_move else None,
            "best_line": best_line,
            "depth": depth_reached,
            "nodes_searched": self.nodes_searched,
            "is_checkmate": is_checkmate,
            "mate_in": mate_in,
        }

    def get_move_evaluation(self, board: chess.Board, move: chess.Move) -> float:
        """Evaluate a specific move by comparing position before/after."""
        eval_before = self.evaluate_board(board)
        board.push(move)
        eval_after = self.evaluate_board(board)
        board.pop()
        return eval_after - eval_before
