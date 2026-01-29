
from sqlalchemy import Column, Integer, String, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from ..db.base import Base

class Account(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    initial_balance = Column(Numeric(12, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
