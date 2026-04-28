import hashlib
import hmac
import json
import pytest
from httpx import AsyncClient


def _sign(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def _make_event(event_type: str, user_id: str, entitlements: dict | None = None) -> dict:
    return {
        "event": {
            "type": event_type,
            "app_user_id": user_id,
            "store": "APP_STORE",
            "product_id": "musicai_pro_monthly",
            "subscriber": {
                "entitlements": entitlements or {},
            },
        }
    }


RC_SECRET = "test-rc-secret"


@pytest.fixture(autouse=True)
def set_rc_secret(monkeypatch):
    monkeypatch.setattr("routers.revenuecat.settings.revenuecat_webhook_secret", RC_SECRET)


@pytest.mark.asyncio
async def test_webhook_invalid_signature(client: AsyncClient, free_user):
    body = json.dumps(_make_event("INITIAL_PURCHASE", free_user.id, {"pro": {"is_active": True}})).encode()
    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": "bad-signature", "content-type": "application/json"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_webhook_initial_purchase_pro(client: AsyncClient, free_user, db):
    body = json.dumps(_make_event("INITIAL_PURCHASE", free_user.id, {"pro": {"is_active": True}})).encode()
    sig = _sign(body, RC_SECRET)

    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": sig, "content-type": "application/json"},
    )
    assert resp.status_code == 200
    assert resp.json()["plan"] == "pro"

    await db.refresh(free_user)
    assert free_user.plan == "pro"


@pytest.mark.asyncio
async def test_webhook_initial_purchase_studio(client: AsyncClient, free_user, db):
    body = json.dumps(_make_event("INITIAL_PURCHASE", free_user.id, {"studio": {"is_active": True}})).encode()
    sig = _sign(body, RC_SECRET)

    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": sig, "content-type": "application/json"},
    )
    assert resp.status_code == 200
    assert resp.json()["plan"] == "studio"
    await db.refresh(free_user)
    assert free_user.plan == "studio"


@pytest.mark.asyncio
async def test_webhook_expiration_downgrades_to_free(client: AsyncClient, pro_user, db):
    body = json.dumps(_make_event("EXPIRATION", pro_user.id)).encode()
    sig = _sign(body, RC_SECRET)

    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": sig, "content-type": "application/json"},
    )
    assert resp.status_code == 200
    assert resp.json()["plan"] == "free"
    await db.refresh(pro_user)
    assert pro_user.plan == "free"


@pytest.mark.asyncio
async def test_webhook_cancellation_downgrades_to_free(client: AsyncClient, pro_user, db):
    body = json.dumps(_make_event("CANCELLATION", pro_user.id)).encode()
    sig = _sign(body, RC_SECRET)

    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": sig, "content-type": "application/json"},
    )
    assert resp.status_code == 200
    assert resp.json()["plan"] == "free"


@pytest.mark.asyncio
async def test_webhook_unknown_event_type(client: AsyncClient, free_user):
    body = json.dumps(_make_event("TRANSFER", free_user.id)).encode()
    sig = _sign(body, RC_SECRET)

    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": sig, "content-type": "application/json"},
    )
    assert resp.status_code == 200
    assert resp.json().get("skipped") is True


@pytest.mark.asyncio
async def test_webhook_unknown_user_skipped(client: AsyncClient):
    body = json.dumps(_make_event("INITIAL_PURCHASE", "nonexistent-user-id", {"pro": {"is_active": True}})).encode()
    sig = _sign(body, RC_SECRET)

    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": sig, "content-type": "application/json"},
    )
    assert resp.status_code == 200
    assert resp.json().get("skipped") is True


@pytest.mark.asyncio
async def test_webhook_renewal_keeps_plan(client: AsyncClient, pro_user, db):
    body = json.dumps(_make_event("RENEWAL", pro_user.id, {"pro": {"is_active": True}})).encode()
    sig = _sign(body, RC_SECRET)

    resp = await client.post(
        "/api/v1/revenuecat/webhook",
        content=body,
        headers={"X-RevenueCat-Signature": sig, "content-type": "application/json"},
    )
    assert resp.status_code == 200
    await db.refresh(pro_user)
    assert pro_user.plan == "pro"
