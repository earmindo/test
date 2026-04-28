import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

from models import User, Generation
from tests.conftest import override_get_db
from main import app
import auth


def _mock_auth(user: User):
    """Injecte un user mock dans la dépendance auth."""
    async def _get_user():
        return user
    app.dependency_overrides[auth.get_current_user] = _get_user


@pytest.mark.asyncio
async def test_create_generation_free_user(client: AsyncClient, free_user: User, db):
    _mock_auth(free_user)

    with patch("routers.generate._submit_to_worker", new_callable=AsyncMock):
        resp = await client.post("/api/v1/generate", json={
            "prompt": "Chill lo-fi hip hop beats",
            "duration": 30,
        })

    assert resp.status_code == 202
    data = resp.json()
    assert data["status"] == "pending"
    assert "generation_id" in data


@pytest.mark.asyncio
async def test_free_user_duration_limit(client: AsyncClient, free_user: User):
    _mock_auth(free_user)

    resp = await client.post("/api/v1/generate", json={
        "prompt": "Epic orchestral music",
        "duration": 60,  # dépasse la limite free (30s)
    })

    assert resp.status_code == 400
    assert "30" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_free_user_daily_quota(client: AsyncClient, free_user: User, db):
    free_user.generations_today = 3  # quota atteint
    await db.commit()
    _mock_auth(free_user)

    resp = await client.post("/api/v1/generate", json={
        "prompt": "Some music",
        "duration": 20,
    })

    assert resp.status_code == 429
    assert "Daily limit" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_pro_user_no_duration_limit(client: AsyncClient, pro_user: User):
    _mock_auth(pro_user)

    with patch("routers.generate._submit_to_worker", new_callable=AsyncMock):
        resp = await client.post("/api/v1/generate", json={
            "prompt": "Long ambient journey",
            "duration": 120,  # max autorisé pour pro
        })

    assert resp.status_code == 202


@pytest.mark.asyncio
async def test_free_user_no_stems(client: AsyncClient, free_user: User):
    _mock_auth(free_user)

    resp = await client.post("/api/v1/generate", json={
        "prompt": "Rock music",
        "duration": 20,
        "stems": True,
    })

    assert resp.status_code == 403
    assert "Studio" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_get_generation(client: AsyncClient, free_user: User, db):
    _mock_auth(free_user)
    from datetime import datetime, timezone

    gen = Generation(
        id="gen-001",
        user_id=free_user.id,
        prompt="Test prompt",
        duration=30,
        format="mp3",
        status="done",
        audio_url="https://example.com/audio.mp3",
        created_at=datetime.now(timezone.utc),
    )
    db.add(gen)
    await db.commit()

    resp = await client.get("/api/v1/generate/gen-001")
    assert resp.status_code == 200
    assert resp.json()["audio_url"] == "https://example.com/audio.mp3"


@pytest.mark.asyncio
async def test_get_generation_not_found(client: AsyncClient, free_user: User):
    _mock_auth(free_user)
    resp = await client.get("/api/v1/generate/does-not-exist")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_generations(client: AsyncClient, free_user: User, db):
    _mock_auth(free_user)
    from datetime import datetime, timezone

    for i in range(3):
        db.add(Generation(
            id=f"gen-{i}",
            user_id=free_user.id,
            prompt=f"Track {i}",
            duration=30,
            format="mp3",
            status="done",
            created_at=datetime.now(timezone.utc),
        ))
    await db.commit()

    resp = await client.get("/api/v1/generate")
    assert resp.status_code == 200
    assert len(resp.json()["items"]) == 3
