import hashlib
import hmac
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import get_db
from models import User, Subscription

router = APIRouter(prefix="/revenuecat", tags=["revenuecat"])

# Types d'événements RevenueCat qui changent le plan
SUBSCRIPTION_EVENTS = {
    "INITIAL_PURCHASE",
    "RENEWAL",
    "PRODUCT_CHANGE",
    "EXPIRATION",
    "CANCELLATION",
    "BILLING_ISSUE",
}

ENTITLEMENT_TO_PLAN = {
    "studio": "studio",
    "pro": "pro",
}


def _verify_signature(body: bytes, signature: str) -> bool:
    expected = hmac.new(
        settings.revenuecat_webhook_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhook")
async def revenuecat_webhook(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    body = await request.body()
    signature = request.headers.get("X-RevenueCat-Signature", "")

    if settings.revenuecat_webhook_secret and not _verify_signature(body, signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    payload = await request.json()
    event = payload.get("event", {})
    event_type = event.get("type")

    if event_type not in SUBSCRIPTION_EVENTS:
        return {"ok": True, "skipped": True}

    app_user_id: str | None = event.get("app_user_id")
    if not app_user_id:
        return {"ok": True, "skipped": True}

    # Déterminer le nouveau plan depuis les entitlements actifs
    subscriber = payload.get("event", {}).get("subscriber", {})
    active_entitlements: dict = subscriber.get("entitlements", {})
    new_plan = _resolve_plan(active_entitlements, event_type)

    result = await db.execute(select(User).where(User.id == app_user_id))
    user = result.scalar_one_or_none()

    if not user:
        return {"ok": True, "skipped": True}

    user.plan = new_plan

    # Mettre à jour ou créer la subscription
    result2 = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result2.scalar_one_or_none()

    store = event.get("store", "")
    product_id = event.get("product_id", "")

    if sub:
        sub.plan = new_plan
        sub.status = "active" if new_plan != "free" else "canceled"
    else:
        sub = Subscription(
            user_id=user.id,
            stripe_customer_id=f"rc_{app_user_id}",  # placeholder pour les achats mobile
            plan=new_plan,
            status="active" if new_plan != "free" else "canceled",
        )
        db.add(sub)

    await db.commit()
    return {"ok": True, "plan": new_plan}


def _resolve_plan(entitlements: dict, event_type: str) -> str:
    if event_type in ("EXPIRATION", "CANCELLATION", "BILLING_ISSUE"):
        return "free"

    for entitlement_id, data in entitlements.items():
        if data.get("is_active"):
            plan = ENTITLEMENT_TO_PLAN.get(entitlement_id.lower())
            if plan:
                return plan

    return "free"
