
from typing import List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.category import Category
from ..schemas.category import CategoryCreate, CategoryUpdate

class CategoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, user_id: UUID) -> List[Category]:
        stmt = select(Category).where(Category.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get(self, user_id: UUID, category_id: int) -> Category | None:
        stmt = select(Category).where(Category.id == category_id, Category.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, obj_in: CategoryCreate) -> Category:
        category = Category(user_id=user_id, name=obj_in.name, type=obj_in.type, parent_id=obj_in.parent_id)
        self.session.add(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def update(self, user_id: UUID, category_id: int, obj_in: CategoryUpdate) -> Category | None:
        category = await self.get(user_id, category_id)
        if not category:
            return None
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            setattr(category, field, value)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def delete(self, user_id: UUID, category_id: int) -> bool:
        category = await self.get(user_id, category_id)
        if not category:
            return False
        await self.session.delete(category)
        await self.session.commit()
        return True
