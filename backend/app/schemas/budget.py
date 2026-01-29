
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel

class BudgetBase(BaseModel):
    month: date
    category_id: int
    limit_amount: Decimal

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BudgetBase):
    pass

class BudgetInDB(BudgetBase):
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class BudgetRead(BudgetInDB):
    pass
