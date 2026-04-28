import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from auth import get_current_user
from database import get_db
from models import Generation, User

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/{generation_id}")
async def create_share_link(
    generation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == user.id,
            Generation.status == "done",
        )
    )
    generation = result.scalar_one_or_none()

    if not generation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found or not ready")

    if not generation.share_token:
        generation.share_token = secrets.token_urlsafe(12)
        await db.commit()
        await db.refresh(generation)

    return {"share_token": generation.share_token}


@router.get("/public/{token}")
async def get_shared_generation(token: str, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(
        select(Generation).where(Generation.share_token == token)
    )
    generation = result.scalar_one_or_none()

    if not generation or not generation.audio_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Track not found")

    return {
        "id": generation.id,
        "prompt": generation.prompt,
        "duration": generation.duration,
        "genre": generation.genre,
        "audio_url": generation.audio_url,
        "created_at": generation.created_at.isoformat(),
    }
