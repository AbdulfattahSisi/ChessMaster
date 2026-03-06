"""
Daily Challenge & Game Review API.
"""
from datetime import date, datetime
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.models import (
    User, DailyChallenge, DailyChallengeAttempt, Puzzle, Move
)
from app.services.review_service import review_game
from app.services import achievement_service


class DailyChallengeAttemptRequest(BaseModel):
    moves: List[str]
    time_taken: float = 0

router = APIRouter(prefix="/api", tags=["Daily & Review"])


# ──────────────────── Daily Challenge ────────────────────

@router.get("/daily-challenge")
def get_daily_challenge(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get today's daily challenge puzzle."""
    today = date.today().isoformat()
    
    challenge = db.query(DailyChallenge).filter(DailyChallenge.date == today).first()
    
    if not challenge:
        # Auto-generate: pick a random puzzle as today's challenge
        import random
        puzzles = db.query(Puzzle).all()
        if not puzzles:
            raise HTTPException(404, "No puzzles available")
        chosen = random.choice(puzzles)
        challenge = DailyChallenge(
            date=today,
            puzzle_id=chosen.id,
            bonus_xp=50,
        )
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
    
    # Check if user already attempted
    attempt = db.query(DailyChallengeAttempt).filter(
        DailyChallengeAttempt.challenge_id == challenge.id,
        DailyChallengeAttempt.user_id == current_user.id,
    ).first()
    
    puzzle = db.query(Puzzle).filter(Puzzle.id == challenge.puzzle_id).first()
    
    return {
        "challenge_id": challenge.id,
        "date": challenge.date,
        "bonus_xp": challenge.bonus_xp,
        "already_attempted": attempt is not None,
        "solved": attempt.solved if attempt else False,
        "puzzle": {
            "id": puzzle.id,
            "title": puzzle.title,
            "description": puzzle.description,
            "category": puzzle.category,
            "difficulty": puzzle.difficulty,
            "fen": puzzle.fen,
            "elo_rating": puzzle.elo_rating,
        } if puzzle else None,
    }


@router.post("/daily-challenge/{challenge_id}/attempt")
def attempt_daily_challenge(
    challenge_id: str,
    data: DailyChallengeAttemptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit an attempt for today's daily challenge."""
    challenge = db.query(DailyChallenge).filter(DailyChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    
    # Check not already attempted
    existing = db.query(DailyChallengeAttempt).filter(
        DailyChallengeAttempt.challenge_id == challenge_id,
        DailyChallengeAttempt.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(400, "Already attempted today's challenge")
    
    puzzle = db.query(Puzzle).filter(Puzzle.id == challenge.puzzle_id).first()
    solved = data.moves == puzzle.solution_moves
    
    attempt = DailyChallengeAttempt(
        user_id=current_user.id,
        challenge_id=challenge_id,
        solved=solved,
        time_taken=data.time_taken,
    )
    db.add(attempt)
    
    xp_earned = 0
    if solved:
        current_user.daily_challenges_completed += 1
        xp_earned = challenge.bonus_xp
        current_user.total_xp += xp_earned
    
    db.commit()
    
    # Check achievements
    new_achievements = achievement_service.check_and_award(db, current_user)
    
    return {
        "solved": solved,
        "correct_solution": puzzle.solution_moves,
        "xp_earned": xp_earned,
        "new_achievements": new_achievements,
    }


# ──────────────────── Game Review ────────────────────

@router.get("/games/{game_id}/review")
def get_game_review(
    game_id: str,
    depth: int = 3,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze a completed game and classify each move.
    Returns annotations (brilliant, great, good, inaccuracy, mistake, blunder).
    """
    moves = db.query(Move).filter(Move.game_id == game_id).order_by(Move.move_number).all()
    
    if not moves:
        raise HTTPException(404, "No moves found for this game")
    
    moves_data = [{"uci": m.uci, "san": m.san} for m in moves]
    
    review = review_game(moves_data, depth=min(depth, 4))
    
    return review


@router.get("/games/{game_id}/review/summary")
def get_review_summary(
    game_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quick summary of game quality without full move analysis."""
    moves = db.query(Move).filter(Move.game_id == game_id).order_by(Move.move_number).all()
    
    if not moves:
        raise HTTPException(404, "No moves found")
    
    moves_data = [{"uci": m.uci, "san": m.san} for m in moves]
    review = review_game(moves_data, depth=2)
    
    return review["summary"]
