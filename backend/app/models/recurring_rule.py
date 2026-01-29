
from sqlalchemy import Column, Integer, String, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from ..db.base import Base

class RecurringRule(Base):
    __tablename__ = 'recurring_rules'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    pattern = Column(String, nullable=False)
    interval = Column(Integer, nullable=False, default=1)
    next_run = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
