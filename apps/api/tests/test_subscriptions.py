import pytest
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock
from httpx import AsyncClient

from models import Subscription
import auth
from main import app


def _mock_auth(user):
    async def _get_user():
        return user
    app.dependency_overrides[auth.get_current_user] = _get_user


def _make_stripe_sub(price_id: str, status: str = "active") -> MagicMock:
    sub = MagicMock()
    sub.__getitem__ = lambda self, key: {
        "status": status,
        "cancel_at_period_end": False,
        "items": {"data": [{"price": {"id": price_id}}]},
    }[key]
    return sub


@pytest.mark.asyncio
async def test_get_subscription_no_sub(client: AsyncClient, free_user):
    _mock_auth(free_user)
    resp = await client.get("/api/v1/subscriptions/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["plan"] == "free"
    assert data["subscription"] is None


@pytest.mark.asyncio
async def test_get_subscription_with_sub(client: AsyncClient, pro_user, db):
    _mock_auth(pro_user)
    sub = Subscription(
        user_id=pro_user.id,
        stripe_customer_id="cus_xxx",
        stripe_subscription_id="sub_xxx",
        plan="pro",
        status="active",
    )
    db.add(sub)
    await db.commit()

    resp = await client.get("/api/v1/subscriptions/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["plan"] == "pro"
    assert data["subscription"]["status"] == "active"
    assert data["subscription"]["cancel_at_period_end"] is False


@pytest.mark.asyncio
async def test_checkout_invalid_price_key(client: AsyncClient, free_user):
    _mock_auth(free_user)
    resp = await client.post("/api/v1/subscriptions/checkout", json={
        "price_key": "invalid_key",
        "success_url": "https://app.com/success",
        "cancel_url": "https://app.com/cancel",
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_checkout_creates_session(client: AsyncClient, free_user):
    _mock_auth(free_user)

    mock_customer = MagicMock()
    mock_customer.id = "cus_new"
    mock_session = MagicMock()
    mock_session.url = "https://checkout.stripe.com/session_abc"

    with patch("routers.subscriptions.stripe.Customer.create", return_value=mock_customer), \
         patch("routers.subscriptions.stripe.checkout.Session.create", return_value=mock_session):
        resp = await client.post("/api/v1/subscriptions/checkout", json={
            "price_key": "pro_monthly",
            "success_url": "https://app.com/success",
            "cancel_url": "https://app.com/cancel",
        })

    assert resp.status_code == 200
    assert resp.json()["checkout_url"] == "https://checkout.stripe.com/session_abc"


@pytest.mark.asyncio
async def test_portal_no_subscription(client: AsyncClient, free_user):
    _mock_auth(free_user)
    resp = await client.post("/api/v1/subscriptions/portal", json={"return_url": "https://app.com"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_portal_returns_url(client: AsyncClient, pro_user, db):
    _mock_auth(pro_user)
    sub = Subscription(
        user_id=pro_user.id,
        stripe_customer_id="cus_portal",
        stripe_subscription_id="sub_portal",
        plan="pro",
        status="active",
    )
    db.add(sub)
    await db.commit()

    mock_session = MagicMock()
    mock_session.url = "https://billing.stripe.com/portal_abc"

    with patch("routers.subscriptions.stripe.billing_portal.Session.create", return_value=mock_session):
        resp = await client.post("/api/v1/subscriptions/portal", json={"return_url": "https://app.com"})

    assert resp.status_code == 200
    assert resp.json()["portal_url"] == "https://billing.stripe.com/portal_abc"


@pytest.mark.asyncio
async def test_webhook_invalid_signature(client: AsyncClient):
    import stripe
    with patch("routers.subscriptions.stripe.Webhook.construct_event",
               side_effect=stripe.error.SignatureVerificationError("bad sig", "sig")):
        resp = await client.post(
            "/api/v1/subscriptions/webhook",
            content=b'{"type":"checkout.session.completed"}',
            headers={"stripe-signature": "bad"},
        )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_webhook_checkout_completed_upgrades_user(client: AsyncClient, free_user, db):
    from config import settings

    price_id = settings.stripe_price_pro_monthly
    stripe_sub = _make_stripe_sub(price_id)

    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "metadata": {"user_id": free_user.id},
                "customer": "cus_wh",
                "subscription": "sub_wh",
            }
        }
    }

    with patch("routers.subscriptions.stripe.Webhook.construct_event", return_value=event), \
         patch("routers.subscriptions.stripe.Subscription.retrieve", return_value=stripe_sub):
        resp = await client.post(
            "/api/v1/subscriptions/webhook",
            content=b"{}",
            headers={"stripe-signature": "valid"},
        )

    assert resp.status_code == 200
    await db.refresh(free_user)
    assert free_user.plan == "pro"


@pytest.mark.asyncio
async def test_webhook_subscription_canceled_downgrades_user(client: AsyncClient, pro_user, db):
    from config import settings

    sub = Subscription(
        user_id=pro_user.id,
        stripe_customer_id="cus_cancel",
        stripe_subscription_id="sub_cancel",
        plan="pro",
        status="active",
    )
    db.add(sub)
    await db.commit()

    canceled_sub = {
        "id": "sub_cancel",
        "status": "canceled",
        "cancel_at_period_end": False,
        "items": {"data": [{"price": {"id": settings.stripe_price_pro_monthly}}]},
    }

    event = {"type": "customer.subscription.deleted", "data": {"object": canceled_sub}}

    with patch("routers.subscriptions.stripe.Webhook.construct_event", return_value=event):
        resp = await client.post(
            "/api/v1/subscriptions/webhook",
            content=b"{}",
            headers={"stripe-signature": "valid"},
        )

    assert resp.status_code == 200
    await db.refresh(pro_user)
    assert pro_user.plan == "free"
