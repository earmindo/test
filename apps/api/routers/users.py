from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "plan": user.plan,
        "generations_today": user.generations_today,
        "created_at": user.created_at.isoformat(),
    }
