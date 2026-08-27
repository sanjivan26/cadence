from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.game import Game
from app.models.puzzle import Puzzle


def seed_initial_data(db: Session) -> None:
    pixalbum = db.scalar(
        select(Game).where(Game.slug == "pixalbum")
    )

    if not pixalbum:
        pixalbum = Game(
            slug="pixalbum",
            name="PixAlbum",
            description="Guess the album from visual clues.",
            is_active=True,
        )

        db.add(pixalbum)
        db.flush()

    today = date.today()

    puzzle = db.scalar(
        select(Puzzle).where(
            Puzzle.game_id == pixalbum.id,
            Puzzle.puzzle_date == today,
        )
    )

    if not puzzle:
        puzzle = Puzzle(
            game_id=pixalbum.id,
            puzzle_date=today,
            status="published",
            puzzle_data={
                "type": "pixalbum",
                "answer": "Random Access Memories",
                "artist": "Daft Punk",
            },
        )

        db.add(puzzle)

    db.commit()