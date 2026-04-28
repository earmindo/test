import pytest
from datetime import datetime, timezone
from httpx import AsyncClient

from models import Generation
import auth
from main import app


def _mock_auth(user):
    async def _get_user():
        return user
    app.dependency_overrides[auth.get_current_user] = _get_user


@pytest.mark.asyncio
async def test_create_share_link(client: AsyncClient, free_user, db):
    _mock_auth(free_user)
    gen = Generation(
        id="gen-share-001",
        user_id=free_user.id,
        prompt="Lo-fi beats",
        duration=30,
        format="mp3",
        status="done",
        audio_url="https://s3.example.com/audio.mp3",
        created_at=datetime.now(timezone.utc),
    )
    db.add(gen)
    await db.commit()

    resp = await client.post("/api/v1/share/gen-share-001")
    assert resp.status_code == 200
    data = resp.json()
    assert "share_token" in data
    assert len(data["share_token"]) > 0


@pytest.mark.asyncio
async def test_create_share_link_idempotent(client: AsyncClient, free_user, db):
    """Same token returned on second call."""
    _mock_auth(free_user)
    gen = Generation(
        id="gen-share-002",
        user_id=free_user.id,
        prompt="Jazz",
        duration=30,
        format="mp3",
        status="done",
        audio_url="https://s3.example.com/audio.mp3",
        created_at=datetime.now(timezone.utc),
    )
    db.add(gen)
    await db.commit()

    r1 = await client.post("/api/v1/share/gen-share-002")
    r2 = await client.post("/api/v1/share/gen-share-002")
    assert r1.json()["share_token"] == r2.json()["share_token"]


@pytest.mark.asyncio
async def test_create_share_link_not_done(client: AsyncClient, free_user, db):
    """Pending generation cannot be shared."""
    _mock_auth(free_user)
    gen = Generation(
        id="gen-share-003",
        user_id=free_user.id,
        prompt="Ambient",
        duration=30,
        format="mp3",
        status="pending",
        created_at=datetime.now(timezone.utc),
    )
    db.add(gen)
    await db.commit()

    resp = await client.post("/api/v1/share/gen-share-003")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_share_link_wrong_user(client: AsyncClient, free_user, pro_user, db):
    """Cannot share another user's generation."""
    _mock_auth(free_user)
    gen = Generation(
        id="gen-share-004",
        user_id=pro_user.id,
        prompt="Rock",
        duration=30,
        format="mp3",
        status="done",
        audio_url="https://s3.example.com/audio.mp3",
        created_at=datetime.now(timezone.utc),
    )
    db.add(gen)
    await db.commit()

    resp = await client.post("/api/v1/share/gen-share-004")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_shared_generation(client: AsyncClient, free_user, db):
    gen = Generation(
        id="gen-share-005",
        user_id=free_user.id,
        prompt="Electronic vibes",
        duration=60,
        genre="electronic",
        format="mp3",
        status="done",
        audio_url="https://s3.example.com/audio.mp3",
        share_token="tok-abc123",
        created_at=datetime.now(timezone.utc),
    )
    db.add(gen)
    await db.commit()

    resp = await client.get("/api/v1/share/public/tok-abc123")
    assert resp.status_code == 200
    data = resp.json()
    assert data["prompt"] == "Electronic vibes"
    assert data["duration"] == 60
    assert data["genre"] == "electronic"
    assert data["audio_url"] == "https://s3.example.com/audio.mp3"


@pytest.mark.asyncio
async def test_get_shared_generation_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/share/public/nonexistent-token")
    assert resp.status_code == 404
