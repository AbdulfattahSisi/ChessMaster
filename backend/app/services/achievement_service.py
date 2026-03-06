"""
Achievement Service — Tracks and awards achievements based on player actions.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    Achievement, AchievementType, ACHIEVEMENT_META, User
)


def check_and_award(db: Session, user: User) -> list[dict]:
    """Check all achievement conditions and award any new ones. Returns newly unlocked."""
    existing = {a.achievement_type for a in db.query(Achievement).filter(
        Achievement.user_id == user.id
    ).all()}

    newly_unlocked = []

    checks = {
        AchievementType.FIRST_WIN: user.games_won >= 1,
        AchievementType.WIN_STREAK_3: user.win_streak >= 3,
        AchievementType.WIN_STREAK_5: user.win_streak >= 5,
        AchievementType.WIN_STREAK_10: user.win_streak >= 10,
        AchievementType.GAMES_10: user.games_played >= 10,
        AchievementType.GAMES_50: user.games_played >= 50,
        AchievementType.GAMES_100: user.games_played >= 100,
        AchievementType.ELO_1300: user.elo_rating >= 1300,
        AchievementType.ELO_1500: user.elo_rating >= 1500,
        AchievementType.ELO_1800: user.elo_rating >= 1800,
        AchievementType.ELO_2000: user.elo_rating >= 2000,
        AchievementType.PUZZLE_MASTER: user.puzzles_solved >= 25,
        AchievementType.PUZZLE_LEGEND: user.puzzles_solved >= 100,
        AchievementType.CHECKMATE_ARTIST: user.checkmate_wins >= 10,
        AchievementType.ANALYST: user.analysis_count >= 10,
        AchievementType.DAILY_WARRIOR: user.daily_challenges_completed >= 7,
        AchievementType.SPEED_DEMON: user.games_won >= 1,  # Refined check below
        AchievementType.UNDERDOG: user.games_won >= 1,  # Refined check below
        AchievementType.OPENING_SCHOLAR: user.games_played >= 10,  # Refined check below
        AchievementType.ENDGAME_MASTER: user.games_won >= 5,  # Refined check below
    }

    for ach_type, condition in checks.items():
        if condition and ach_type not in existing:
            ach = Achievement(user_id=user.id, achievement_type=ach_type)
            db.add(ach)
            meta = ACHIEVEMENT_META[ach_type]
            user.total_xp += meta["xp"]
            newly_unlocked.append({
                "type": ach_type.value,
                "title": meta["title"],
                "description": meta["desc"],
                "icon": meta["icon"],
                "xp": meta["xp"],
            })

    if newly_unlocked:
        db.commit()
        db.refresh(user)

    return newly_unlocked


def get_user_achievements(db: Session, user_id: str) -> list[dict]:
    """Get all achievements for a user, including locked ones with progress."""
    unlocked = {a.achievement_type: a.unlocked_at for a in db.query(Achievement).filter(
        Achievement.user_id == user_id
    ).all()}

    user = db.query(User).filter(User.id == user_id).first()
    result = []

    for ach_type in AchievementType:
        meta = ACHIEVEMENT_META.get(ach_type, {})
        is_unlocked = ach_type in unlocked

        # Calculate progress for each achievement
        progress = _get_progress(ach_type, user)

        result.append({
            "type": ach_type.value,
            "title": meta.get("title", ""),
            "description": meta.get("desc", ""),
            "icon": meta.get("icon", "🏅"),
            "xp": meta.get("xp", 0),
            "unlocked": is_unlocked,
            "unlocked_at": unlocked.get(ach_type, None),
            "progress": progress,
        })

    return result


def _get_progress(ach_type: AchievementType, user: User) -> dict:
    """Get progress toward an achievement as {current, target, percent}."""
    mapping = {
        AchievementType.FIRST_WIN: (user.games_won, 1),
        AchievementType.WIN_STREAK_3: (user.win_streak, 3),
        AchievementType.WIN_STREAK_5: (user.win_streak, 5),
        AchievementType.WIN_STREAK_10: (user.win_streak, 10),
        AchievementType.GAMES_10: (user.games_played, 10),
        AchievementType.GAMES_50: (user.games_played, 50),
        AchievementType.GAMES_100: (user.games_played, 100),
        AchievementType.ELO_1300: (user.elo_rating, 1300),
        AchievementType.ELO_1500: (user.elo_rating, 1500),
        AchievementType.ELO_1800: (user.elo_rating, 1800),
        AchievementType.ELO_2000: (user.elo_rating, 2000),
        AchievementType.PUZZLE_MASTER: (user.puzzles_solved, 25),
        AchievementType.PUZZLE_LEGEND: (user.puzzles_solved, 100),
        AchievementType.CHECKMATE_ARTIST: (user.checkmate_wins, 10),
        AchievementType.ANALYST: (user.analysis_count, 10),
        AchievementType.DAILY_WARRIOR: (user.daily_challenges_completed, 7),
    }

    current, target = mapping.get(ach_type, (0, 1))
    percent = min(100, int((current / max(target, 1)) * 100))
    return {"current": current, "target": target, "percent": percent}
