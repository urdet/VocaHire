from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any, Dict, Optional


_lock = Lock()
_progress_by_interview: Dict[int, Dict[str, Any]] = {}


def set_analysis_progress(
    interview_id: int,
    *,
    phase: str,
    label: str,
    message: str,
    progress: int,
    detail: Optional[str] = None,
) -> Dict[str, Any]:
    payload = {
        "phase": phase,
        "label": label,
        "message": message,
        "progress": max(0, min(100, int(progress))),
        "detail": detail,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    with _lock:
        previous = _progress_by_interview.get(interview_id, {})
        started_at = previous.get("started_at") or payload["updated_at"]
        payload["started_at"] = started_at
        _progress_by_interview[interview_id] = payload

    print(
        f"[PROGRESS] interview_id={interview_id} "
        f"phase={phase} progress={payload['progress']} label={label}",
        flush=True,
    )
    return payload


def get_analysis_progress(interview_id: int) -> Optional[Dict[str, Any]]:
    with _lock:
        progress = _progress_by_interview.get(interview_id)
        return dict(progress) if progress else None

