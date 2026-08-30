from datetime import date, datetime

from sqlalchemy import (
    JSON,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Puzzle(Base):
    __tablename__ = "puzzles"

    __table_args__ = (
        UniqueConstraint(
            "game_id",
            "puzzle_date",
            name="uq_game_puzzle_date",
        ),
        UniqueConstraint(
            "game_id",
            "puzzle_number",
            name="uq_game_puzzle_number",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    game_id: Mapped[int] = mapped_column(
        ForeignKey("games.id"),
        nullable=False,
        index=True,
    )

    puzzle_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    puzzle_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="published",
        nullable=False,
    )

    puzzle_data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )