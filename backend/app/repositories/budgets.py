
from typing import List, Optional
from uuid import UUID
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.budget import Budget
from ..schemas.budget import BudgetCreate, BudgetUpdate

class BudgetRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, user_id: UUID, month: Optional[date] = None) -> List[Budget]:
        stmt = select(Budget).where(Budget.user_id == user_id)
        if month:
            stmt = stmt.where(Budget.month == month)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get(self, user_id: UUID, budget_id: int) -> Budget | None:
        stmt = select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, obj_in: BudgetCreate) -> Budget:
        budget = Budget(user_id=user_id, month=obj_in.month, category_id=obj_in.category_id, limit_amount=obj_in.limit_amount)
        self.session.add(budget)
        await self.session.commit()
        await self.session.refresh(budget)
        return budget

    async def update(self, user_id: UUID, budget_id: int, obj_in: BudgetUpdate) -> Budget | None:
        budget = await self.get(user_id, budget_id)
        if not budget:
            return None
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            setattr(budget, field, value)
        await self.session.commit()
        await self.session.refresh(budget)
        return budget

    async def delete(self, user_id: UUID, budget_id: int) -> bool:
        budget = await self.get(user_id, budget_id)
        if not budget:
            return False
        await self.session.delete(budget)
        await self.session.commit()
        return True
