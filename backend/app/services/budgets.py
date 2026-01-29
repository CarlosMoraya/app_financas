
from uuid import UUID
from typing import List, Optional
from datetime import date
from ..schemas.budget import BudgetCreate, BudgetUpdate, BudgetRead
from ..repositories.budgets import BudgetRepository

class BudgetService:
    def __init__(self, repo: BudgetRepository, user_id: UUID):
        self.repo = repo
        self.user_id = user_id

    async def list_budgets(self, month: Optional[date] = None) -> List[BudgetRead]:
        budgets = await self.repo.list(self.user_id, month)
        return [BudgetRead.model_validate(b) for b in budgets]

    async def get_budget(self, budget_id: int) -> BudgetRead | None:
        budget = await self.repo.get(self.user_id, budget_id)
        if not budget:
            return None
        return BudgetRead.model_validate(budget)

    async def create_budget(self, obj_in: BudgetCreate) -> BudgetRead:
        budget = await self.repo.create(self.user_id, obj_in)
        return BudgetRead.model_validate(budget)

    async def update_budget(self, budget_id: int, obj_in: BudgetUpdate) -> BudgetRead | None:
        budget = await self.repo.update(self.user_id, budget_id, obj_in)
        if not budget:
            return None
        return BudgetRead.model_validate(budget)

    async def delete_budget(self, budget_id: int) -> bool:
        return await self.repo.delete(self.user_id, budget_id)
