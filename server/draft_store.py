import time
import uuid
from typing import Any

_drafts: dict[str, dict[str, Any]] = {}
DRAFT_TTL = 3600 * 4


def save_draft(data: dict[str, Any]) -> str:
    draft_id = uuid.uuid4().hex[:12]
    _drafts[draft_id] = {
        "data": data,
        "created_at": time.time(),
    }
    return draft_id


def get_draft(draft_id: str) -> dict[str, Any] | None:
    draft = _drafts.get(draft_id)
    if draft is None:
        return None
    if time.time() - draft["created_at"] > DRAFT_TTL:
        del _drafts[draft_id]
        return None
    return draft["data"]


def cleanup_expired() -> int:
    now = time.time()
    expired = [k for k, v in _drafts.items() if now - v["created_at"] > DRAFT_TTL]
    for k in expired:
        del _drafts[k]
    return len(expired)
