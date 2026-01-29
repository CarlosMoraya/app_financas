
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from ..core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.database_url, pool_pre_ping=True, future=True)

async_session = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
