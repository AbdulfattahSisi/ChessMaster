"""
Games API: Create games, make moves, get game state.
"""
import chess
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Game, GameStatus, GameMode
from app.schemas.schemas import (
    GameCreate, GameResponse, GameListResponse,
    MoveCreate, MoveResponse, MoveResult
)
from app.services import game_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/games", tags=["Games"])


@router.post("/", response_model=GameResponse, status_code=201)
def create_game(data: GameCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new chess game."""
    game = game_service.create_game(
        db=db,
        user=current_user,
        mode=data.mode,
        ai_difficulty=data.ai_difficulty,
        time_control=data.time_control,
        color_preference=data.color_preference or "white",
    )

    # If playing as black vs AI, AI makes first move
    if data.mode == GameMode.VS_AI and data.color_preference == "black":
        from app.engine.chess_ai import ChessAI
        from app.models.models import AIDifficulty
        board = chess.Board(game.current_fen)
        ai = ChessAI(data.ai_difficulty or AIDifficulty.MEDIUM)
        ai_move, _, _ = ai.get_best_move(board, time_limit=5.0)
        if ai_move:
            game_service.make_move(db, game, chess.square_name(ai_move.from_square),
                                   chess.square_name(ai_move.to_square),
                                   chess.piece_symbol(ai_move.promotion).lower() if ai_move.promotion else None)

    return game


@router.get("/", response_model=GameListResponse)
def list_games(
    status: Optional[GameStatus] = None,
    mode: Optional[GameMode] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List user's games with optional filters."""
    query = db.query(Game).filter(
        (Game.white_player_id == current_user.id) | (Game.black_player_id == current_user.id)
    )
    if status:
        query = query.filter(Game.status == status)
    if mode:
        query = query.filter(Game.mode == mode)

    total = query.count()
    games = query.order_by(Game.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return GameListResponse(games=games, total=total, page=page, page_size=page_size)


@router.get("/{game_id}", response_model=GameResponse)
def get_game(game_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific game by ID."""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.post("/{game_id}/move", response_model=MoveResult)
def make_move(game_id: str, data: MoveCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Make a move in a game."""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != GameStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Game is not active")

    # Verify it's the player's turn
    board = chess.Board(game.current_fen)
    if board.turn == chess.WHITE and game.white_player_id != current_user.id:
        if game.mode != GameMode.PVP_LOCAL:
            raise HTTPException(status_code=403, detail="Not your turn")
    if board.turn == chess.BLACK and game.black_player_id != current_user.id:
        if game.mode != GameMode.PVP_LOCAL:
            raise HTTPException(status_code=403, detail="Not your turn")

    try:
        player_move, ai_move, updated_board = game_service.make_move(
            db, game, data.from_square, data.to_square, data.promotion
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    legal_moves = game_service.get_legal_moves(updated_board.fen()) if not updated_board.is_game_over() else []

    return MoveResult(
        player_move=player_move,
        ai_move=ai_move,
        game_status=game.status,
        game_result=game.result,
        legal_moves=legal_moves,
    )


@router.get("/{game_id}/moves", response_model=list[MoveResponse])
def get_game_moves(game_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all moves for a game."""
    from app.models.models import Move
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    moves = db.query(Move).filter(Move.game_id == game_id).order_by(Move.move_number, Move.created_at).all()
    return moves


@router.get("/{game_id}/legal-moves")
def get_legal_moves(game_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get legal moves for current position."""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    moves = game_service.get_legal_moves(game.current_fen)
    return {"legal_moves": moves, "fen": game.current_fen}


@router.post("/{game_id}/resign")
def resign_game(game_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Resign from a game."""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != GameStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Game is not active")

    game_service.resign_game(db, game, current_user.id)
    return {"message": "Game resigned", "result": game.result.value}
