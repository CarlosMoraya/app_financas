
import time
from functools import lru_cache
from typing import Any, Dict

import httpx
import jwt
from jwt import PyJWKClient

from .config import get_settings

JWKS_CACHE: Dict[str, Any] = {}
CACHE_EXPIRATION = 300  # segundos

async def get_jwks_client() -> PyJWKClient:
    settings = get_settings()
    url = settings.supabase_jwks_url
    now = time.time()
    cached = JWKS_CACHE.get(url)
    if cached and now - cached['timestamp'] < CACHE_EXPIRATION:
        return cached['client']
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        jwks_data = resp.json()
    jwk_client = PyJWKClient.from_jwks_data(jwks_data)
    JWKS_CACHE[url] = {'client': jwk_client, 'timestamp': now}
    return jwk_client

async def decode_jwt(token: str) -> Dict[str, Any]:
    settings = get_settings()
    jwk_client = await get_jwks_client()
    signing_key = jwk_client.get_signing_key_from_jwt(token)
    data = jwt.decode(token, signing_key.key, audience=settings.supabase_jwt_audience, algorithms=['RS256'])
    return data
