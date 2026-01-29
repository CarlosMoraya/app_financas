
from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..core.security import decode_jwt
from ..db.session import get_session

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not authenticated')
    token = credentials.credentials
    try:
        payload = await decode_jwt(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
    return {'id': payload.get('sub'), 'email': payload.get('email')}

async def get_db() -> AsyncGenerator:
    async for session in get_session():
        yield session
