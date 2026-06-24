from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Page(Base):
    __tablename__ = "pages"

    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "slug",
            name="uq_pages_workspace_slug",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("pages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(220),
        nullable=False,
        index=True,
    )

    content_markdown: Mapped[str] = mapped_column(
        Text,
        default="",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="draft",
        nullable=False,
        index=True,
    )

    position: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    updated_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    workspace = relationship("Workspace")
    parent = relationship("Page", remote_side=[id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])

    versions = relationship(
        "PageVersion",
        back_populates="page",
        cascade="all, delete-orphan",
    )