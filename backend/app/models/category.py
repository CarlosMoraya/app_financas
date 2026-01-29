
from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from ..db.base import Base

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
