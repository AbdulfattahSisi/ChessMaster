"""
Export API: Download game data as PGN, CSV, or PDF.
"""
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Game
from app.schemas.schemas import ExportRequest
from app.services import export_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.post("/pgn")
def export_pgn(
    data: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export games as PGN format."""
    games = _get_games_for_export(db, current_user, data.game_ids, data.date_from, data.date_to)
    if not games:
        raise HTTPException(status_code=404, detail="No games found")

    pgn_content = ""
    for game in games:
        pgn_content += export_service.export_game_pgn(db, game) + "\n\n"

    return Response(
        content=pgn_content,
        media_type="application/x-chess-pgn",
        headers={"Content-Disposition": f'attachment; filename="chessmaster_games_{datetime.utcnow().strftime("%Y%m%d")}.pgn"'}
    )


@router.post("/csv")
def export_csv(
    data: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export games as CSV format."""
    games = _get_games_for_export(db, current_user, data.game_ids, data.date_from, data.date_to)
    if not games:
        raise HTTPException(status_code=404, detail="No games found")

    csv_content = export_service.export_games_csv(db, games)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="chessmaster_games_{datetime.utcnow().strftime("%Y%m%d")}.csv"'}
    )


@router.post("/pdf")
def export_pdf(
    data: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export games as PDF report."""
    games = _get_games_for_export(db, current_user, data.game_ids, data.date_from, data.date_to)
    if not games:
        raise HTTPException(status_code=404, detail="No games found")

    pdf_bytes = export_service.export_games_pdf(db, games, current_user)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="chessmaster_report_{datetime.utcnow().strftime("%Y%m%d")}.pdf"'}
    )


@router.get("/formats")
def available_formats():
    """List available export formats."""
    return {
        "formats": [
            {"id": "pgn", "name": "PGN", "description": "Portable Game Notation - standard chess format", "mime": "application/x-chess-pgn"},
            {"id": "csv", "name": "CSV", "description": "Comma-separated values for spreadsheet import", "mime": "text/csv"},
            {"id": "pdf", "name": "PDF", "description": "Professional PDF report with game history", "mime": "application/pdf"},
        ]
    }


def _get_games_for_export(
    db: Session,
    user: User,
    game_ids: Optional[List[str]],
    date_from: Optional[datetime],
    date_to: Optional[datetime],
) -> List[Game]:
    """Helper to fetch games for export."""
    query = db.query(Game).filter(
        (Game.white_player_id == user.id) | (Game.black_player_id == user.id)
    )
    if game_ids:
        query = query.filter(Game.id.in_(game_ids))
    if date_from:
        query = query.filter(Game.created_at >= date_from)
    if date_to:
        query = query.filter(Game.created_at <= date_to)

    return query.order_by(Game.created_at.desc()).limit(500).all()
