import os
import hashlib
from functools import lru_cache
from pathlib import Path
from threading import Lock

import whisper


_MODEL_LOAD_LOCK = Lock()


def _is_checksum_error(error: RuntimeError) -> bool:
    message = str(error).lower()
    return "sha256 checksum" in message and "match" in message


def _expected_checkpoint(download_root: str, model_size: str) -> tuple[Path, str | None]:
    url = whisper._MODELS.get(model_size)
    checkpoint_name = f"{model_size}.pt"
    expected_sha256 = None

    if url:
        checkpoint_name = os.path.basename(url)
        expected_sha256 = url.split("/")[-2]

    return Path(download_root) / checkpoint_name, expected_sha256


def _checkpoint_sha256(path: Path) -> str:
    hasher = hashlib.sha256()

    with path.open("rb") as checkpoint:
        for chunk in iter(lambda: checkpoint.read(1024 * 1024), b""):
            hasher.update(chunk)

    return hasher.hexdigest()


def _remove_cached_checkpoint(download_root: str, model_size: str) -> None:
    cache_dir = Path(download_root)
    checkpoint, _ = _expected_checkpoint(download_root, model_size)

    if checkpoint.exists():
        print(f"[WHISPER] Removing corrupted checkpoint: {checkpoint}", flush=True)
        checkpoint.unlink()

    for partial_file in cache_dir.glob(f"{model_size}*"):
        if partial_file == checkpoint or partial_file.suffix != ".tmp":
            continue

        print(f"[WHISPER] Removing partial checkpoint: {partial_file}", flush=True)
        partial_file.unlink(missing_ok=True)


def _remove_invalid_cached_checkpoint(download_root: str, model_size: str) -> None:
    checkpoint, expected_sha256 = _expected_checkpoint(download_root, model_size)

    if not checkpoint.exists() or not expected_sha256:
        return

    actual_sha256 = _checkpoint_sha256(checkpoint)
    if actual_sha256 != expected_sha256:
        print(
            f"[WHISPER] Cached checkpoint checksum mismatch for {checkpoint}.",
            flush=True,
        )
        _remove_cached_checkpoint(download_root, model_size)


@lru_cache(maxsize=3)
def _load_model_with_cache_repair(model_size: str, download_root: str):
    Path(download_root).mkdir(parents=True, exist_ok=True)

    with _MODEL_LOAD_LOCK:
        _remove_invalid_cached_checkpoint(download_root, model_size)

        for attempt in range(2):
            try:
                return whisper.load_model(model_size, download_root=download_root)
            except RuntimeError as error:
                if not _is_checksum_error(error) or attempt == 1:
                    raise

                _remove_cached_checkpoint(download_root, model_size)
                print("[WHISPER] Retrying model download after checksum failure.", flush=True)


def transcribe_audio(audio_path: str, model_size="small"):
    download_root = os.getenv("WHISPER_CACHE_DIR", "/data/model-cache/whisper")
    model = _load_model_with_cache_repair(model_size, download_root)
    result = model.transcribe(
        audio_path,
        fp16=False,
        # Auto-detect language (works for FR, EN, AR, ES, etc.)
        # If you want faster but less accurate, use "base"
        # If you want even better but slower, use "medium"
    )
    return result["segments"]
