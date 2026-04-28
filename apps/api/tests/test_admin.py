import pytest
from datetime import datetime, timezone
from httpx import AsyncClient

from models import Generation
from config import settings


def _auth_headers() -> dict:
    return {"X-Admin-Secret": settings.admin_secret or "test-admin-secret"}


@pytest.fixture(autouse=True)
def set_admin_secret(monkeypatch):
    """Ensure admin_secret is set for all admin tests."""
    if not settings.admin_secret:
        monkeypatch.setattr(settings, "admin_secret", "test-admin-secret")


@pytest.mark.asyncio
async def test_stats_unauthorized(client: AsyncClient):
    resp = await client.get("/api/v1/admin/stats", headers={"X-Admin-Secret": "wrong"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_stats_no_header(client: AsyncClient):
    resp = await client.get("/api/v1/admin/stats")
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_stats_ok(client: AsyncClient, free_user, pro_user):
    resp = await client.get("/api/v1/admin/stats", headers=_auth_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert "users" in data
    assert "generations" in data
    assert "popular_genres" in data
    assert data["users"]["total"] == 2
    assert "free" in data["users"]["by_plan"]
    assert "pro" in data["users"]["by_plan"]


@pytest.mark.asyncio
async def test_stats_success_rate(client: AsyncClient, free_user, db):
    now = datetime.now(timezone.utc)
    db.add(Generation(id="g1", user_id=free_user.id, prompt="p", duration=30, format="mp3", status="done", created_at=now))
    db.add(Generation(id="g2", user_id=free_user.id, prompt="p", duration=30, format="mp3", status="failed", created_at=now))
    db.add(Generation(id="g3", user_id=free_user.id, prompt="p", duration=30, format="mp3", status="done", created_at=now))
    await db.commit()

    resp = await client.get("/api/v1/admin/stats", headers=_auth_headers())
    data = resp.json()
    assert data["generations"]["total"] == 3
    assert data["generations"]["failed"] == 1
    assert round(data["generations"]["success_rate"]) == 67


@pytest.mark.asyncio
async def test_list_users_ok(client: AsyncClient, free_user, pro_user):
    resp = await client.get("/api/v1/admin/users", headers=_auth_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_list_users_filter_by_plan(client: AsyncClient, free_user, pro_user):
    resp = await client.get("/api/v1/admin/users?plan=free", headers=_auth_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert all(u["plan"] == "free" for u in data["items"])


@pytest.mark.asyncio
async def test_list_generations_admin(client: AsyncClient, free_user, db):
    now = datetime.now(timezone.utc)
    for i in range(3):
        db.add(Generation(
            id=f"gadmin-{i}", user_id=free_user.id, prompt=f"Track {i}",
            duration=30, format="mp3", status="done", created_at=now,
        ))
    await db.commit()

    resp = await client.get("/api/v1/admin/generations", headers=_auth_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_list_generations_filter_status(client: AsyncClient, free_user, db):
    now = datetime.now(timezone.utc)
    db.add(Generation(id="g-done", user_id=free_user.id, prompt="p", duration=30, format="mp3", status="done", created_at=now))
    db.add(Generation(id="g-fail", user_id=free_user.id, prompt="p", duration=30, format="mp3", status="failed", created_at=now))
    await db.commit()

    resp = await client.get("/api/v1/admin/generations?status_filter=done", headers=_auth_headers())
    data = resp.json()
    assert all(g["status"] == "done" for g in data["items"])
