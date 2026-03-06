"""
Leaderboard & Stats API: Rankings, player statistics, and openings library.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models.models import User, Game, Move, Opening, GameResult, UserRole
from app.schemas.schemas import LeaderboardEntry, UserStats, UserResponse, OpeningResponse
from app.utils.auth import get_current_user, require_role

router = APIRouter(prefix="/api", tags=["Leaderboard & Stats"])


# ─── Leaderboard ───

@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Get top players leaderboard (public endpoint)."""
    players = (
        db.query(User)
        .filter(User.is_active == True, User.games_played >= 1)
        .order_by(desc(User.elo_rating))
        .limit(limit)
        .all()
    )

    leaderboard = []
    for rank, player in enumerate(players, 1):
        win_rate = (player.games_won / player.games_played * 100) if player.games_played > 0 else 0.0
        leaderboard.append(LeaderboardEntry(
            rank=rank,
            username=player.username,
            elo_rating=player.elo_rating,
            games_played=player.games_played,
            games_won=player.games_won,
            win_rate=round(win_rate, 1),
        ))

    return leaderboard


# ─── Player Stats ───

@router.get("/stats", response_model=UserStats)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get detailed stats for the current user."""
    # Average game length
    games = db.query(Game).filter(
        (Game.white_player_id == current_user.id) | (Game.black_player_id == current_user.id)
    ).all()

    avg_length = 0.0
    if games:
        total_moves = sum(g.moves_count for g in games)
        avg_length = total_moves / len(games)

    # ELO history — reconstruct from games using K=32 formula
    elo_history = []
    running_elo = 1200  # Starting ELO
    sorted_games = sorted(games, key=lambda g: g.created_at)
    for game in sorted_games:
        if game.result:
            # Determine if user won/lost/drew
            is_white = game.white_player_id == current_user.id
            if game.result == GameResult.WHITE_WIN:
                actual = 1.0 if is_white else 0.0
            elif game.result == GameResult.BLACK_WIN:
                actual = 0.0 if is_white else 1.0
            else:
                actual = 0.5
            opp_elo = 1500  # AI default
            expected = 1 / (1 + 10 ** ((opp_elo - running_elo) / 400))
            running_elo = max(100, int(running_elo + 32 * (actual - expected)))
            elo_history.append({
                "date": game.created_at.isoformat(),
                "elo": running_elo,
                "game_id": game.id[:8],
            })
    elo_history.append({"date": "now", "elo": current_user.elo_rating})

    win_rate = (current_user.games_won / current_user.games_played * 100) if current_user.games_played > 0 else 0.0

    return UserStats(
        total_games=current_user.games_played,
        wins=current_user.games_won,
        losses=current_user.games_lost,
        draws=current_user.games_drawn,
        win_rate=round(win_rate, 1),
        current_elo=current_user.elo_rating,
        peak_elo=current_user.elo_peak,
        avg_game_length=round(avg_length, 1),
        favorite_opening=_detect_favorite_opening(db, current_user.id),
        puzzles_solved=current_user.puzzles_solved,
        current_streak=current_user.win_streak,
        best_streak=current_user.best_streak,
        elo_history=elo_history,
    )


# ─── Openings Library ───

@router.get("/openings", response_model=list[OpeningResponse])
def list_openings(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Browse chess openings library (public endpoint)."""
    query = db.query(Opening)
    if category:
        query = query.filter(Opening.category == category)
    if search:
        query = query.filter(Opening.name.ilike(f"%{search}%"))

    openings = query.order_by(desc(Opening.popularity)).offset(skip).limit(limit).all()
    return openings


@router.get("/openings/{eco_code}", response_model=OpeningResponse)
def get_opening(eco_code: str, db: Session = Depends(get_db)):
    """Get opening by ECO code."""
    opening = db.query(Opening).filter(Opening.eco_code == eco_code).first()
    if not opening:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Opening not found")
    return opening


def _detect_favorite_opening(db: Session, user_id: str) -> Optional[str]:
    """Detect the most played opening for a user."""
    games = db.query(Game).filter(
        (Game.white_player_id == user_id) | (Game.black_player_id == user_id)
    ).all()
    if not games:
        return None
    # Count opening moves (first 4 chars of PGN)
    openings_count = {}
    for g in games:
        if g.pgn:
            first_moves = " ".join(g.pgn.split()[:6])  # First 3 moves
            openings_count[first_moves] = openings_count.get(first_moves, 0) + 1
    if not openings_count:
        return None
    return max(openings_count, key=openings_count.get)


# ─── Admin ───

@router.get("/admin/users", response_model=list[UserResponse])
def admin_list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    """Admin: list all users."""
    return db.query(User).offset(skip).limit(limit).all()
