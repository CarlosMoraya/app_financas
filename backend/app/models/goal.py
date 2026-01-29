
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from ..db.base import Base

class Goal(Base):
    __tablename__ = 'goals'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String, nullable=False)
    target_amount = Column(Numeric(12, 2), nullable=False)
    target_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
