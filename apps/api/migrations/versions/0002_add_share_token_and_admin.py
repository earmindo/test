"""add share_token to generations

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-28
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("generations", sa.Column("share_token", sa.String(), nullable=True))
    op.create_unique_constraint("uq_generations_share_token", "generations", ["share_token"])
    op.create_index("ix_generations_share_token", "generations", ["share_token"])


def downgrade() -> None:
    op.drop_index("ix_generations_share_token", "generations")
    op.drop_constraint("uq_generations_share_token", "generations")
    op.drop_column("generations", "share_token")
