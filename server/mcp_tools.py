from os import getenv
from typing import Annotated, Literal
from urllib.parse import quote

from nanoid import generate
from pydantic import Field

from server.data_models import Addition, Chunk, ChunkDocument
from server.draft_store import save_draft
from server.export import produce
from server.tool_inputs import ChunkInput


def _make_chunk_document(
    chunks: list[ChunkInput],
    title: str = "",
    footer: str = "",
    deck_type: str = "one-side",
) -> ChunkDocument:
    records = []
    for c in chunks:
        additions = [
            Addition(
                id=generate(),
                icon=a.icon,
                front=a.front,
                back=a.back,
            )
            for a in c.additions
        ]
        records.append(
            Chunk(
                id=generate(),
                level=c.level,
                front=c.front,
                back=c.back,
                additions=additions,
            )
        )
    return ChunkDocument(
        version=4,
        records=records,
        title=title or "Untitled",
        footer=footer,
        deckType=deck_type,
    )


def _url_segment(value: str) -> str:
    """Percent-encode one URL path segment.

    Titles are sanitized with a CJK-friendly pattern, so a filename or draft id
    can contain non-ASCII characters; leaving them raw produces links that
    Markdown renderers and HTTP clients mangle. Only unreserved characters stay.
    """
    return quote(value, safe="")


def register_tools(mcp):
    @mcp.tool()
    async def generate_flashcards(
        chunks: list[ChunkInput],
        title: str = "",
        footer: str = "",
        deck_type: Annotated[
            Literal["one-side", "two-sides", "type"],
            Field(description="单面(单向记忆) / 双面(双向记忆) / 输入(自我检测)"),
        ] = "one-side",
    ) -> str:
        """Generate Anki flashcards (.apkg) and Word document (.docx) from card data.

        Each chunk is a flashcard with front/back content, difficulty level,
        and optional example sentences (additions). Returns downloadable file
        links and an editable URL for further modification.
        """
        document = _make_chunk_document(chunks, title, footer, deck_type)
        # 文件名带标题前缀：这条消息落在聊天窗口里，看得懂的名字比 uuid 有用。
        artifacts = produce(document, readable=True)
        draft_id = save_draft(document.model_dump())
        base_url = getenv("API_BASE_URL", "http://localhost:4134").rstrip("/")
        docx_segment = _url_segment(artifacts.docx)
        apkg_segment = _url_segment(artifacts.apkg)

        return (
            f"Cards generated successfully!\n\n"
            f"- Title: {document.title}\n"
            f"- Cards: {len(document.records)}\n"
            f"- Deck type: {document.deckType}\n\n"
            f"Links:\n"
            f"- Edit online: {base_url}/edit/{_url_segment(draft_id)}\n"
            f"- Download Word: {base_url}/api/download/docx/{docx_segment}\n"
            f"- Download Anki: {base_url}/api/download/apkg/{apkg_segment}"
        )

    return mcp
