
import asyncio
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.main import app
from app.db.base import Base
from app.db.session import get_session

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

@pytest.fixture(scope='session')
def anyio_backend():
    return 'asyncio'

@pytest.fixture(scope='session')
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope='session', autouse=True)
async def prepare_test_db():
    engine = create_async_engine(DATABASE_URL, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture()
async def db_session():
    engine = create_async_engine(DATABASE_URL, future=True)
    async_session = async_sessionmaker(bind=engine, expire_on_commit=False)
    async with async_session() as session:
        yield session

@pytest.fixture()
async def client(db_session):
    async def override_get_session():
        async with db_session as session:
            yield session
    app.dependency_overrides[get_session] = override_get_session
    async with AsyncClient(app=app, base_url='http://testserver') as c:
        yield c
    app.dependency_overrides.clear()
