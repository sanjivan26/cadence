"""add puzzle data

Revision ID: 5adf042f5a70
Revises: 9296f47b111f
Create Date: 2026-08-27 11:54:28.133540

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5adf042f5a70'
down_revision: Union[str, Sequence[str], None] = '9296f47b111f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "puzzles",
        sa.Column(
            "puzzle_data",
            sa.JSON(),
            nullable=True,
        ),
    )

    op.execute(
        """
        UPDATE puzzles
        SET puzzle_data = '{}'::json
        WHERE puzzle_data IS NULL
        """
    )

    op.alter_column(
        "puzzles",
        "puzzle_data",
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "puzzles",
        "puzzle_data",
    )