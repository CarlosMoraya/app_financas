
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel

class TransactionBase(BaseModel):
    account_id: int
    type: str
    amount: Decimal
    date: date
    description: Optional[str] = None
    category_id: Optional[int] = None
    merchant: Optional[str] = None
    tags: Optional[List[str]] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDB(TransactionBase):
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TransactionRead(TransactionInDB):
    pass
