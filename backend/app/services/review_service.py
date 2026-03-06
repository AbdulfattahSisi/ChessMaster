"""
Game Review Service — Analyzes completed games and annotates each move.
Classifies moves as: brilliant, great, good, inaccuracy, mistake, blunder.
"""
import chess
from app.engine.chess_ai import ChessAI


# Move classification thresholds (centipawns)
BRILLIANT_THRESHOLD = 0     # Only move or exceptional sacrifice
GREAT_THRESHOLD = 10        # Within 10cp of best
GOOD_THRESHOLD = 30         # Within 30cp
INACCURACY_THRESHOLD = 80   # Lost 30-80 cp
MISTAKE_THRESHOLD = 200     # Lost 80-200 cp
# Blunder: > 200cp loss


def review_game(moves_list: list[dict], depth: int = 3) -> dict:
    """
    Analyze a completed game and classify every move.
    
    Args:
        moves_list: List of move dicts with 'uci' and 'san' keys
        depth: Analysis depth
    
    Returns:
        Dictionary with move annotations and game summary
    """
    ai = ChessAI()
    board = chess.Board()
    annotations = []
    
    prev_eval = 0.0  # evaluation from white's perspective
    
    brilliants = 0
    greats = 0
    goods = 0
    inaccuracies = 0
    mistakes = 0
    blunders = 0
    
    for i, move_data in enumerate(moves_list):
        uci_str = move_data.get("uci", "")
        san_str = move_data.get("san", "")
        
        if not uci_str:
            continue
        
        move = chess.Move.from_uci(uci_str)
        is_white = board.turn == chess.WHITE
        
        # Get AI's evaluation BEFORE the player's move
        best_eval = ai.evaluate_board(board)
        
        # Make the player's move
        board.push(move)
        
        # Evaluate AFTER the player's move
        after_eval = ai.evaluate_board(board)
        
        # Calculate evaluation loss from the player's perspective
        if is_white:
            eval_before = best_eval
            eval_after = -after_eval  # Flip because now it's black's turn
            eval_loss = eval_before - eval_after
        else:
            eval_before = -best_eval
            eval_after = after_eval
            eval_loss = eval_before - eval_after
        
        # Classify the move
        if eval_loss <= 0:
            # Move was as good or better than expected
            if board.is_checkmate():
                classification = "brilliant"
                brilliants += 1
            elif eval_loss < -50:
                classification = "brilliant"
                brilliants += 1
            else:
                classification = "great"
                greats += 1
        elif eval_loss <= GOOD_THRESHOLD:
            classification = "good"
            goods += 1
        elif eval_loss <= INACCURACY_THRESHOLD:
            classification = "inaccuracy"
            inaccuracies += 1
        elif eval_loss <= MISTAKE_THRESHOLD:
            classification = "mistake"
            mistakes += 1
        else:
            classification = "blunder"
            blunders += 1
        
        annotations.append({
            "move_number": (i // 2) + 1,
            "color": "white" if is_white else "black",
            "san": san_str,
            "uci": uci_str,
            "classification": classification,
            "eval_before": round(eval_before / 100, 2),
            "eval_after": round(eval_after / 100, 2),
            "eval_loss": round(eval_loss / 100, 2),
            "symbol": _get_symbol(classification),
        })
        
        prev_eval = after_eval
    
    total = len(annotations)
    accuracy = 0
    if total > 0:
        good_moves = brilliants + greats + goods
        accuracy = round((good_moves / total) * 100, 1)
    
    return {
        "annotations": annotations,
        "summary": {
            "total_moves": total,
            "accuracy": accuracy,
            "brilliants": brilliants,
            "greats": greats,
            "goods": goods,
            "inaccuracies": inaccuracies,
            "mistakes": mistakes,
            "blunders": blunders,
        },
    }


def _get_symbol(classification: str) -> str:
    symbols = {
        "brilliant": "!!",
        "great": "!",
        "good": "",
        "inaccuracy": "?!",
        "mistake": "?",
        "blunder": "??",
    }
    return symbols.get(classification, "")
