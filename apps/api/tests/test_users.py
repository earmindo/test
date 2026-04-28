import pytest
from httpx import AsyncClient

from models import User
from main import app
import auth


def _mock_auth(user: User):
    async def _get_user():
        return user
    app.dependency_overrides[auth.get_current_user] = _get_user


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, free_user: User):
    _mock_auth(free_user)
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "free@test.com"
    assert data["plan"] == "free"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 403  # HTTPBearer renvoie 403 sans token
