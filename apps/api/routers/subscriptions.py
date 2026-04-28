import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from auth import get_current_user
from config import settings
from database import get_db
from emails import send_subscription_confirmed
from models import User, Subscription

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

PRICE_MAP = {
    "pro_monthly": lambda: settings.stripe_price_pro_monthly,
    "pro_yearly": lambda: settings.stripe_price_pro_yearly,
    "studio_monthly": lambda: settings.stripe_price_studio_monthly,
    "studio_yearly": lambda: settings.stripe_price_studio_yearly,
}


class CheckoutRequest(BaseModel):
    price_key: str
    success_url: str
    cancel_url: str


class PortalRequest(BaseModel):
    return_url: str


@router.post("/checkout")
async def create_checkout(
    body: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if body.price_key not in PRICE_MAP:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid price key")

    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result.scalar_one_or_none()

    customer_id = sub.stripe_customer_id if sub else None
    if not customer_id:
        customer = stripe.Customer.create(email=user.email, metadata={"user_id": user.id})
        customer_id = customer.id

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": PRICE_MAP[body.price_key](), "quantity": 1}],
        success_url=body.success_url,
        cancel_url=body.cancel_url,
        metadata={"user_id": user.id},
    )

    return {"checkout_url": session.url}


@router.post("/portal")
async def create_billing_portal(
    body: PortalRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result.scalar_one_or_none()

    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No subscription found")

    session = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=body.return_url,
    )

    return {"portal_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        await _handle_checkout_completed(event["data"]["object"], db)
    elif event["type"] in ("customer.subscription.updated", "customer.subscription.deleted"):
        await _handle_subscription_updated(event["data"]["object"], db)

    return {"ok": True}


async def _handle_checkout_completed(session: dict, db: AsyncSession) -> None:
    user_id = session["metadata"]["user_id"]
    customer_id = session["customer"]
    stripe_sub_id = session["subscription"]

    stripe_sub = stripe.Subscription.retrieve(stripe_sub_id)
    price_id = stripe_sub["items"]["data"][0]["price"]["id"]
    plan = _price_to_plan(price_id)

    result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub = result.scalar_one_or_none()

    if sub:
        sub.stripe_customer_id = customer_id
        sub.stripe_subscription_id = stripe_sub_id
        sub.plan = plan
        sub.status = stripe_sub["status"]
    else:
        sub = Subscription(
            user_id=user_id,
            stripe_customer_id=customer_id,
            stripe_subscription_id=stripe_sub_id,
            plan=plan,
            status=stripe_sub["status"],
        )
        db.add(sub)

    result2 = await db.execute(select(User).where(User.id == user_id))
    user = result2.scalar_one_or_none()
    if user:
        user.plan = plan
        try:
            send_subscription_confirmed(user.email, plan)
        except Exception:
            pass

    await db.commit()


async def _handle_subscription_updated(stripe_sub: dict, db: AsyncSession) -> None:
    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub["id"])
    )
    sub = result.scalar_one_or_none()
    if not sub:
        return

    price_id = stripe_sub["items"]["data"][0]["price"]["id"]
    plan = _price_to_plan(price_id) if stripe_sub["status"] == "active" else "free"

    sub.status = stripe_sub["status"]
    sub.plan = plan
    sub.cancel_at_period_end = stripe_sub["cancel_at_period_end"]

    result2 = await db.execute(select(User).where(User.id == sub.user_id))
    user = result2.scalar_one_or_none()
    if user:
        user.plan = plan

    await db.commit()


def _price_to_plan(price_id: str) -> str:
    if price_id in (settings.stripe_price_studio_monthly, settings.stripe_price_studio_yearly):
        return "studio"
    if price_id in (settings.stripe_price_pro_monthly, settings.stripe_price_pro_yearly):
        return "pro"
    return "free"


@router.get("/me")
async def get_my_subscription(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    sub = result.scalar_one_or_none()

    return {
        "plan": user.plan,
        "subscription": {
            "status": sub.status,
            "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
            "cancel_at_period_end": sub.cancel_at_period_end,
        } if sub else None,
    }
