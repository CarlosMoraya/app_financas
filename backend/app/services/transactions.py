
from uuid import UUID
from typing import List, Optional
from datetime import date
from ..schemas.transaction import TransactionCreate, TransactionUpdate, TransactionRead
from ..repositories.transactions import TransactionRepository

class TransactionService:
    def __init__(self, repo: TransactionRepository, user_id: UUID):
        self.repo = repo
        self.user_id = user_id

    async def list_transactions(self, start_date: Optional[date] = None, end_date: Optional[date] = None, account_id: Optional[int] = None, category_id: Optional[int] = None) -> List[TransactionRead]:
        txns = await self.repo.list(self.user_id, start_date, end_date, account_id, category_id)
        return [TransactionRead.model_validate(t) for t in txns]

    async def get_transaction(self, transaction_id: int) -> TransactionRead | None:
        txn = await self.repo.get(self.user_id, transaction_id)
        if not txn:
            return None
        return TransactionRead.model_validate(txn)

    async def create_transaction(self, obj_in: TransactionCreate) -> TransactionRead:
        txn = await self.repo.create(self.user_id, obj_in)
        return TransactionRead.model_validate(txn)

    async def update_transaction(self, transaction_id: int, obj_in: TransactionUpdate) -> TransactionRead | None:
        txn = await self.repo.update(self.user_id, transaction_id, obj_in)
        if not txn:
            return None
        return TransactionRead.model_validate(txn)

    async def delete_transaction(self, transaction_id: int) -> bool:
        return await self.repo.delete(self.user_id, transaction_id)
