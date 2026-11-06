"""把一份 Document 变成两个可下载的文件，并回答它们放在哪里。

HTTP 路由和 MCP 工具都只做参数转换：目录、命名、清理、越界检查都在这里。
把这些留在各自的调用方，就会出现两套稍有差别的导出流程 —— 「生成的文件在哪」
不该有第二个答案。
"""

import re
import time
from dataclasses import dataclass
from os import getenv
from pathlib import Path

from nanoid import generate

from server.anki_utils import gen_anki
from server.data_models import ChunkDocument
from server.document_utils import create_document, generate_footer, generate_tables

OUTPUT_DIR = Path(getenv("OUTPUT_DIR", "./temp"))
MAX_AGE_HOURS = 24
UNSAFE_FILENAME_CHARS = re.compile(r"[^a-zA-Z0-9\u4e00-\u9fa5_-]")


@dataclass(frozen=True)
class Artifacts:
    """一次导出的产物：两个文件名，不含目录。"""

    docx: str
    apkg: str


def _stem(document: ChunkDocument, readable: bool) -> str:
    """两个文件共用的名字。readable 留给 MCP —— 它的链接落在聊天窗口里，看得懂名字有用。"""
    stamp = generate()
    if not readable:
        return stamp

    prefix = UNSAFE_FILENAME_CHARS.sub("_", document.title)[:48].strip("_")
    return f"{prefix}_{stamp}" if prefix else stamp


def prune(max_age_hours: int = MAX_AGE_HOURS) -> None:
    cutoff = time.time() - max_age_hours * 3600
    for pattern in ("*.docx", "*.apkg"):
        for path in OUTPUT_DIR.glob(pattern):
            if path.stat().st_mtime < cutoff:
                path.unlink(missing_ok=True)


def produce(document: ChunkDocument, *, readable: bool = False) -> Artifacts:
    """生成 .docx 与 .apkg 一次，返回它们的文件名。"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    prune()

    stem = _stem(document, readable)

    doc = create_document(document)
    generate_tables(doc, document.records)
    generate_footer(doc, document.footer)
    doc.save(str(OUTPUT_DIR / f"{stem}.docx"))

    gen_anki(document.records, document.deckType, OUTPUT_DIR / f"{stem}.apkg")

    return Artifacts(docx=f"{stem}.docx", apkg=f"{stem}.apkg")


def locate(filename: str) -> Path | None:
    """把下载用的文件名解析成 OUTPUT_DIR 里的真实文件；越界或不存在都返回 None。"""
    root = OUTPUT_DIR.resolve()
    try:
        candidate = (OUTPUT_DIR / filename).resolve()
    except OSError:
        return None

    if candidate.parent != root or not candidate.is_file():
        return None
    return candidate
