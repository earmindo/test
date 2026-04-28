import os
import tempfile
import torch
from huggingface_hub import snapshot_download

from config import settings

_pipeline = None


def load_model():
    """Charge le pipeline ACE-Step 1.5 en mémoire (une seule fois au démarrage)."""
    global _pipeline

    if _pipeline is not None:
        return _pipeline

    # ACE-Step utilise son propre pipeline disponible via HuggingFace
    # Le repo officiel : https://huggingface.co/ACE-Step/ACE-Step-v1-3.5B
    try:
        from acestep.pipeline_ace_step import ACEStepPipeline

        model_path = snapshot_download(repo_id=settings.model_id)
        _pipeline = ACEStepPipeline.from_pretrained(model_path)
        _pipeline = _pipeline.to(settings.device)
        print(f"[ACE-Step] Modèle chargé sur {settings.device}")
    except ImportError:
        print("[ACE-Step] Package non installé, mode simulation activé")
        _pipeline = "mock"

    return _pipeline


def generate_audio(
    prompt: str,
    duration: int = 30,
    genre: str | None = None,
    bpm: int | None = None,
    format: str = "mp3",
    stems: bool = False,
) -> dict:
    """
    Génère un fichier audio à partir d'un prompt textuel.
    Retourne un dict avec les chemins locaux des fichiers générés.
    """
    pipeline = load_model()
    full_prompt = _build_prompt(prompt, genre, bpm)

    with tempfile.TemporaryDirectory() as tmp_dir:
        output_path = os.path.join(tmp_dir, f"output.{format}")

        if pipeline == "mock":
            _generate_mock(output_path, duration)
        else:
            _generate_real(pipeline, full_prompt, duration, output_path)

        result = {"audio": output_path}

        if stems:
            result["stems"] = _extract_stems(output_path, tmp_dir)

        # Les fichiers doivent être copiés avant la sortie du context manager
        import shutil
        final_dir = tempfile.mkdtemp(prefix="musicai_")
        final_audio = os.path.join(final_dir, f"output.{format}")
        shutil.copy(output_path, final_audio)
        result["audio"] = final_audio

        if stems and "stems" in result:
            final_stems = {}
            for stem_name, stem_path in result["stems"].items():
                dest = os.path.join(final_dir, os.path.basename(stem_path))
                shutil.copy(stem_path, dest)
                final_stems[stem_name] = dest
            result["stems"] = final_stems

    return result


def _build_prompt(prompt: str, genre: str | None, bpm: int | None) -> str:
    parts = [prompt]
    if genre:
        parts.append(f"genre: {genre}")
    if bpm:
        parts.append(f"{bpm} BPM")
    return ", ".join(parts)


def _generate_real(pipeline, prompt: str, duration: int, output_path: str) -> None:
    with torch.inference_mode():
        pipeline(
            prompt=prompt,
            duration=duration,
            output_path=output_path,
        )


def _generate_mock(output_path: str, duration: int) -> None:
    """Génère un fichier WAV silencieux pour les tests sans GPU."""
    import wave, struct, math
    sample_rate = 44100
    n_samples = sample_rate * duration
    with wave.open(output_path.replace(".mp3", ".wav"), "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        for i in range(n_samples):
            val = int(32767 * 0.1 * math.sin(2 * math.pi * 440 * i / sample_rate))
            f.writeframes(struct.pack("<h", val))


def _extract_stems(audio_path: str, out_dir: str) -> dict[str, str]:
    stems = {}
    for stem in ["drums", "bass", "melody", "other"]:
        path = os.path.join(out_dir, f"stem_{stem}.wav")
        open(path, "w").close()
        stems[stem] = path
    return stems
