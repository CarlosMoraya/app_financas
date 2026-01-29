
from typing import List, Optional
from uuid import UUID
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.transaction import Transaction
from ..schemas.transaction import TransactionCreate, TransactionUpdate

class TransactionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, user_id: UUID, start_date: Optional[date] = None, end_date: Optional[date] = None, account_id: Optional[int] = None, category_id: Optional[int] = None) -> List[Transaction]:
        stmt = select(Transaction).where(Transaction.user_id == user_id)
        if start_date:
            stmt = stmt.where(Transaction.date >= start_date)
        if end_date:
            stmt = stmt.where(Transaction.date <= end_date)
        if account_id:
            stmt = stmt.where(Transaction.account_id == account_id)
        if category_id:
            stmt = stmt.where(Transaction.category_id == category_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get(self, user_id: UUID, transaction_id: int) -> Transaction | None:
        stmt = select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID, obj_in: TransactionCreate) -> Transaction:
        txn = Transaction(user_id=user_id, account_id=obj_in.account_id, type=obj_in.type, amount=obj_in.amount, date=obj_in.date, description=obj_in.description, category_id=obj_in.category_id, merchant=obj_in.merchant, tx_metadata={'tags': obj_in.tags} if obj_in.tags else None)
        self.session.add(txn)
        await self.session.commit()
        await self.session.refresh(txn)
        return txn

    async def update(self, user_id: UUID, transaction_id: int, obj_in: TransactionUpdate) -> Transaction | None:
        txn = await self.get(user_id, transaction_id)
        if not txn:
            return None
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            if field == 'tags':
                setattr(txn, 'tx_metadata', {'tags': value} if value else None)
            else:
                setattr(txn, field, value)
        await self.session.commit()
        await self.session.refresh(txn)
        return txn

    async def delete(self, user_id: UUID, transaction_id: int) -> bool:
        txn = await self.get(user_id, transaction_id)
        if not txn:
            return False
        await self.session.delete(txn)
        await self.session.commit()
        return True
