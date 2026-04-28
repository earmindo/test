from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from database import get_db
from emails import send_generation_complete
from models import Generation, User

router = APIRouter(prefix="/internal", tags=["internal"])


class GenerationCompletePayload(BaseModel):
    generation_id: str
    status: str
    audio_url: str | None = None
    stem_urls: dict | None = None
    error_message: str | None = None
    completed_at: str


def _verify_internal(x_internal_secret: str = Header(...)) -> None:
    if x_internal_secret != settings.effective_internal_secret:
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

    # Envoyer l'email de notification si succès
    if payload.status == "done" and payload.audio_url:
        user_result = await db.execute(select(User).where(User.id == generation.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            try:
                send_generation_complete(user.email, generation.prompt, payload.audio_url)
            except Exception:
                pass

    return {"ok": True}
