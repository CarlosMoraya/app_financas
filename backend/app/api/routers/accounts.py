
from fastapi import APIRouter, Depends, HTTPException, status
from ...schemas.account import AccountCreate, AccountUpdate, AccountRead
from ...services.accounts import AccountService
from ...repositories.accounts import AccountRepository
from ...api.deps import get_current_user, get_db

router = APIRouter(prefix='/accounts', tags=['accounts'])

@router.get('/', response_model=list[AccountRead])
async def list_accounts(user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = AccountService(AccountRepository(db), user_id=user['id'])
    return await service.list_accounts()

@router.post('/', response_model=AccountRead, status_code=status.HTTP_201_CREATED)
async def create_account(obj_in: AccountCreate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = AccountService(AccountRepository(db), user_id=user['id'])
    return await service.create_account(obj_in)

@router.get('/{account_id}', response_model=AccountRead)
async def get_account(account_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = AccountService(AccountRepository(db), user_id=user['id'])
    account = await service.get_account(account_id)
    if not account:
        raise HTTPException(status_code=404, detail='Account not found')
    return account

@router.put('/{account_id}', response_model=AccountRead)
async def update_account(account_id: int, obj_in: AccountUpdate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = AccountService(AccountRepository(db), user_id=user['id'])
    account = await service.update_account(account_id, obj_in)
    if not account:
        raise HTTPException(status_code=404, detail='Account not found')
    return account

@router.delete('/{account_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(account_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = AccountService(AccountRepository(db), user_id=user['id'])
    success = await service.delete_account(account_id)
    if not success:
        raise HTTPException(status_code=404, detail='Account not found')
    return None
