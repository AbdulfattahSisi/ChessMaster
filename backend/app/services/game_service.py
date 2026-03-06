"""
Game Service: Manages game creation, moves, and lifecycle.
"""
import chess
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.models import (
    Game, Move, User, GameStatus, GameResult, GameMode, AIDifficulty
)
from app.engine.chess_ai import ChessAI


PIECE_MAP = {
    chess.PAWN: "P", chess.KNIGHT: "N", chess.BISHOP: "B",
    chess.ROOK: "R", chess.QUEEN: "Q", chess.KING: "K",
}


def create_game(
    db: Session,
    user: User,
    mode: GameMode,
    ai_difficulty: Optional[AIDifficulty] = None,
    time_control: int = 600,
    color_preference: str = "white"
) -> Game:
    """Create a new game."""
    initial_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

    game = Game(
        mode=mode,
        status=GameStatus.ACTIVE,
        initial_fen=initial_fen,
        current_fen=initial_fen,
        pgn="",
        moves_count=0,
        time_control=time_control,
        white_time_remaining=float(time_control),
        black_time_remaining=float(time_control),
        ai_difficulty=ai_difficulty,
    )

    if mode == GameMode.VS_AI:
        if color_preference == "white":
            game.white_player_id = user.id
            game.black_player_id = None  # AI
        else:
            game.white_player_id = None  # AI
            game.black_player_id = user.id
    elif mode == GameMode.PVP_LOCAL:
        game.white_player_id = user.id
        game.black_player_id = user.id
    else:
        game.white_player_id = user.id

    db.add(game)
    db.commit()
    db.refresh(game)
    return game


def make_move(
    db: Session,
    game: Game,
    from_sq: str,
    to_sq: str,
    promotion: Optional[str] = None
) -> Tuple[Move, Optional[Move], chess.Board]:
    """
    Execute a player's move and optionally get AI response.
    Returns: (player_move, ai_move_or_none, updated_board)
    """
    board = chess.Board(game.current_fen)

    # Build UCI string
    uci_str = from_sq + to_sq
    if promotion:
        uci_str += promotion

    try:
        move = chess.Move.from_uci(uci_str)
    except ValueError:
        raise ValueError(f"Invalid move format: {uci_str}")

    if move not in board.legal_moves:
        raise ValueError(f"Illegal move: {uci_str}. Legal moves: {[m.uci() for m in board.legal_moves]}")

    # Record the player move
    player_move = _record_move(db, game, board, move)
    board.push(move)

    # Update game state
    game.current_fen = board.fen()
    game.moves_count += 1
    _update_pgn(game, player_move.san)

    # Check for game over after player move
    if board.is_game_over():
        _end_game(db, game, board)
        db.commit()
        return player_move, None, board

    # AI response if VS_AI mode
    ai_move_record = None
    if game.mode == GameMode.VS_AI:
        ai = ChessAI(game.ai_difficulty or AIDifficulty.MEDIUM)
        ai_chess_move, evaluation, _ = ai.get_best_move(board, time_limit=5.0)

        if ai_chess_move:
            ai_move_record = _record_move(db, game, board, ai_chess_move)
            ai_move_record.evaluation = evaluation
            board.push(ai_chess_move)

            game.current_fen = board.fen()
            game.moves_count += 1
            _update_pgn(game, ai_move_record.san)

            if board.is_game_over():
                _end_game(db, game, board)

    game.updated_at = datetime.utcnow()
    db.commit()
    return player_move, ai_move_record, board


def _record_move(db: Session, game: Game, board: chess.Board, move: chess.Move) -> Move:
    """Create a Move DB record."""
    san = board.san(move)
    piece_at = board.piece_type_at(move.from_square)
    captured = board.piece_type_at(move.to_square)

    # Check for castling
    is_castle = board.is_castling(move)

    # Determine check/checkmate after move
    board_copy = board.copy()
    board_copy.push(move)
    is_check = board_copy.is_check()
    is_checkmate = board_copy.is_checkmate()
    fen_after = board_copy.fen()

    color = "white" if board.turn == chess.WHITE else "black"
    move_number = board.fullmove_number

    move_record = Move(
        game_id=game.id,
        move_number=move_number,
        player_color=color,
        from_square=chess.square_name(move.from_square),
        to_square=chess.square_name(move.to_square),
        piece=PIECE_MAP.get(piece_at, "P"),
        captured_piece=PIECE_MAP.get(captured) if captured else None,
        promotion=move.promotion and chess.piece_symbol(move.promotion).upper(),
        san=san,
        uci=move.uci(),
        fen_after=fen_after,
        is_check=is_check,
        is_checkmate=is_checkmate,
        is_castle=is_castle,
    )
    db.add(move_record)
    return move_record


def _update_pgn(game: Game, san: str):
    """Append move to PGN string."""
    board = chess.Board(game.initial_fen)
    # Simple PGN building from move count
    if game.moves_count % 2 == 1:  # White just moved
        move_num = (game.moves_count + 1) // 2
        game.pgn += f"{move_num}. {san} "
    else:  # Black just moved
        game.pgn += f"{san} "


def _end_game(db: Session, game: Game, board: chess.Board):
    """Handle game over."""
    game.status = GameStatus.COMPLETED
    game.completed_at = datetime.utcnow()

    if board.is_checkmate():
        # The player who is in checkmate lost
        if board.turn == chess.WHITE:
            game.result = GameResult.BLACK_WIN
        else:
            game.result = GameResult.WHITE_WIN
    elif board.is_stalemate():
        game.result = GameResult.STALEMATE
    else:
        game.result = GameResult.DRAW

    # Update player ELO
    _update_elo(db, game)


def _update_elo(db: Session, game: Game):
    """Update ELO ratings for both players using standard ELO formula."""
    K = 32  # K-factor

    white = db.query(User).filter(User.id == game.white_player_id).first() if game.white_player_id else None
    black = db.query(User).filter(User.id == game.black_player_id).first() if game.black_player_id else None

    if not white and not black:
        return

    white_elo = white.elo_rating if white else 1500  # AI rating
    black_elo = black.elo_rating if black else 1500

    # Expected scores
    exp_white = 1 / (1 + 10 ** ((black_elo - white_elo) / 400))
    exp_black = 1 - exp_white

    # Actual scores
    if game.result == GameResult.WHITE_WIN:
        actual_white, actual_black = 1.0, 0.0
    elif game.result == GameResult.BLACK_WIN:
        actual_white, actual_black = 0.0, 1.0
    else:
        actual_white, actual_black = 0.5, 0.5

    if white:
        white.elo_rating = max(100, int(white_elo + K * (actual_white - exp_white)))
        white.elo_peak = max(white.elo_peak, white.elo_rating)
        white.games_played += 1
        if game.result == GameResult.WHITE_WIN:
            white.games_won += 1
            white.win_streak += 1
            white.best_streak = max(white.best_streak, white.win_streak)
            # Track checkmate wins
            board = chess.Board(game.current_fen)
            if board.is_checkmate():
                white.checkmate_wins += 1
        elif game.result == GameResult.BLACK_WIN:
            white.games_lost += 1
            white.win_streak = 0
        else:
            white.games_drawn += 1
            white.win_streak = 0

    if black:
        black.elo_rating = max(100, int(black_elo + K * (actual_black - exp_black)))
        black.elo_peak = max(black.elo_peak, black.elo_rating)
        black.games_played += 1
        if game.result == GameResult.BLACK_WIN:
            black.games_won += 1
            black.win_streak += 1
            black.best_streak = max(black.best_streak, black.win_streak)
            board = chess.Board(game.current_fen)
            if board.is_checkmate():
                black.checkmate_wins += 1
        elif game.result == GameResult.WHITE_WIN:
            black.games_lost += 1
            black.win_streak = 0
        else:
            black.games_drawn += 1
            black.win_streak = 0


def get_legal_moves(fen: str) -> List[str]:
    """Return list of legal moves in UCI format for a given position."""
    board = chess.Board(fen)
    return [move.uci() for move in board.legal_moves]


def resign_game(db: Session, game: Game, user_id: str):
    """Player resigns the game."""
    game.status = GameStatus.COMPLETED
    game.result = GameResult.RESIGNATION
    game.completed_at = datetime.utcnow()

    if game.white_player_id == user_id:
        game.result = GameResult.BLACK_WIN
    else:
        game.result = GameResult.WHITE_WIN

    _update_elo(db, game)
    db.commit()
