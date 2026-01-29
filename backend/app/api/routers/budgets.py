
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from ...schemas.budget import BudgetCreate, BudgetUpdate, BudgetRead
from ...services.budgets import BudgetService
from ...repositories.budgets import BudgetRepository
from ...api.deps import get_current_user, get_db

router = APIRouter(prefix='/budgets', tags=['budgets'])

@router.get('/', response_model=list[BudgetRead])
async def list_budgets(month: Optional[date] = None, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = BudgetService(BudgetRepository(db), user_id=user['id'])
    return await service.list_budgets(month)

@router.post('/', response_model=BudgetRead, status_code=status.HTTP_201_CREATED)
async def create_budget(obj_in: BudgetCreate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = BudgetService(BudgetRepository(db), user_id=user['id'])
    return await service.create_budget(obj_in)

@router.get('/{budget_id}', response_model=BudgetRead)
async def get_budget(budget_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = BudgetService(BudgetRepository(db), user_id=user['id'])
    budget = await service.get_budget(budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail='Budget not found')
    return budget

@router.put('/{budget_id}', response_model=BudgetRead)
async def update_budget(budget_id: int, obj_in: BudgetUpdate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = BudgetService(BudgetRepository(db), user_id=user['id'])
    budget = await service.update_budget(budget_id, obj_in)
    if not budget:
        raise HTTPException(status_code=404, detail='Budget not found')
    return budget

@router.delete('/{budget_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(budget_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = BudgetService(BudgetRepository(db), user_id=user['id'])
    success = await service.delete_budget(budget_id)
    if not success:
        raise HTTPException(status_code=404, detail='Budget not found')
    return None
