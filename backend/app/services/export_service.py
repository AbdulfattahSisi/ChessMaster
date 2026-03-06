"""
Export Service: Generate PGN, CSV, and PDF exports.
Demonstrates: file generation, reporting, data transformation.
"""
import csv
import io
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
)
from app.models.models import Game, Move, User, GameResult


def export_game_pgn(db: Session, game: Game) -> str:
    """Export a single game as PGN string."""
    white = db.query(User).filter(User.id == game.white_player_id).first()
    black = db.query(User).filter(User.id == game.black_player_id).first()

    result_map = {
        GameResult.WHITE_WIN: "1-0",
        GameResult.BLACK_WIN: "0-1",
        GameResult.DRAW: "1/2-1/2",
        GameResult.STALEMATE: "1/2-1/2",
        GameResult.RESIGNATION: "1-0" if game.result == GameResult.WHITE_WIN else "0-1",
        GameResult.TIMEOUT: "1-0" if game.result == GameResult.WHITE_WIN else "0-1",
    }

    pgn = f'[Event "ChessMaster Game"]\n'
    pgn += f'[Site "ChessMaster App"]\n'
    pgn += f'[Date "{game.created_at.strftime("%Y.%m.%d")}"]\n'
    pgn += f'[White "{white.username if white else "AI"}"]\n'
    pgn += f'[Black "{black.username if black else "AI"}"]\n'
    pgn += f'[Result "{result_map.get(game.result, "*")}"]\n'
    pgn += f'[WhiteElo "{white.elo_rating if white else "?"}"]\n'
    pgn += f'[BlackElo "{black.elo_rating if black else "?"}"]\n'
    pgn += f'[TimeControl "{game.time_control}"]\n'
    pgn += f'[Mode "{game.mode.value}"]\n'
    pgn += f"\n{game.pgn}{result_map.get(game.result, '*')}\n"

    return pgn


def export_games_csv(db: Session, games: List[Game]) -> str:
    """Export multiple games as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Game ID", "Date", "White", "Black", "Mode", "Result",
        "Moves", "White ELO", "Black ELO", "Time Control", "Duration"
    ])

    for game in games:
        white = db.query(User).filter(User.id == game.white_player_id).first()
        black = db.query(User).filter(User.id == game.black_player_id).first()

        duration = ""
        if game.completed_at and game.created_at:
            delta = game.completed_at - game.created_at
            minutes = int(delta.total_seconds() / 60)
            duration = f"{minutes}m"

        result_str = game.result.value if game.result else "ongoing"

        writer.writerow([
            game.id[:8],
            game.created_at.strftime("%Y-%m-%d %H:%M"),
            white.username if white else "AI",
            black.username if black else "AI",
            game.mode.value,
            result_str,
            game.moves_count,
            white.elo_rating if white else "-",
            black.elo_rating if black else "-",
            f"{game.time_control}s",
            duration,
        ])

    return output.getvalue()


def export_games_pdf(db: Session, games: List[Game], user: User) -> bytes:
    """Export game history as a professional PDF report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Heading1'],
        fontSize=24, spaceAfter=20, textColor=colors.HexColor("#1a1a2e"),
        alignment=1,
    )
    subtitle_style = ParagraphStyle(
        'CustomSubtitle', parent=styles['Heading2'],
        fontSize=14, spaceAfter=10, textColor=colors.HexColor("#16213e"),
        alignment=1,
    )
    body_style = styles['Normal']

    elements = []

    # Title
    elements.append(Paragraph("♛ ChessMaster", title_style))
    elements.append(Paragraph("Game History Report", subtitle_style))
    elements.append(Spacer(1, 10))

    # Player info
    elements.append(Paragraph(f"<b>Player:</b> {user.username}", body_style))
    elements.append(Paragraph(f"<b>ELO Rating:</b> {user.elo_rating} (Peak: {user.elo_peak})", body_style))
    elements.append(Paragraph(f"<b>Record:</b> {user.games_won}W / {user.games_lost}L / {user.games_drawn}D", body_style))
    elements.append(Paragraph(f"<b>Report Date:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", body_style))
    elements.append(Spacer(1, 20))

    # Games table
    table_data = [["#", "Date", "Opponent", "Color", "Result", "Moves", "Mode"]]

    for i, game in enumerate(games, 1):
        white = db.query(User).filter(User.id == game.white_player_id).first()
        black = db.query(User).filter(User.id == game.black_player_id).first()

        if game.white_player_id == user.id:
            opponent = black.username if black else "AI"
            color = "White"
        else:
            opponent = white.username if white else "AI"
            color = "Black"

        result_map = {
            GameResult.WHITE_WIN: "Win" if color == "White" else "Loss",
            GameResult.BLACK_WIN: "Win" if color == "Black" else "Loss",
            GameResult.DRAW: "Draw",
            GameResult.STALEMATE: "Draw",
            GameResult.RESIGNATION: "Win" if (
                (game.result == GameResult.WHITE_WIN and color == "White") or
                (game.result == GameResult.BLACK_WIN and color == "Black")
            ) else "Loss",
        }

        table_data.append([
            str(i),
            game.created_at.strftime("%m/%d/%y"),
            opponent,
            color,
            result_map.get(game.result, "?"),
            str(game.moves_count),
            game.mode.value,
        ])

    if len(table_data) > 1:
        table = Table(table_data, colWidths=[30, 70, 100, 50, 50, 50, 80])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f5f5f5")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f0f0")]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ]))
        elements.append(table)

    elements.append(Spacer(1, 20))
    elements.append(Paragraph(
        f"<i>Generated by ChessMaster • Total games: {len(games)}</i>",
        ParagraphStyle('Footer', parent=body_style, alignment=1, textColor=colors.grey)
    ))

    doc.build(elements)
    return buffer.getvalue()
