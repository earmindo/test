import os
import httpx
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from config import settings
from model import generate_audio, load_model
from storage import upload_audio

app = FastAPI(title="MusicAI Worker", docs_url="/docs")


class InferRequest(BaseModel):
    generation_id: str
    prompt: str
    duration: int = 30
    genre: str | None = None
    bpm: int | None = None
    format: str = "mp3"
    stems: bool = False


@app.on_event("startup")
async def startup():
    load_model()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/infer")
async def infer(request: InferRequest) -> dict:
    try:
        result = generate_audio(
            prompt=request.prompt,
            duration=request.duration,
            genre=request.genre,
            bpm=request.bpm,
            format=request.format,
            stems=request.stems,
        )
    except Exception as e:
        await _notify_api(request.generation_id, status="failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    # Upload audio principal
    s3_key = f"generations/{request.generation_id}/audio.{request.format}"
    audio_url = upload_audio(result["audio"], s3_key)

    # Upload stems si présents
    stem_urls: dict[str, str] | None = None
    if request.stems and "stems" in result:
        stem_urls = {}
        for stem_name, stem_path in result["stems"].items():
            stem_key = f"generations/{request.generation_id}/stems/{stem_name}.wav"
            stem_urls[stem_name] = upload_audio(stem_path, stem_key)

    await _notify_api(
        request.generation_id,
        status="done",
        audio_url=audio_url,
        stem_urls=stem_urls,
    )

    return {"generation_id": request.generation_id, "status": "done", "audio_url": audio_url}


async def _notify_api(
    generation_id: str,
    status: str,
    audio_url: str | None = None,
    stem_urls: dict | None = None,
    error: str | None = None,
) -> None:
    payload = {
        "generation_id": generation_id,
        "status": status,
        "audio_url": audio_url,
        "stem_urls": stem_urls,
        "error_message": error,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(
            f"{settings.api_url}/api/v1/internal/generation-complete",
            json=payload,
            headers={"X-Internal-Secret": settings.api_internal_secret},
        )
