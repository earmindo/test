import pytest
from datetime import datetime, timezone
from httpx import AsyncClient

from models import Generation
from config import settings


@pytest.mark.asyncio
async def test_generation_complete_success(client: AsyncClient, free_user, db):
    gen = Generation(
        id="gen-callback-001",
        user_id=free_user.id,
        prompt="Test",
        duration=30,
        format="mp3",
        status="processing",
        created_at=datetime.now(timezone.utc),
    )
    db.add(gen)
    await db.commit()

    resp = await client.post(
        "/api/v1/internal/generation-complete",
        json={
            "generation_id": "gen-callback-001",
            "status": "done",
            "audio_url": "https://s3.example.com/audio.mp3",
            "stem_urls": None,
            "error_message": None,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        },
        headers={"X-Internal-Secret": settings.jwt_secret},
    )

    assert resp.status_code == 200
    await db.refresh(gen)
    assert gen.status == "done"
    assert gen.audio_url == "https://s3.example.com/audio.mp3"


@pytest.mark.asyncio
async def test_generation_complete_wrong_secret(client: AsyncClient):
    resp = await client.post(
        "/api/v1/internal/generation-complete",
        json={
            "generation_id": "any",
            "status": "done",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        },
        headers={"X-Internal-Secret": "wrong-secret"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_generation_complete_not_found(client: AsyncClient):
    resp = await client.post(
        "/api/v1/internal/generation-complete",
        json={
            "generation_id": "nonexistent",
            "status": "done",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        },
        headers={"X-Internal-Secret": settings.jwt_secret},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
