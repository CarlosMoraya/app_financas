
from fastapi import APIRouter, Depends
from ...api.deps import get_current_user

router = APIRouter(prefix='/users', tags=['users'])

@router.get('/me')
async def read_users_me(user: dict = Depends(get_current_user)):
    return {'id': user.get('id'), 'email': user.get('email')}
