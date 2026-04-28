from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import get_db
from models import Generation

router = APIRouter(prefix="/internal", tags=["internal"])


class GenerationCompletePayload(BaseModel):
    generation_id: str
    status: str
    audio_url: str | None = None
    stem_urls: dict | None = None
    error_message: str | None = None
    completed_at: str


def _verify_internal(x_internal_secret: str = Header(...)) -> None:
    if x_internal_secret != settings.jwt_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


@router.post("/generation-complete", dependencies=[Depends(_verify_internal)])
async def generation_complete(
    payload: GenerationCompletePayload,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Generation).where(Generation.id == payload.generation_id))
    generation = result.scalar_one_or_none()

    if not generation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")

    generation.status = payload.status
    generation.audio_url = payload.audio_url
    generation.stem_urls = payload.stem_urls
    generation.error_message = payload.error_message
    generation.completed_at = datetime.fromisoformat(payload.completed_at)

    await db.commit()
    return {"ok": True}
