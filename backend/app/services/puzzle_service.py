"""
Puzzle Service: Manages chess puzzles, attempts, and scoring.
"""
import chess
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.models import Puzzle, PuzzleAttempt, User


def get_puzzle_by_id(db: Session, puzzle_id: str) -> Optional[Puzzle]:
    return db.query(Puzzle).filter(Puzzle.id == puzzle_id).first()


def get_puzzles(
    db: Session,
    category: Optional[str] = None,
    difficulty: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[Puzzle], int]:
    """Get puzzles with optional filtering."""
    query = db.query(Puzzle)
    if category:
        query = query.filter(Puzzle.category == category)
    if difficulty:
        query = query.filter(Puzzle.difficulty == difficulty)

    total = query.count()
    puzzles = query.order_by(Puzzle.elo_rating).offset(skip).limit(limit).all()
    return puzzles, total


def get_random_puzzle(db: Session, difficulty: Optional[int] = None) -> Optional[Puzzle]:
    """Get a random puzzle, optionally filtered by difficulty."""
    from sqlalchemy.sql.expression import func
    query = db.query(Puzzle)
    if difficulty:
        query = query.filter(Puzzle.difficulty == difficulty)
    return query.order_by(func.random()).first()


def attempt_puzzle(
    db: Session,
    user: User,
    puzzle: Puzzle,
    moves_made: List[str],
    time_taken: float,
) -> Tuple[bool, Optional[int]]:
    """
    Check a puzzle attempt. Returns (solved, elo_change).
    """
    # Check if moves match solution
    solution = puzzle.solution_moves
    solved = moves_made == solution

    # Record the attempt
    attempt = PuzzleAttempt(
        user_id=user.id,
        puzzle_id=puzzle.id,
        solved=solved,
        moves_made=moves_made,
        time_taken=time_taken,
    )
    db.add(attempt)

    # Update puzzle stats
    puzzle.times_attempted += 1
    if solved:
        puzzle.times_solved += 1

    # ELO change for puzzle rating
    elo_change = 0
    if solved:
        K = 16
        expected = 1 / (1 + 10 ** ((puzzle.elo_rating - user.elo_rating) / 400))
        elo_change = int(K * (1 - expected))
        user.elo_rating += elo_change
        user.elo_peak = max(user.elo_peak, user.elo_rating)
        user.puzzles_solved += 1

        # Adjust puzzle ELO
        puzzle.elo_rating = max(800, puzzle.elo_rating - elo_change // 2)
    else:
        K = 16
        expected = 1 / (1 + 10 ** ((puzzle.elo_rating - user.elo_rating) / 400))
        elo_change = -int(K * expected)
        user.elo_rating = max(100, user.elo_rating + elo_change)

        puzzle.elo_rating += abs(elo_change) // 2

    db.commit()
    return solved, elo_change


def get_puzzle_categories(db: Session = None) -> List[dict]:
    """Return list of all puzzle categories with real counts."""
    categories = [
        {"id": "checkmate_1", "name": "Mate in 1", "icon": "\u265b"},
        {"id": "checkmate_2", "name": "Mate in 2", "icon": "\u265b"},
        {"id": "checkmate_3", "name": "Mate in 3", "icon": "\u265b"},
        {"id": "fork", "name": "Fork", "icon": "\u265e"},
        {"id": "pin", "name": "Pin", "icon": "\u265d"},
        {"id": "skewer", "name": "Skewer", "icon": "\u265c"},
        {"id": "discovered_attack", "name": "Discovered Attack", "icon": "\u26a1"},
        {"id": "double_check", "name": "Double Check", "icon": "\u2726"},
        {"id": "deflection", "name": "Deflection", "icon": "\u2197"},
        {"id": "decoy", "name": "Decoy", "icon": "\U0001f3af"},
        {"id": "sacrifice", "name": "Sacrifice", "icon": "\U0001f48e"},
        {"id": "endgame", "name": "Endgame", "icon": "\u2654"},
        {"id": "opening_trap", "name": "Opening Trap", "icon": "\U0001faa4"},
        {"id": "promotion", "name": "Promotion", "icon": "\u2659"},
        {"id": "zugzwang", "name": "Zugzwang", "icon": "\u23f3"},
    ]
    for cat in categories:
        if db:
            cat["count"] = db.query(Puzzle).filter(Puzzle.category == cat["id"]).count()
        else:
            cat["count"] = 0
    return categories