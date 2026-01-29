
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configurações globais carregadas de variáveis de ambiente."""
    database_url: str = Field(..., env="DATABASE_URL")
    supabase_jwks_url: str = Field(..., env="SUPABASE_JWKS_URL")
    supabase_jwt_audience: str = Field(..., env="SUPABASE_JWT_AUDIENCE")
    allowed_origins: str = Field('*', env="ALLOWED_ORIGINS")

    class Config:
        env_file = '.env'
        case_sensitive = True

@lru_cache
def get_settings() -> 'Settings':
    return Settings()
