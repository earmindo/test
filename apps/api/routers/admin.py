from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from config import settings
from database import get_db
from models import User, Generation, Subscription

router = APIRouter(prefix="/admin", tags=["admin"])


def _verify_admin(x_admin_secret: str = Header(...)) -> None:
    if not settings.admin_secret or x_admin_secret != settings.admin_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


@router.get("/stats", dependencies=[Depends(_verify_admin)])
async def get_stats(db: AsyncSession = Depends(get_db)) -> dict:
    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)
    last_30d = now - timedelta(days=30)

    # Utilisateurs
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()
    new_24h = (await db.execute(
        select(func.count()).where(User.created_at >= last_24h)
    )).scalar()
    new_7d = (await db.execute(
        select(func.count()).where(User.created_at >= last_7d)
    )).scalar()

    # Plans
    plan_counts = (await db.execute(
        select(User.plan, func.count()).group_by(User.plan)
    )).all()

    # Générations
    total_gens = (await db.execute(select(func.count()).select_from(Generation))).scalar()
    gens_24h = (await db.execute(
        select(func.count()).where(Generation.created_at >= last_24h)
    )).scalar()
    gens_7d = (await db.execute(
        select(func.count()).where(Generation.created_at >= last_7d)
    )).scalar()
    gens_done = (await db.execute(
        select(func.count()).where(Generation.status == "done")
    )).scalar()
    gens_failed = (await db.execute(
        select(func.count()).where(Generation.status == "failed")
    )).scalar()

    # Genres populaires
    popular_genres = (await db.execute(
        select(Generation.genre, func.count().label("count"))
        .where(and_(Generation.genre.isnot(None), Generation.created_at >= last_30d))
        .group_by(Generation.genre)
        .order_by(func.count().desc())
        .limit(5)
    )).all()

    return {
        "users": {
            "total": total_users,
            "new_24h": new_24h,
            "new_7d": new_7d,
            "by_plan": {row[0]: row[1] for row in plan_counts},
        },
        "generations": {
            "total": total_gens,
            "last_24h": gens_24h,
            "last_7d": gens_7d,
            "success_rate": round(gens_done / max(total_gens, 1) * 100, 1),
            "failed": gens_failed,
        },
        "popular_genres": [{"genre": row[0], "count": row[1]} for row in popular_genres],
    }


@router.get("/users", dependencies=[Depends(_verify_admin)])
async def list_users(
    page: int = 1,
    per_page: int = 50,
    plan: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    query = select(User).order_by(User.created_at.desc())
    if plan:
        query = query.where(User.plan == plan)

    total = (await db.execute(select(func.count()).select_from(
        query.subquery()
    ))).scalar()

    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    users = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "plan": u.plan,
                "generations_today": u.generations_today,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
    }


@router.get("/generations", dependencies=[Depends(_verify_admin)])
async def list_generations(
    page: int = 1,
    per_page: int = 50,
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    query = select(Generation).order_by(Generation.created_at.desc())
    if status_filter:
        query = query.where(Generation.status == status_filter)

    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    gens = result.scalars().all()

    return {
        "page": page,
        "items": [
            {
                "id": g.id,
                "user_id": g.user_id,
                "prompt": g.prompt[:80],
                "status": g.status,
                "duration": g.duration,
                "genre": g.genre,
                "created_at": g.created_at.isoformat(),
            }
            for g in gens
        ],
    }
