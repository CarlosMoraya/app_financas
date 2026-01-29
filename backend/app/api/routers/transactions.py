
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from ...schemas.transaction import TransactionCreate, TransactionUpdate, TransactionRead
from ...services.transactions import TransactionService
from ...repositories.transactions import TransactionRepository
from ...api.deps import get_current_user, get_db

router = APIRouter(prefix='/transactions', tags=['transactions'])

@router.get('/', response_model=list[TransactionRead])
async def list_transactions(start_date: Optional[date] = None, end_date: Optional[date] = None, account_id: Optional[int] = None, category_id: Optional[int] = None, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = TransactionService(TransactionRepository(db), user_id=user['id'])
    return await service.list_transactions(start_date, end_date, account_id, category_id)

@router.post('/', response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(obj_in: TransactionCreate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = TransactionService(TransactionRepository(db), user_id=user['id'])
    return await service.create_transaction(obj_in)

@router.get('/{transaction_id}', response_model=TransactionRead)
async def get_transaction(transaction_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = TransactionService(TransactionRepository(db), user_id=user['id'])
    txn = await service.get_transaction(transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail='Transaction not found')
    return txn

@router.put('/{transaction_id}', response_model=TransactionRead)
async def update_transaction(transaction_id: int, obj_in: TransactionUpdate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = TransactionService(TransactionRepository(db), user_id=user['id'])
    txn = await service.update_transaction(transaction_id, obj_in)
    if not txn:
        raise HTTPException(status_code=404, detail='Transaction not found')
    return txn

@router.delete('/{transaction_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(transaction_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = TransactionService(TransactionRepository(db), user_id=user['id'])
    success = await service.delete_transaction(transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail='Transaction not found')
    return None
