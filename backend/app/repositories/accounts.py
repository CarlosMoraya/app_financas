
from typing import List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.account import Account
from ..schemas.account import AccountCreate, AccountUpdate

class AccountRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_accounts(self, user_id: UUID) -> List[Account]:
        stmt = select(Account).where(Account.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get(self, user_id: UUID, account_id: int) -> Account | None:
        stmt = select(Account).where(Account.id == account_id, Account.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, obj_in: AccountCreate) -> Account:
        account = Account(user_id=user_id, name=obj_in.name, type=obj_in.type, currency=obj_in.currency, initial_balance=obj_in.initial_balance)
        self.session.add(account)
        await self.session.commit()
        await self.session.refresh(account)
        return account

    async def update(self, user_id: UUID, account_id: int, obj_in: AccountUpdate) -> Account | None:
        account = await self.get(user_id, account_id)
        if not account:
            return None
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            setattr(account, field, value)
        await self.session.commit()
        await self.session.refresh(account)
        return account

    async def delete(self, user_id: UUID, account_id: int) -> bool:
        account = await self.get(user_id, account_id)
        if not account:
            return False
        await self.session.delete(account)
        await self.session.commit()
        return True
