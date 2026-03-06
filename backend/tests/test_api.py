"""
Tests for the ChessMaster API endpoints.
Demonstrates: API testing, integration testing, test fixtures.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    """Create fresh tables for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ─── Auth Tests ───

class TestAuth:
    def test_register_user(self):
        response = client.post("/api/auth/register", json={
            "username": "testplayer",
            "email": "test@chess.com",
            "password": "secret123",
            "full_name": "Test Player",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "testplayer"
        assert data["elo_rating"] == 1200
        assert data["role"] == "player"

    def test_register_duplicate_username(self):
        client.post("/api/auth/register", json={
            "username": "duplicate",
            "email": "dup1@chess.com",
            "password": "secret123",
        })
        response = client.post("/api/auth/register", json={
            "username": "duplicate",
            "email": "dup2@chess.com",
            "password": "secret123",
        })
        assert response.status_code == 400

    def test_login_success(self):
        client.post("/api/auth/register", json={
            "username": "logintest",
            "email": "login@chess.com",
            "password": "mypassword",
        })
        response = client.post("/api/auth/login", json={
            "username": "logintest",
            "password": "mypassword",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self):
        client.post("/api/auth/register", json={
            "username": "wrongpw",
            "email": "wrong@chess.com",
            "password": "correct",
        })
        response = client.post("/api/auth/login", json={
            "username": "wrongpw",
            "password": "incorrect",
        })
        assert response.status_code == 401

    def test_get_me_authenticated(self):
        client.post("/api/auth/register", json={
            "username": "metest",
            "email": "me@chess.com",
            "password": "password123",
        })
        login = client.post("/api/auth/login", json={
            "username": "metest",
            "password": "password123",
        })
        token = login.json()["access_token"]
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["username"] == "metest"

    def test_get_me_unauthenticated(self):
        response = client.get("/api/auth/me")
        assert response.status_code == 401


# ─── Helper ───

def create_and_login(username="player1"):
    """Helper to create a user and return their token."""
    client.post("/api/auth/register", json={
        "username": username,
        "email": f"{username}@chess.com",
        "password": "password123",
    })
    login = client.post("/api/auth/login", json={
        "username": username,
        "password": "password123",
    })
    return login.json()["access_token"]


# ─── Game Tests ───

class TestGames:
    def test_create_game_vs_ai(self):
        token = create_and_login("gameplayer1")
        response = client.post("/api/games/", json={
            "mode": "vs_ai",
            "ai_difficulty": "medium",
            "time_control": 600,
            "color_preference": "white",
        }, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 201
        data = response.json()
        assert data["mode"] == "vs_ai"
        assert data["status"] == "active"
        assert data["ai_difficulty"] == "medium"

    def test_create_game_pvp_local(self):
        token = create_and_login("gameplayer2")
        response = client.post("/api/games/", json={
            "mode": "pvp_local",
            "time_control": 300,
        }, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 201
        assert response.json()["mode"] == "pvp_local"

    def test_make_move(self):
        token = create_and_login("moveplayer")
        # Create game
        game = client.post("/api/games/", json={
            "mode": "vs_ai",
            "ai_difficulty": "beginner",
            "color_preference": "white",
        }, headers={"Authorization": f"Bearer {token}"}).json()

        # Make a move (e2 to e4)
        response = client.post(f"/api/games/{game['id']}/move", json={
            "from_square": "e2",
            "to_square": "e4",
        }, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["player_move"]["san"] == "e4"
        assert data["ai_move"] is not None  # AI should respond

    def test_list_games(self):
        token = create_and_login("listplayer")
        # Create a game
        client.post("/api/games/", json={
            "mode": "vs_ai",
            "ai_difficulty": "easy",
        }, headers={"Authorization": f"Bearer {token}"})

        response = client.get("/api/games/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_get_legal_moves(self):
        token = create_and_login("legalmoves")
        game = client.post("/api/games/", json={
            "mode": "pvp_local",
        }, headers={"Authorization": f"Bearer {token}"}).json()

        response = client.get(f"/api/games/{game['id']}/legal-moves",
                              headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert len(data["legal_moves"]) == 20  # 20 legal moves in starting position

    def test_resign_game(self):
        token = create_and_login("resignplayer")
        game = client.post("/api/games/", json={
            "mode": "vs_ai",
            "ai_difficulty": "easy",
        }, headers={"Authorization": f"Bearer {token}"}).json()

        response = client.post(f"/api/games/{game['id']}/resign",
                               headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200


# ─── Analysis Tests ───

class TestAnalysis:
    def test_evaluate_position(self):
        token = create_and_login("analyst")
        response = client.post("/api/analysis/evaluate", json={
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "depth": 2,
        }, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "evaluation" in data
        assert "best_move" in data

    def test_suggest_move(self):
        token = create_and_login("suggester")
        response = client.post("/api/analysis/suggest-move", json={
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "depth": 2,
        }, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert "explanation" in data


# ─── Health Check ───

class TestHealth:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "running"

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


# ─── Export Tests ───

class TestExport:
    def test_export_formats_list(self):
        response = client.get("/api/export/formats")
        assert response.status_code == 200
        data = response.json()
        assert len(data["formats"]) == 3

    def test_leaderboard_public(self):
        response = client.get("/api/leaderboard")
        assert response.status_code == 200
