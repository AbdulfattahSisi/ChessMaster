"""
Seed data: puzzles and openings for ChessMaster.
Run: python -m app.seed
"""
from app.database import SessionLocal, engine, Base
from app.models.models import Puzzle, Opening, User, UserRole
from app.utils.auth import hash_password


def seed_puzzles(db):
    """Seed 30+ chess puzzles across categories."""
    puzzles = [
        # ─── Mate in 1 ───
        Puzzle(title="Scholar's Mate Finish", category="checkmate_1", difficulty=1, elo_rating=800,
               fen="r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
               solution_moves=["h5f7"], hints=["Attack f7 with the queen"]),
        Puzzle(title="Back Rank Mate", category="checkmate_1", difficulty=1, elo_rating=900,
               fen="6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
               solution_moves=["e1e8"], hints=["The back rank is weak"]),
        Puzzle(title="Queen Sacrifice Mate", category="checkmate_1", difficulty=2, elo_rating=1000,
               fen="r1b1k2r/ppppqppp/2n2n2/2b5/2B1P3/2N2Q2/PPPP1PPP/R1B1K2R w KQkq - 0 1",
               solution_moves=["f3f7"], hints=["The f7 square is the target"]),
        Puzzle(title="Smothered Mate Setup", category="checkmate_1", difficulty=2, elo_rating=1050,
               fen="r1b3kr/ppp2Npp/8/8/8/8/PPP2PPP/R1B1K2R w KQ - 0 1",
               solution_moves=["f7h6"], hints=["The knight delivers checkmate"]),
        Puzzle(title="Arabian Mate", category="checkmate_1", difficulty=2, elo_rating=1100,
               fen="5rk1/5ppp/8/8/8/5N2/5PPP/4R1K1 w - - 0 1",
               solution_moves=["e1e8"], hints=["Rook to the back rank"]),

        # ─── Mate in 2 ───
        Puzzle(title="Queen & Bishop Battery", category="checkmate_2", difficulty=3, elo_rating=1200,
               fen="r2qkb1r/ppp2ppp/2n5/3pp3/2B1P1b1/3P1Q2/PPP2PPP/RNB1K2R w KQkq - 0 1",
               solution_moves=["f3f7", "e8d8", "f7f8"], hints=["Target f7", "Then follow through"]),
        Puzzle(title="Double Check Mate", category="checkmate_2", difficulty=3, elo_rating=1300,
               fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3",
               solution_moves=["f3f7", "e8e7", "c4d5"], hints=["Check on f7 first"]),

        # ─── Fork ───
        Puzzle(title="Knight Fork King & Queen", category="fork", difficulty=2, elo_rating=1000,
               fen="r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
               solution_moves=["f3d4"], hints=["Find the fork square"]),
        Puzzle(title="Royal Knight Fork", category="fork", difficulty=2, elo_rating=1050,
               fen="r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP4/PPP2PPP/R1BQK1NR w KQkq - 0 1",
               solution_moves=["c3d5"], hints=["The knight attacks multiple pieces"]),
        Puzzle(title="Pawn Fork", category="fork", difficulty=1, elo_rating=850,
               fen="r1bqkbnr/pppppppp/2n5/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3",
               solution_moves=["d4d5"], hints=["Push the pawn to attack two pieces"]),

        # ─── Pin ───
        Puzzle(title="Absolute Pin on Knight", category="pin", difficulty=2, elo_rating=1000,
               fen="rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
               solution_moves=["f1b5"], hints=["Pin the knight to the king"]),
        Puzzle(title="Bishop Pin Wins Piece", category="pin", difficulty=2, elo_rating=1100,
               fen="r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
               solution_moves=["f1b5"], hints=["Pin the knight"]),

        # ─── Skewer ───
        Puzzle(title="Bishop Skewer", category="skewer", difficulty=2, elo_rating=1100,
               fen="4k3/8/8/8/3B4/8/1K3r2/8 w - - 0 1",
               solution_moves=["d4g7"], hints=["Attack the king, win the rook behind"]),
        Puzzle(title="Rook Skewer", category="skewer", difficulty=3, elo_rating=1200,
               fen="4k3/8/8/8/8/8/1K2R3/4q3/8 w - - 0 1",
               solution_moves=["e2e1"], hints=["Skewer queen through king line"]),

        # ─── Discovered Attack ───
        Puzzle(title="Discovered Check Wins Queen", category="discovered_attack", difficulty=3, elo_rating=1250,
               fen="r1bqkb1r/pppppppp/2n2n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 1",
               solution_moves=["d4d5"], hints=["Move the pawn to discover an attack"]),

        # ─── Sacrifice ───
        Puzzle(title="Greek Gift Sacrifice", category="sacrifice", difficulty=4, elo_rating=1400,
               fen="rnbq1rk1/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2BPPP/R1BQK2R w KQ - 0 7",
               solution_moves=["e2h5"], hints=["Sacrifice to open the king"]),
        Puzzle(title="Queen Sacrifice for Mate", category="sacrifice", difficulty=4, elo_rating=1500,
               fen="r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1",
               solution_moves=["d1b3"], hints=["Target the weak f7 pawn"]),

        # ─── Endgame ───
        Puzzle(title="King & Pawn Endgame", category="endgame", difficulty=2, elo_rating=1100,
               fen="8/8/8/8/4P3/8/8/4K2k w - - 0 1",
               solution_moves=["e4e5"], hints=["Push the pawn and promote"]),
        Puzzle(title="Opposition", category="endgame", difficulty=3, elo_rating=1200,
               fen="8/8/4k3/8/4K3/4P3/8/8 w - - 0 1",
               solution_moves=["e4d5"], hints=["Gain the opposition"]),
        Puzzle(title="Lucena Position", category="endgame", difficulty=4, elo_rating=1400,
               fen="1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
               solution_moves=["c1c4"], hints=["Build a bridge"]),

        # ─── Promotion ───
        Puzzle(title="Pawn Race", category="promotion", difficulty=2, elo_rating=1000,
               fen="8/P7/8/8/8/8/p7/8 w - - 0 1",
               solution_moves=["a7a8q"], hints=["Promote first!"]),

        # ─── Opening Trap ───
        Puzzle(title="Fishing Pole Trap", category="opening_trap", difficulty=3, elo_rating=1300,
               fen="r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
               solution_moves=["d2d4"], hints=["Take control of the center"]),

        # ─── Deflection ───
        Puzzle(title="Deflect the Defender", category="deflection", difficulty=3, elo_rating=1250,
               fen="r2qk2r/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w kq - 0 1",
               solution_moves=["c4d5"], hints=["Remove the defender of a key square"]),

        # ─── Zugzwang ───
        Puzzle(title="Zugzwang Endgame", category="zugzwang", difficulty=5, elo_rating=1600,
               fen="8/8/8/1K6/8/1k6/1p6/8 w - - 0 1",
               solution_moves=["b5c4"], hints=["Put your opponent in zugzwang"]),
        Puzzle(title="Triangulation", category="zugzwang", difficulty=5, elo_rating=1700,
               fen="8/8/1p6/1P1K4/8/1k6/8/8 w - - 0 1",
               solution_moves=["d5c6"], hints=["Use triangulation to win the tempo"]),

        # ─── Double Check ───
        Puzzle(title="Double Check Devastation", category="double_check", difficulty=4, elo_rating=1350,
               fen="r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
               solution_moves=["f3e5"], hints=["Discover a check while giving check"]),

        # ─── Decoy ───
        Puzzle(title="Decoy into Mate", category="decoy", difficulty=4, elo_rating=1400,
               fen="r1b2rk1/ppppqppp/2n5/8/2B1P3/2N2Q2/PPP2PPP/R3K2R w KQ - 0 1",
               solution_moves=["f3f7"], hints=["Lure the king to a vulnerable square"]),
    ]

    existing = db.query(Puzzle).count()
    if existing == 0:
        db.add_all(puzzles)
        db.commit()
        print(f"✓ Seeded {len(puzzles)} puzzles")
    else:
        print(f"Puzzles already exist ({existing}), skipping.")


def seed_openings(db):
    """Seed popular chess openings."""
    openings = [
        Opening(eco_code="B20", name="Sicilian Defence", category="Semi-Open",
                pgn="1. e4 c5", fen="rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
                description="The most popular response to 1.e4. Black fights for the center asymmetrically.",
                popularity=95, win_rate_white=52.3, win_rate_black=30.1, draw_rate=17.6),
        Opening(eco_code="C50", name="Italian Game", category="Open",
                pgn="1. e4 e5 2. Nf3 Nc6 3. Bc4", fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                description="One of the oldest openings. White develops the bishop to target f7.",
                popularity=85, win_rate_white=53.1, win_rate_black=28.5, draw_rate=18.4),
        Opening(eco_code="C60", name="Ruy López", category="Open",
                pgn="1. e4 e5 2. Nf3 Nc6 3. Bb5", fen="r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                description="The Spanish Game. One of the most deeply studied openings in chess.",
                popularity=90, win_rate_white=54.2, win_rate_black=27.8, draw_rate=18.0),
        Opening(eco_code="D06", name="Queen's Gambit", category="Closed",
                pgn="1. d4 d5 2. c4", fen="rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
                description="White offers a pawn to gain central control. One of the most respected openings.",
                popularity=88, win_rate_white=55.1, win_rate_black=26.4, draw_rate=18.5),
        Opening(eco_code="E60", name="King's Indian Defence", category="Indian",
                pgn="1. d4 Nf6 2. c4 g6", fen="rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
                description="Black allows White to build a big center, planning to counterattack later.",
                popularity=75, win_rate_white=51.8, win_rate_black=30.5, draw_rate=17.7),
        Opening(eco_code="A10", name="English Opening", category="Flank",
                pgn="1. c4", fen="rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1",
                description="A flexible flank opening that can transpose into many different positions.",
                popularity=70, win_rate_white=52.0, win_rate_black=29.0, draw_rate=19.0),
        Opening(eco_code="B00", name="French Defence", category="Semi-Open",
                pgn="1. e4 e6", fen="rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
                description="A solid defence where Black builds a pawn chain. Leads to strategic positions.",
                popularity=72, win_rate_white=53.5, win_rate_black=28.0, draw_rate=18.5),
        Opening(eco_code="B10", name="Caro-Kann Defence", category="Semi-Open",
                pgn="1. e4 c6", fen="rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
                description="Solid and reliable. Black supports d5 with c6 before playing it.",
                popularity=68, win_rate_white=52.8, win_rate_black=29.2, draw_rate=18.0),
        Opening(eco_code="D30", name="Queen's Gambit Declined", category="Closed",
                pgn="1. d4 d5 2. c4 e6", fen="rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
                description="Black declines the gambit pawn and maintains a solid center.",
                popularity=82, win_rate_white=54.0, win_rate_black=27.0, draw_rate=19.0),
        Opening(eco_code="E00", name="Nimzo-Indian Defence", category="Indian",
                pgn="1. d4 Nf6 2. c4 e6 3. Nc3 Bb4", fen="rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
                description="One of the most dynamic and well-respected defenses against 1.d4.",
                popularity=78, win_rate_white=51.5, win_rate_black=30.2, draw_rate=18.3),
        Opening(eco_code="C42", name="Petrov's Defence", category="Open",
                pgn="1. e4 e5 2. Nf3 Nf6", fen="rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                description="A symmetrical and solid defence that often leads to equal positions.",
                popularity=65, win_rate_white=52.0, win_rate_black=28.5, draw_rate=19.5),
        Opening(eco_code="C30", name="King's Gambit", category="Open",
                pgn="1. e4 e5 2. f4", fen="rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2",
                description="An aggressive gambit where White sacrifices a pawn for rapid development.",
                popularity=55, win_rate_white=51.0, win_rate_black=30.0, draw_rate=19.0),
        Opening(eco_code="A40", name="Dutch Defence", category="Flank",
                pgn="1. d4 f5", fen="rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq f6 0 2",
                description="An ambitious defence where Black immediately fights for control of e4.",
                popularity=50, win_rate_white=53.0, win_rate_black=29.0, draw_rate=18.0),
        Opening(eco_code="B01", name="Scandinavian Defence", category="Semi-Open",
                pgn="1. e4 d5", fen="rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
                description="Black immediately challenges White's e4 pawn. Simple and direct.",
                popularity=58, win_rate_white=54.0, win_rate_black=27.5, draw_rate=18.5),
        Opening(eco_code="D80", name="Grünfeld Defence", category="Indian",
                pgn="1. d4 Nf6 2. c4 g6 3. Nc3 d5", fen="rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4",
                description="Black lets White build a big center and plans to destroy it later.",
                popularity=65, win_rate_white=52.5, win_rate_black=29.5, draw_rate=18.0),
    ]

    existing = db.query(Opening).count()
    if existing == 0:
        db.add_all(openings)
        db.commit()
        print(f"✓ Seeded {len(openings)} openings")
    else:
        print(f"Openings already exist ({existing}), skipping.")


def seed_demo_user(db):
    """Create a demo admin user."""
    if not db.query(User).filter(User.username == "admin").first():
        admin = User(
            username="admin",
            email="admin@chessmaster.app",
            hashed_password=hash_password("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            elo_rating=1500,
        )
        db.add(admin)
        db.commit()
        print("✓ Created admin user (admin / admin123)")

    if not db.query(User).filter(User.username == "player1").first():
        player = User(
            username="player1",
            email="player1@chessmaster.app",
            hashed_password=hash_password("player123"),
            full_name="Demo Player",
            role=UserRole.PLAYER,
        )
        db.add(player)
        db.commit()
        print("✓ Created demo player (player1 / player123)")


def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_user(db)
        seed_puzzles(db)
        seed_openings(db)
        print("\n✓ Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
