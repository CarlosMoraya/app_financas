
from uuid import UUID
from typing import List
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from ..repositories.categories import CategoryRepository

class CategoryService:
    def __init__(self, repo: CategoryRepository, user_id: UUID):
        self.repo = repo
        self.user_id = user_id

    async def list_categories(self) -> List[CategoryRead]:
        categories = await self.repo.list(self.user_id)
        return [CategoryRead.model_validate(c) for c in categories]

    async def get_category(self, category_id: int) -> CategoryRead | None:
        category = await self.repo.get(self.user_id, category_id)
        if not category:
            return None
        return CategoryRead.model_validate(category)

    async def create_category(self, obj_in: CategoryCreate) -> CategoryRead:
        category = await self.repo.create(self.user_id, obj_in)
        return CategoryRead.model_validate(category)

    async def update_category(self, category_id: int, obj_in: CategoryUpdate) -> CategoryRead | None:
        category = await self.repo.update(self.user_id, category_id, obj_in)
        if not category:
            return None
        return CategoryRead.model_validate(category)

    async def delete_category(self, category_id: int) -> bool:
        return await self.repo.delete(self.user_id, category_id)
