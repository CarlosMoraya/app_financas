
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, func, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID

from ..db.base import Base

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False)
    type = Column(String, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    merchant = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
