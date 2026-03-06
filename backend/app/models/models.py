import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text,
    ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base
import enum


# ──────────────────── Enums ────────────────────

class UserRole(str, enum.Enum):
    PLAYER = "player"
    MODERATOR = "moderator"
    ADMIN = "admin"


class GameStatus(str, enum.Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class GameResult(str, enum.Enum):
    WHITE_WIN = "white_win"
    BLACK_WIN = "black_win"
    DRAW = "draw"
    STALEMATE = "stalemate"
    RESIGNATION = "resignation"
    TIMEOUT = "timeout"


class GameMode(str, enum.Enum):
    PVP_LOCAL = "pvp_local"
    PVP_ONLINE = "pvp_online"
    VS_AI = "vs_ai"
    PUZZLE = "puzzle"


class AIDifficulty(str, enum.Enum):
    BEGINNER = "beginner"       # depth 1
    EASY = "easy"               # depth 2
    MEDIUM = "medium"           # depth 3
    HARD = "hard"               # depth 4
    EXPERT = "expert"           # depth 5


# ──────────────────── Models ────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    avatar_url = Column(String(500))
    role = Column(SAEnum(UserRole), default=UserRole.PLAYER, nullable=False)

    # ELO Ratings
    elo_rating = Column(Integer, default=1200, nullable=False)
    elo_peak = Column(Integer, default=1200)
    games_played = Column(Integer, default=0)
    games_won = Column(Integer, default=0)
    games_lost = Column(Integer, default=0)
    games_drawn = Column(Integer, default=0)
    puzzles_solved = Column(Integer, default=0)
    win_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)
    analysis_count = Column(Integer, default=0)
    checkmate_wins = Column(Integer, default=0)
    daily_challenges_completed = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    white_games = relationship("Game", foreign_keys="Game.white_player_id", back_populates="white_player")
    black_games = relationship("Game", foreign_keys="Game.black_player_id", back_populates="black_player")


class Game(Base):
    __tablename__ = "games"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    white_player_id = Column(String, ForeignKey("users.id"), nullable=True)
    black_player_id = Column(String, ForeignKey("users.id"), nullable=True)

    mode = Column(SAEnum(GameMode), nullable=False)
    status = Column(SAEnum(GameStatus), default=GameStatus.WAITING, nullable=False)
    result = Column(SAEnum(GameResult), nullable=True)
    ai_difficulty = Column(SAEnum(AIDifficulty), nullable=True)

    # Board state (FEN notation)
    initial_fen = Column(String(100), default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    current_fen = Column(String(100))

    # PGN moves history
    pgn = Column(Text, default="")
    moves_count = Column(Integer, default=0)

    # Time control (seconds)
    time_control = Column(Integer, default=600)  # 10 min default
    white_time_remaining = Column(Float)
    black_time_remaining = Column(Float)

    # AI analysis
    ai_analysis = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    white_player = relationship("User", foreign_keys=[white_player_id], back_populates="white_games")
    black_player = relationship("User", foreign_keys=[black_player_id], back_populates="black_games")
    moves = relationship("Move", back_populates="game", cascade="all, delete-orphan", order_by="Move.move_number")


class Move(Base):
    __tablename__ = "moves"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    move_number = Column(Integer, nullable=False)
    player_color = Column(String(5), nullable=False)  # "white" or "black"

    # Move details
    from_square = Column(String(2), nullable=False)   # e.g. "e2"
    to_square = Column(String(2), nullable=False)      # e.g. "e4"
    piece = Column(String(1), nullable=False)           # P, N, B, R, Q, K
    captured_piece = Column(String(1), nullable=True)
    promotion = Column(String(1), nullable=True)
    san = Column(String(10), nullable=False)            # Standard Algebraic Notation e.g. "e4"
    uci = Column(String(5), nullable=False)             # UCI notation e.g. "e2e4"
    fen_after = Column(String(100), nullable=False)

    is_check = Column(Boolean, default=False)
    is_checkmate = Column(Boolean, default=False)
    is_castle = Column(Boolean, default=False)

    # AI evaluation
    evaluation = Column(Float, nullable=True)  # centipawns

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    game = relationship("Game", back_populates="moves")


class Puzzle(Base):
    __tablename__ = "puzzles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)  # "checkmate", "fork", "pin", "skewer", etc.
    difficulty = Column(Integer, nullable=False)     # 1-5 stars

    fen = Column(String(100), nullable=False)       # Starting position
    solution_moves = Column(JSON, nullable=False)    # List of UCI moves ["e2e4", "d7d5", ...]
    hints = Column(JSON, nullable=True)              # List of hint strings

    elo_rating = Column(Integer, default=1200)
    times_attempted = Column(Integer, default=0)
    times_solved = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)


class PuzzleAttempt(Base):
    __tablename__ = "puzzle_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    puzzle_id = Column(String, ForeignKey("puzzles.id"), nullable=False)
    solved = Column(Boolean, nullable=False)
    moves_made = Column(JSON)
    time_taken = Column(Float)  # seconds
    created_at = Column(DateTime, default=datetime.utcnow)


class Opening(Base):
    __tablename__ = "openings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    eco_code = Column(String(5), nullable=False, index=True)   # e.g. "B20"
    name = Column(String(200), nullable=False)
    pgn = Column(Text, nullable=False)
    fen = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # "Open", "Semi-Open", "Closed", "Indian", "Flank"
    popularity = Column(Integer, default=0)
    win_rate_white = Column(Float)
    win_rate_black = Column(Float)
    draw_rate = Column(Float)


# ──────────────────── Achievements ────────────────────

class AchievementType(str, enum.Enum):
    FIRST_WIN = "first_win"
    WIN_STREAK_3 = "win_streak_3"
    WIN_STREAK_5 = "win_streak_5"
    WIN_STREAK_10 = "win_streak_10"
    GAMES_10 = "games_10"
    GAMES_50 = "games_50"
    GAMES_100 = "games_100"
    ELO_1300 = "elo_1300"
    ELO_1500 = "elo_1500"
    ELO_1800 = "elo_1800"
    ELO_2000 = "elo_2000"
    PUZZLE_MASTER = "puzzle_master"       # Solve 25 puzzles
    PUZZLE_LEGEND = "puzzle_legend"       # Solve 100 puzzles
    CHECKMATE_ARTIST = "checkmate_artist" # Win by checkmate 10 times
    SPEED_DEMON = "speed_demon"           # Win game under 20 moves
    UNDERDOG = "underdog"                 # Beat higher-rated AI
    OPENING_SCHOLAR = "opening_scholar"   # Play 10 different openings
    DAILY_WARRIOR = "daily_warrior"       # Complete 7 daily challenges
    ANALYST = "analyst"                   # Use analysis 10 times
    ENDGAME_MASTER = "endgame_master"     # Win 5 endgames


ACHIEVEMENT_META = {
    AchievementType.FIRST_WIN: {"title": "First Blood", "desc": "Win your first game", "icon": "⚔️", "xp": 50},
    AchievementType.WIN_STREAK_3: {"title": "Hat Trick", "desc": "Win 3 games in a row", "icon": "🔥", "xp": 100},
    AchievementType.WIN_STREAK_5: {"title": "On Fire", "desc": "Win 5 games in a row", "icon": "🔥", "xp": 200},
    AchievementType.WIN_STREAK_10: {"title": "Unstoppable", "desc": "Win 10 games in a row", "icon": "💎", "xp": 500},
    AchievementType.GAMES_10: {"title": "Getting Started", "desc": "Play 10 games", "icon": "🎮", "xp": 50},
    AchievementType.GAMES_50: {"title": "Dedicated Player", "desc": "Play 50 games", "icon": "🏅", "xp": 200},
    AchievementType.GAMES_100: {"title": "Chess Addict", "desc": "Play 100 games", "icon": "👑", "xp": 500},
    AchievementType.ELO_1300: {"title": "Rising Star", "desc": "Reach 1300 ELO", "icon": "⭐", "xp": 100},
    AchievementType.ELO_1500: {"title": "Strong Player", "desc": "Reach 1500 ELO", "icon": "🌟", "xp": 200},
    AchievementType.ELO_1800: {"title": "Expert", "desc": "Reach 1800 ELO", "icon": "💫", "xp": 400},
    AchievementType.ELO_2000: {"title": "Master", "desc": "Reach 2000 ELO", "icon": "🏆", "xp": 800},
    AchievementType.PUZZLE_MASTER: {"title": "Puzzle Master", "desc": "Solve 25 puzzles", "icon": "🧩", "xp": 150},
    AchievementType.PUZZLE_LEGEND: {"title": "Puzzle Legend", "desc": "Solve 100 puzzles", "icon": "🧠", "xp": 500},
    AchievementType.CHECKMATE_ARTIST: {"title": "Checkmate Artist", "desc": "Win by checkmate 10 times", "icon": "🎨", "xp": 200},
    AchievementType.SPEED_DEMON: {"title": "Speed Demon", "desc": "Win a game in under 20 moves", "icon": "⚡", "xp": 150},
    AchievementType.UNDERDOG: {"title": "Underdog Victory", "desc": "Beat a higher difficulty AI", "icon": "🐺", "xp": 200},
    AchievementType.OPENING_SCHOLAR: {"title": "Opening Scholar", "desc": "Play 10 different openings", "icon": "📚", "xp": 150},
    AchievementType.DAILY_WARRIOR: {"title": "Daily Warrior", "desc": "Complete 7 daily challenges", "icon": "📅", "xp": 300},
    AchievementType.ANALYST: {"title": "Deep Thinker", "desc": "Use the analysis tool 10 times", "icon": "🔬", "xp": 100},
    AchievementType.ENDGAME_MASTER: {"title": "Endgame Master", "desc": "Win 5 endgames", "icon": "♚", "xp": 250},
}


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    achievement_type = Column(SAEnum(AchievementType), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="achievements")


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(String(10), nullable=False, unique=True, index=True)  # "2026-03-04"
    puzzle_id = Column(String, ForeignKey("puzzles.id"), nullable=False)
    bonus_xp = Column(Integer, default=50)

    puzzle = relationship("Puzzle")


class DailyChallengeAttempt(Base):
    __tablename__ = "daily_challenge_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(String, ForeignKey("daily_challenges.id"), nullable=False)
    solved = Column(Boolean, default=False)
    time_taken = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="daily_attempts")
    challenge = relationship("DailyChallenge")
