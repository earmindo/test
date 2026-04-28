import boto3
from pathlib import Path

from config import settings

_s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region,
)


def upload_audio(local_path: str, s3_key: str) -> str:
    """Upload un fichier audio sur S3 et retourne son URL publique."""
    _s3.upload_file(
        local_path,
        settings.aws_bucket_name,
        s3_key,
        ExtraArgs={"ContentType": _content_type(local_path)},
    )
    return f"https://{settings.aws_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"


def _content_type(path: str) -> str:
    ext = Path(path).suffix.lower()
    return {"mp3": "audio/mpeg", "wav": "audio/wav", "flac": "audio/flac"}.get(ext.lstrip("."), "audio/mpeg")
