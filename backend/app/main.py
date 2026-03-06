"""
ChessMaster API — Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.api import auth, games, puzzles, analysis, export, leaderboard, achievements, daily_review

settings = get_settings()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="""
    ♛ **ChessMaster API** — AI-Powered Chess Platform

    Features:
    - Play chess vs AI (5 difficulty levels) or local PvP
    - AI engine with minimax + alpha-beta pruning
    - Position analysis & move suggestions
    - 100+ chess puzzles with ELO scoring
    - Leaderboard & statistics
    - Export games as PGN, CSV, PDF
    - Openings library (ECO codes)
    - JWT authentication with role-based access

    Built with FastAPI, PostgreSQL, SQLAlchemy, python-chess.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(games.router)
app.include_router(puzzles.router)
app.include_router(analysis.router)
app.include_router(export.router)
app.include_router(leaderboard.router)
app.include_router(achievements.router)
app.include_router(daily_review.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
