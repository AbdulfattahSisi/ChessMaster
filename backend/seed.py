"""
Seed the database with initial puzzles, openings, and daily challenge.
"""
import uuid
from datetime import datetime, date
from app.database import SessionLocal, engine, Base
from app.models.models import Puzzle, Opening, DailyChallenge

# Create all tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── Puzzles ──────────────────────────────────────────
puzzles_data = [
    {
        "id": str(uuid.uuid4()),
        "title": "Scholar's Mate",
        "description": "Deliver checkmate in 4 moves!",
        "category": "checkmate",
        "difficulty": 1,
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "solution_moves": ["e2e4", "e7e5", "f1c4", "b8c6", "d1h5", "g8f6", "h5f7"],
        "hints": ["Develop your bishop and queen quickly", "Target f7"],
        "elo_rating": 800,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Back Rank Mate",
        "description": "Exploit the weak back rank to deliver checkmate.",
        "category": "checkmate",
        "difficulty": 2,
        "fen": "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
        "solution_moves": ["e1e8"],
        "hints": ["The king is trapped behind its own pawns"],
        "elo_rating": 1000,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Knight Fork",
        "description": "Use a knight fork to win material.",
        "category": "fork",
        "difficulty": 2,
        "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
        "solution_moves": ["h5f7"],
        "hints": ["Which piece can attack two targets at once?"],
        "elo_rating": 1100,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Pin the Knight",
        "description": "Pin the knight to the king using your bishop.",
        "category": "pin",
        "difficulty": 2,
        "fen": "r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
        "solution_moves": ["f1b5"],
        "hints": ["Place your bishop where it pins a piece to the king"],
        "elo_rating": 1050,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Skewer Attack",
        "description": "Use a skewer to win the queen!",
        "category": "skewer",
        "difficulty": 3,
        "fen": "6k1/8/8/8/1q6/8/8/R3K3 w - - 0 1",
        "solution_moves": ["a1a8", "g8g7", "a8b8"],
        "hints": ["Attack the king first, then collect the queen"],
        "elo_rating": 1300,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Smothered Mate",
        "description": "Deliver the classic smothered mate with your knight.",
        "category": "checkmate",
        "difficulty": 4,
        "fen": "r1b3kr/ppp2Npp/8/3n4/8/8/PPP2PPP/R1B1K2R w KQ - 0 1",
        "solution_moves": ["f7h6", "g8h8", "h6f7", "h8g8", "f7d6", "g8h8", "d6f7", "h8g8", "f7h6", "g8h8", "h1h7"],
        "hints": ["Use your knight to corral the king", "The king has no escape squares"],
        "elo_rating": 1500,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Double Attack",
        "description": "Find the move that attacks two pieces at once.",
        "category": "fork",
        "difficulty": 2,
        "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        "solution_moves": ["d2d4"],
        "hints": ["Attack the center and a piece simultaneously"],
        "elo_rating": 950,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Discovered Attack",
        "description": "Move one piece to reveal an attack from another.",
        "category": "discovered_attack",
        "difficulty": 3,
        "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP4/PPP2PPP/R1BQK1NR w KQkq - 0 5",
        "solution_moves": ["c3d5"],
        "hints": ["Moving the knight reveals an attack"],
        "elo_rating": 1250,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Queen Sacrifice",
        "description": "Sacrifice your queen for a brilliant checkmate!",
        "category": "sacrifice",
        "difficulty": 4,
        "fen": "r1bq2kr/ppp2pBp/2n5/3np3/2B5/8/PPP1QPPP/RN2K2R w KQ - 0 1",
        "solution_moves": ["e2e5"],
        "hints": ["Sometimes the most powerful move is a sacrifice"],
        "elo_rating": 1600,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Zugzwang",
        "description": "Put your opponent in a position where any move loses.",
        "category": "endgame",
        "difficulty": 5,
        "fen": "8/8/8/3k4/8/3K4/3P4/8 w - - 0 1",
        "solution_moves": ["d3e3"],
        "hints": ["Opposition is key in king and pawn endgames"],
        "elo_rating": 1700,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Anastasia's Mate",
        "description": "Combine rook and knight for a classic mating pattern.",
        "category": "checkmate",
        "difficulty": 4,
        "fen": "4k2r/4npp1/8/4N3/8/8/1B4PP/5RK1 w k - 0 1",
        "solution_moves": ["e5f7", "e7g6", "f1e1", "e8d7", "e1e7"],
        "hints": ["The knight and rook can work together along the e-file"],
        "elo_rating": 1550,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Removing the Defender",
        "description": "Eliminate the key defensive piece to win material.",
        "category": "tactics",
        "difficulty": 3,
        "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 1",
        "solution_moves": ["d4c6"],
        "hints": ["Remove the piece that defends a critical square"],
        "elo_rating": 1350,
    },
]

# ── Openings ──────────────────────────────────────────
openings_data = [
    {
        "eco_code": "C20", "name": "King's Pawn Opening",
        "pgn": "1. e4", "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        "description": "The most popular first move, controlling the center and freeing the bishop and queen.",
        "category": "Open", "popularity": 95, "win_rate_white": 0.54, "win_rate_black": 0.30, "draw_rate": 0.16,
    },
    {
        "eco_code": "C50", "name": "Italian Game",
        "pgn": "1. e4 e5 2. Nf3 Nc6 3. Bc4", "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        "description": "One of the oldest openings. White develops quickly, targeting f7.",
        "category": "Open", "popularity": 88, "win_rate_white": 0.52, "win_rate_black": 0.31, "draw_rate": 0.17,
    },
    {
        "eco_code": "C60", "name": "Ruy Lopez",
        "pgn": "1. e4 e5 2. Nf3 Nc6 3. Bb5", "fen": "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        "description": "The Spanish Game. A cornerstone of chess theory for centuries.",
        "category": "Open", "popularity": 92, "win_rate_white": 0.53, "win_rate_black": 0.29, "draw_rate": 0.18,
    },
    {
        "eco_code": "B20", "name": "Sicilian Defense",
        "pgn": "1. e4 c5", "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
        "description": "The most popular response to 1.e4. Sharp, asymmetrical, and fighting.",
        "category": "Semi-Open", "popularity": 97, "win_rate_white": 0.48, "win_rate_black": 0.35, "draw_rate": 0.17,
    },
    {
        "eco_code": "B10", "name": "Caro-Kann Defense",
        "pgn": "1. e4 c6", "fen": "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        "description": "Solid and reliable. Black prepares to challenge the center with d5.",
        "category": "Semi-Open", "popularity": 80, "win_rate_white": 0.50, "win_rate_black": 0.32, "draw_rate": 0.18,
    },
    {
        "eco_code": "C00", "name": "French Defense",
        "pgn": "1. e4 e6", "fen": "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        "description": "Strategic and solid. Creates a pawn chain pointing to the queenside.",
        "category": "Semi-Open", "popularity": 82, "win_rate_white": 0.51, "win_rate_black": 0.31, "draw_rate": 0.18,
    },
    {
        "eco_code": "D06", "name": "Queen's Gambit",
        "pgn": "1. d4 d5 2. c4", "fen": "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
        "description": "White offers a pawn to gain central control. One of the oldest openings.",
        "category": "Closed", "popularity": 90, "win_rate_white": 0.55, "win_rate_black": 0.28, "draw_rate": 0.17,
    },
    {
        "eco_code": "A45", "name": "Indian Defense",
        "pgn": "1. d4 Nf6", "fen": "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
        "description": "Flexible system. Black delays committing the central pawns.",
        "category": "Indian", "popularity": 85, "win_rate_white": 0.49, "win_rate_black": 0.33, "draw_rate": 0.18,
    },
    {
        "eco_code": "E60", "name": "King's Indian Defense",
        "pgn": "1. d4 Nf6 2. c4 g6", "fen": "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
        "description": "Dynamic and double-edged. Black fianchettoes and counterattacks.",
        "category": "Indian", "popularity": 87, "win_rate_white": 0.50, "win_rate_black": 0.34, "draw_rate": 0.16,
    },
    {
        "eco_code": "A10", "name": "English Opening",
        "pgn": "1. c4", "fen": "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1",
        "description": "A flexible flank opening. Often transposes into other systems.",
        "category": "Flank", "popularity": 75, "win_rate_white": 0.51, "win_rate_black": 0.30, "draw_rate": 0.19,
    },
]

# ── Seed ──────────────────────────────────────────────
try:
    # Clear existing data
    db.query(DailyChallenge).delete()
    db.query(Puzzle).delete()
    db.query(Opening).delete()
    db.commit()

    # Insert puzzles
    for p in puzzles_data:
        db.add(Puzzle(**p))
    db.commit()
    print(f"  Inserted {len(puzzles_data)} puzzles")

    # Insert openings
    for o in openings_data:
        db.add(Opening(**o))
    db.commit()
    print(f"  Inserted {len(openings_data)} openings")

    # Create today's daily challenge
    today = date.today().isoformat()
    first_puzzle = db.query(Puzzle).first()
    if first_puzzle:
        dc = DailyChallenge(
            id=str(uuid.uuid4()),
            date=today,
            puzzle_id=first_puzzle.id,
            bonus_xp=100,
        )
        db.add(dc)
        db.commit()
        print(f"  Created daily challenge for {today}")

    print("\nDatabase seeded successfully!")
except Exception as e:
    db.rollback()
    print(f"Error seeding database: {e}")
finally:
    db.close()
