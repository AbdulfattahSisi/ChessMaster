"""
Analysis API: AI-powered position analysis and move evaluation.
"""
from fastapi import APIRouter, Depends
from app.schemas.schemas import AnalysisRequest, AnalysisResponse
from app.engine.chess_ai import ChessAI
from app.models.models import User, AIDifficulty
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/analysis", tags=["AI Analysis"])


@router.post("/evaluate", response_model=AnalysisResponse)
def evaluate_position(data: AnalysisRequest, current_user: User = Depends(get_current_user)):
    """
    AI-powered position evaluation.
    Returns best move, evaluation score, principal variation, and mate detection.
    """
    ai = ChessAI(AIDifficulty.EXPERT)
    result = ai.analyze_position(data.fen, data.depth)

    return AnalysisResponse(
        fen=result["fen"],
        evaluation=result["evaluation"],
        best_move=result["best_move"],
        best_line=result["best_line"],
        depth=result["depth"],
        is_checkmate=result["is_checkmate"],
        mate_in=result["mate_in"],
    )


@router.post("/suggest-move")
def suggest_move(data: AnalysisRequest, current_user: User = Depends(get_current_user)):
    """Get AI's suggested best move for a position with explanation."""
    import chess

    ai = ChessAI(AIDifficulty.EXPERT)
    result = ai.analyze_position(data.fen, data.depth)

    board = chess.Board(data.fen)
    best_uci = result["best_move"]

    # Generate human-readable explanation
    explanation = _explain_move(board, best_uci, result["evaluation"])

    return {
        "best_move": best_uci,
        "evaluation": result["evaluation"],
        "explanation": explanation,
        "best_line": result["best_line"],
    }


def _explain_move(board, uci: str, evaluation: float) -> str:
    """Generate a human-readable explanation of why a move is good."""
    import chess
    if not uci:
        return "No move available."

    move = chess.Move.from_uci(uci)
    san = board.san(move)
    piece = board.piece_at(move.from_square)
    piece_names = {
        chess.PAWN: "pawn", chess.KNIGHT: "knight", chess.BISHOP: "bishop",
        chess.ROOK: "rook", chess.QUEEN: "queen", chess.KING: "king",
    }
    piece_name = piece_names.get(piece.piece_type, "piece") if piece else "piece"

    explanations = []
    explanations.append(f"Best move: {san}")

    if board.is_capture(move):
        captured = board.piece_at(move.to_square)
        if captured:
            cap_name = piece_names.get(captured.piece_type, "piece")
            explanations.append(f"Captures the {cap_name} on {chess.square_name(move.to_square)}")

    board_copy = board.copy()
    board_copy.push(move)
    if board_copy.is_checkmate():
        explanations.append("Checkmate!")
    elif board_copy.is_check():
        explanations.append("Puts the king in check")

    if move.promotion:
        promo_name = piece_names.get(move.promotion, "queen")
        explanations.append(f"Promotes to {promo_name}")

    if board.is_castling(move):
        explanations.append("Castles for king safety")

    if abs(evaluation) > 3:
        explanations.append(f"Gives a decisive advantage ({evaluation:+.1f})")
    elif abs(evaluation) > 1:
        explanations.append(f"Gives a clear advantage ({evaluation:+.1f})")

    return ". ".join(explanations) + "."
