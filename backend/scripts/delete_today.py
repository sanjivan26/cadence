from datetime import date

from app.core.database import SessionLocal
from app.models.puzzle import Puzzle


db = SessionLocal()

try:
    deleted = (
        db.query(Puzzle)
        .filter(Puzzle.puzzle_date == date.today())
        .delete()
    )

    db.commit()

    print(f"Deleted {deleted} puzzle(s).")

finally:
    db.close()