import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from auth import get_current_user
from config import settings
from database import get_db
from models import Generation, User

router = APIRouter(prefix="/generate", tags=["generation"])

PLAN_LIMITS = {
    "free": {"per_day": 3, "max_duration": 30, "stems": False},
    "pro": {"per_day": None, "max_duration": 120, "stems": False},
    "studio": {"per_day": None, "max_duration": 120, "stems": True},
}


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)
    duration: int = Field(30, ge=5, le=120)
    genre: str | None = None
    bpm: int | None = Field(None, ge=60, le=200)
    format: str = "mp3"
    stems: bool = False


class GenerateResponse(BaseModel):
    generation_id: str
    status: str


async def _submit_to_worker(generation_id: str, request: GenerateRequest) -> None:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{settings.ai_worker_url}/infer",
                json={
                    "generation_id": generation_id,
                    "prompt": request.prompt,
                    "duration": request.duration,
                    "genre": request.genre,
                    "bpm": request.bpm,
                    "format": request.format,
                    "stems": request.stems,
                },
            )
    except Exception:
        pass


@router.post("", response_model=GenerateResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_generation(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GenerateResponse:
    limits = PLAN_LIMITS[user.plan]

    # Reset compteur journalier si besoin
    now = datetime.now(timezone.utc)
    if user.generations_reset_at.date() < now.date():
        user.generations_today = 0
        user.generations_reset_at = now

    # Vérification quota
    if limits["per_day"] is not None and user.generations_today >= limits["per_day"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily limit reached ({limits['per_day']} generations). Upgrade your plan.",
        )

    # Vérification durée
    if request.duration > limits["max_duration"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Max duration for {user.plan} plan is {limits['max_duration']}s.",
        )

    # Vérification stems
    if request.stems and not limits["stems"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Stems are only available on the Studio plan.",
        )

    generation = Generation(
        user_id=user.id,
        prompt=request.prompt,
        duration=request.duration,
        genre=request.genre,
        bpm=request.bpm,
        format=request.format,
        stems=request.stems,
        status="pending",
    )
    db.add(generation)
    user.generations_today += 1
    await db.commit()
    await db.refresh(generation)

    background_tasks.add_task(_submit_to_worker, generation.id, request)

    return GenerateResponse(generation_id=generation.id, status="pending")


@router.get("/{generation_id}")
async def get_generation(
    generation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == user.id,
        )
    )
    generation = result.scalar_one_or_none()
    if not generation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found")

    return {
        "id": generation.id,
        "prompt": generation.prompt,
        "status": generation.status,
        "audio_url": generation.audio_url,
        "stem_urls": generation.stem_urls,
        "created_at": generation.created_at.isoformat(),
        "completed_at": generation.completed_at.isoformat() if generation.completed_at else None,
    }


@router.get("")
async def list_generations(
    page: int = 1,
    per_page: int = 20,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    offset = (page - 1) * per_page
    result = await db.execute(
        select(Generation)
        .where(Generation.user_id == user.id)
        .order_by(Generation.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    generations = result.scalars().all()

    return {
        "items": [
            {
                "id": g.id,
                "prompt": g.prompt,
                "status": g.status,
                "audio_url": g.audio_url,
                "created_at": g.created_at.isoformat(),
            }
            for g in generations
        ],
        "page": page,
        "per_page": per_page,
    }
