"""
Puzzles API: Browse, attempt, and score chess puzzles.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import PuzzleResponse, PuzzleAttemptCreate, PuzzleAttemptResponse
from app.services import puzzle_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/puzzles", tags=["Puzzles"])


@router.get("/categories")
def get_categories():
    """Get all puzzle categories."""
    return puzzle_service.get_puzzle_categories()


@router.get("/", response_model=list[PuzzleResponse])
def list_puzzles(
    category: Optional[str] = None,
    difficulty: Optional[int] = Query(None, ge=1, le=5),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List puzzles with optional filters."""
    puzzles, total = puzzle_service.get_puzzles(db, category, difficulty, skip, limit)
    for p in puzzles:
        if p.times_attempted > 0:
            p.success_rate = round(p.times_solved / p.times_attempted * 100, 1)
    return puzzles


@router.get("/random", response_model=PuzzleResponse)
def random_puzzle(
    difficulty: Optional[int] = Query(None, ge=1, le=5),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a random puzzle."""
    puzzle = puzzle_service.get_random_puzzle(db, difficulty)
    if not puzzle:
        raise HTTPException(status_code=404, detail="No puzzles found")
    return puzzle


@router.get("/{puzzle_id}", response_model=PuzzleResponse)
def get_puzzle(puzzle_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific puzzle."""
    puzzle = puzzle_service.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    return puzzle


@router.post("/{puzzle_id}/attempt", response_model=PuzzleAttemptResponse)
def attempt_puzzle(
    puzzle_id: str,
    data: PuzzleAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a puzzle attempt."""
    puzzle = puzzle_service.get_puzzle_by_id(db, puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    solved, elo_change = puzzle_service.attempt_puzzle(
        db, current_user, puzzle, data.moves_made, data.time_taken
    )

    return PuzzleAttemptResponse(
        solved=solved,
        correct_solution=puzzle.solution_moves,
        user_moves=data.moves_made,
        elo_change=elo_change,
    )
