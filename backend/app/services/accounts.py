
from uuid import UUID
from typing import List
from ..schemas.account import AccountCreate, AccountUpdate, AccountRead
from ..repositories.accounts import AccountRepository

class AccountService:
    def __init__(self, repo: AccountRepository, user_id: UUID):
        self.repo = repo
        self.user_id = user_id

    async def list_accounts(self) -> List[AccountRead]:
        accounts = await self.repo.list_accounts(self.user_id)
        return [AccountRead.model_validate(a) for a in accounts]

    async def get_account(self, account_id: int) -> AccountRead | None:
        account = await self.repo.get(self.user_id, account_id)
        if not account:
            return None
        return AccountRead.model_validate(account)

    async def create_account(self, obj_in: AccountCreate) -> AccountRead:
        account = await self.repo.create(self.user_id, obj_in)
        return AccountRead.model_validate(account)

    async def update_account(self, account_id: int, obj_in: AccountUpdate) -> AccountRead | None:
        account = await self.repo.update(self.user_id, account_id, obj_in)
        if not account:
            return None
        return AccountRead.model_validate(account)

    async def delete_account(self, account_id: int) -> bool:
        return await self.repo.delete(self.user_id, account_id)
