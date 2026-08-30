"""add puzzle number

Revision ID: 65012b5330d6
Revises: 1d193921a92b
Create Date: 2026-08-30 15:58:16.270202

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '65012b5330d6'
down_revision: Union[str, Sequence[str], None] = '1d193921a92b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "puzzles",
        sa.Column(
            "puzzle_number",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Give existing puzzles their sequential number
    connection = op.get_bind()

    games = connection.execute(
        sa.text(
            """
            SELECT DISTINCT game_id
            FROM puzzles
            ORDER BY game_id
            """
        )
    ).fetchall()

    for game in games:
        puzzles = connection.execute(
            sa.text(
                """
                SELECT id
                FROM puzzles
                WHERE game_id = :game_id
                ORDER BY puzzle_date, id
                """
            ),
            {
                "game_id": game.game_id,
            },
        ).fetchall()

        for number, puzzle in enumerate(puzzles, start=1):
            connection.execute(
                sa.text(
                    """
                    UPDATE puzzles
                    SET puzzle_number = :number
                    WHERE id = :id
                    """
                ),
                {
                    "number": number,
                    "id": puzzle.id,
                },
            )

    op.alter_column(
        "puzzles",
        "puzzle_number",
        nullable=False,
    )

    op.create_unique_constraint(
        "uq_game_puzzle_number",
        "puzzles",
        ["game_id", "puzzle_number"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_game_puzzle_number",
        "puzzles",
        type_="unique",
    )

    op.drop_column(
        "puzzles",
        "puzzle_number",
    )