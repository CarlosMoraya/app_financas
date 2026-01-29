
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

class AccountBase(BaseModel):
    name: str
    type: str
    currency: str
    initial_balance: Decimal = Field(default=0)

class AccountCreate(AccountBase):
    pass

class AccountUpdate(AccountBase):
    pass

class AccountInDB(AccountBase):
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class AccountRead(AccountInDB):
    pass
