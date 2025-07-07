


"""alter rca_report to jsonb

Revision ID: 08eb744f1534
Revises: ccc5b0a6d815
Create Date: 2025-05-13 09:01:14.375855

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '08eb744f1534'
down_revision = 'ccc5b0a6d815'
branch_labels = None
depends_on = None


def upgrade():
    # Convert rca_report to JSONB
    op.alter_column(
        'incidents',
        'rca_report',
        type_=sa.dialects.postgresql.JSONB(),
        postgresql_using='rca_report::jsonb'
    )
    # Optionally, do the same for description if you want it as JSONB:
    # op.alter_column(
    #     'incidents',
    #     'description',
    #     type_=sa.dialects.postgresql.JSONB(),
    #     postgresql_using='description::jsonb'
    # )


def downgrade():
    # Revert rca_report to Text
    op.alter_column(
        'incidents',
        'rca_report',
        type_=sa.Text(),
        postgresql_using='rca_report::text'
    )
    # Optionally, revert description as well:
    # op.alter_column(
    #     'incidents',
    #     'description',
    #     type_=sa.Text(),
    #     postgresql_using='description::text'
    # )
