"""make completed_at nullable

Revision ID: 4759871e5c70
Revises: 65012b5330d6
Create Date: 2026-08-31 07:18:03.555019

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4759871e5c70'
down_revision: Union[str, Sequence[str], None] = '65012b5330d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "puzzle_attempts",
        "completed_at",
        existing_type=sa.DateTime(),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "puzzle_attempts",
        "completed_at",
        existing_type=sa.DateTime(),
        nullable=False,
    )
