
from uuid import UUID
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    type: str
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryInDB(CategoryBase):
    id: int
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class CategoryRead(CategoryInDB):
    pass
