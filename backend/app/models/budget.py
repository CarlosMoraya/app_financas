
from sqlalchemy import Column, Integer, Numeric, Date, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from ..db.base import Base

class Budget(Base):
    __tablename__ = 'budgets'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    month = Column(Date, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    limit_amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
