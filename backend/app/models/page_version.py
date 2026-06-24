from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PageVersion(Base):
    __tablename__ = "page_versions"

    __table_args__ = (
        UniqueConstraint(
            "page_id",
            "version_number",
            name="uq_page_versions_page_version_number",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    page_id: Mapped[int] = mapped_column(
        ForeignKey("pages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    version_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    content_markdown: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    change_message: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    page = relationship("Page", back_populates="versions")
    created_by = relationship("User")