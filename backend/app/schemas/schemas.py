from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import (
    UserRole, GameStatus, GameResult, GameMode, AIDifficulty
)


# ──────────────────── Auth ────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str
    role: UserRole


# ──────────────────── User ────────────────────

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: UserRole
    elo_rating: int
    elo_peak: int
    games_played: int
    games_won: int
    games_lost: int
    games_drawn: int
    puzzles_solved: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    elo_rating: int
    games_played: int
    games_won: int
    win_rate: float


# ──────────────────── Game ────────────────────

class GameCreate(BaseModel):
    mode: GameMode
    ai_difficulty: Optional[AIDifficulty] = None
    time_control: int = 600  # seconds
    color_preference: Optional[str] = "white"  # "white", "black", "random"


class GameResponse(BaseModel):
    id: str
    white_player_id: Optional[str]
    black_player_id: Optional[str]
    mode: GameMode
    status: GameStatus
    result: Optional[GameResult]
    ai_difficulty: Optional[AIDifficulty]
    current_fen: Optional[str]
    pgn: str
    moves_count: int
    time_control: int
    white_time_remaining: Optional[float]
    black_time_remaining: Optional[float]
    ai_analysis: Optional[Any]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class GameListResponse(BaseModel):
    games: List[GameResponse]
    total: int
    page: int
    page_size: int


# ──────────────────── Move ────────────────────

class MoveCreate(BaseModel):
    from_square: str = Field(..., pattern=r'^[a-h][1-8]$')
    to_square: str = Field(..., pattern=r'^[a-h][1-8]$')
    promotion: Optional[str] = None  # "q", "r", "b", "n"


class MoveResponse(BaseModel):
    id: str
    game_id: str
    move_number: int
    player_color: str
    from_square: str
    to_square: str
    piece: str
    captured_piece: Optional[str]
    promotion: Optional[str]
    san: str
    uci: str
    fen_after: str
    is_check: bool
    is_checkmate: bool
    is_castle: bool
    evaluation: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class MoveResult(BaseModel):
    """Full response after making a move, including AI response if applicable."""
    player_move: MoveResponse
    ai_move: Optional[MoveResponse] = None
    game_status: GameStatus
    game_result: Optional[GameResult] = None
    legal_moves: List[str]  # UCI format list of legal moves
    evaluation: Optional[float] = None


# ──────────────────── Puzzle ────────────────────

class PuzzleResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: str
    difficulty: int
    fen: str
    elo_rating: int
    times_attempted: int
    times_solved: int
    success_rate: Optional[float] = None

    class Config:
        from_attributes = True


class PuzzleAttemptCreate(BaseModel):
    moves_made: List[str]  # UCI moves
    time_taken: float


class PuzzleAttemptResponse(BaseModel):
    solved: bool
    correct_solution: List[str]
    user_moves: List[str]
    elo_change: Optional[int] = None


# ──────────────────── Opening ────────────────────

class OpeningResponse(BaseModel):
    id: str
    eco_code: str
    name: str
    pgn: str
    fen: str
    description: Optional[str]
    category: Optional[str]
    popularity: int
    win_rate_white: Optional[float]
    win_rate_black: Optional[float]
    draw_rate: Optional[float]

    class Config:
        from_attributes = True


# ──────────────────── AI Analysis ────────────────────

class AnalysisRequest(BaseModel):
    fen: str
    depth: int = 4


class AnalysisResponse(BaseModel):
    fen: str
    evaluation: float
    best_move: str
    best_line: List[str]
    depth: int
    is_checkmate: bool
    mate_in: Optional[int] = None


# ──────────────────── Export ────────────────────

class ExportRequest(BaseModel):
    game_ids: Optional[List[str]] = None
    format: str = "pgn"  # "pgn", "csv", "pdf"
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


# ──────────────────── Stats ────────────────────

class UserStats(BaseModel):
    total_games: int
    wins: int
    losses: int
    draws: int
    win_rate: float
    current_elo: int
    peak_elo: int
    avg_game_length: float
    favorite_opening: Optional[str]
    puzzles_solved: int
    current_streak: int
    best_streak: int
    elo_history: List[dict]


# ──────────────────── Achievements ────────────────────

class AchievementResponse(BaseModel):
    type: str
    title: str
    description: str
    icon: str
    xp: int
    unlocked: bool
    unlocked_at: Optional[datetime] = None
    progress: dict  # {current, target, percent}


class AchievementSummary(BaseModel):
    total_achievements: int
    unlocked_count: int
    total_xp: int
    level: int
    next_level_xp: dict
    recent_unlocks: List[dict]


# ──────────────────── Daily Challenge ────────────────────

class DailyChallengeResponse(BaseModel):
    challenge_id: str
    date: str
    bonus_xp: int
    already_attempted: bool
    solved: bool
    puzzle: Optional[dict]


# ──────────────────── Game Review ────────────────────

class MoveAnnotation(BaseModel):
    move_number: int
    color: str
    san: str
    uci: str
    classification: str  # brilliant, great, good, inaccuracy, mistake, blunder
    eval_before: float
    eval_after: float
    eval_loss: float
    symbol: str


class GameReviewResponse(BaseModel):
    annotations: List[MoveAnnotation]
    summary: dict
