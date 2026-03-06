"""
Achievements API — Track and display player achievements.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.models import User
from app.services import achievement_service

router = APIRouter(prefix="/api/achievements", tags=["Achievements"])


@router.get("/")
def get_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all achievements with progress for the current user."""
    return achievement_service.get_user_achievements(db, current_user.id)


@router.get("/summary")
def get_achievement_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get achievement summary (total XP, unlocked count, etc.)."""
    all_achs = achievement_service.get_user_achievements(db, current_user.id)
    unlocked = [a for a in all_achs if a["unlocked"]]
    total_xp = sum(a["xp"] for a in unlocked)
    
    return {
        "total_achievements": len(all_achs),
        "unlocked_count": len(unlocked),
        "total_xp": total_xp,
        "level": _xp_to_level(total_xp),
        "next_level_xp": _next_level_xp(total_xp),
        "recent_unlocks": sorted(unlocked, key=lambda a: a.get("unlocked_at", ""), reverse=True)[:5],
    }


@router.post("/check")
def check_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger achievement check. Returns newly unlocked achievements."""
    newly = achievement_service.check_and_award(db, current_user)
    return {"newly_unlocked": newly}


def _xp_to_level(xp: int) -> int:
    """Convert XP to level. Each level requires progressively more XP."""
    level = 1
    required = 100
    while xp >= required:
        xp -= required
        level += 1
        required = int(required * 1.3)
    return level


def _next_level_xp(xp: int) -> dict:
    """Get XP needed for next level."""
    level = 1
    required = 100
    total_for_level = 0
    while xp >= required:
        xp -= required
        total_for_level += required
        level += 1
        required = int(required * 1.3)
    return {"current_xp_in_level": xp, "required": required, "percent": round((xp / required) * 100)}
