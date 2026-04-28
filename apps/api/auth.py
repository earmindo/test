from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import get_db
from models import User

bearer = HTTPBearer()
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        supabase_user = response.user
        if not supabase_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == supabase_user.id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=supabase_user.id,
            email=supabase_user.email,
            name=supabase_user.user_metadata.get("full_name"),
            avatar_url=supabase_user.user_metadata.get("avatar_url"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
