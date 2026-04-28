import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from database import Base, get_db
from main import app
from models import User

TEST_DB = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(TEST_DB, echo=False)
SessionTest = async_sessionmaker(engine_test, expire_on_commit=False)


async def override_get_db():
    async with SessionTest() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def db() -> AsyncSession:
    async with SessionTest() as session:
        yield session


@pytest_asyncio.fixture
async def free_user(db: AsyncSession) -> User:
    from datetime import datetime, timezone
    user = User(
        id="user-free-001",
        email="free@test.com",
        name="Free User",
        plan="free",
        generations_today=0,
        generations_reset_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture
async def pro_user(db: AsyncSession) -> User:
    from datetime import datetime, timezone
    user = User(
        id="user-pro-001",
        email="pro@test.com",
        name="Pro User",
        plan="pro",
        generations_today=0,
        generations_reset_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
