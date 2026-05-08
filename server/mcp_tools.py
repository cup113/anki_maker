import re
from os import getenv
from pathlib import Path
from typing import Annotated, Literal

from pydantic import Field

from server.data_models import Chunk, Addition, ChunkDocument
from server.draft_store import save_draft
from server.anki_utils import gen_anki
from server.document_utils import create_document, generate_tables, generate_footer
from server.tool_inputs import ChunkInput
from nanoid import generate


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


def generate_files(document: ChunkDocument) -> dict[str, str]:
    from server.main import PRODUCTION

    output_dir = Path("/app/output") if PRODUCTION else Path("./temp")
    output_dir.mkdir(parents=True, exist_ok=True)
    safe_title = re.sub(r'[^a-zA-Z0-9\u4e00-\u9fa5_-]', '_', document.title)[:48]
    file_id = safe_title + "_" + __import__('nanoid').generate()

    doc = create_document(document)
    generate_tables(doc, document.records)
    generate_footer(doc, document.footer)

    docx_path = output_dir / f"{file_id}.docx"
    doc.save(str(docx_path))

    apkg_path = output_dir / f"{file_id}.apkg"
    gen_anki(document.records, document.deckType, apkg_path)

    return {
        "docx_filename": f"{file_id}.docx",
        "apkg_filename": f"{file_id}.apkg",
    }


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
        file_info = generate_files(document)
        draft_id = save_draft(document.model_dump())
        base_url = getenv("API_BASE_URL", "http://localhost:4134")

        return (
            f"Cards generated successfully!\n\n"
            f"- Title: {document.title}\n"
            f"- Cards: {len(document.records)}\n"
            f"- Deck type: {document.deckType}\n\n"
            f"Links:\n"
            f"- Edit online: {base_url}/edit/{draft_id}\n"
            f"- Download Word: {base_url}/api/download/docx/{file_info['docx_filename']}\n"
            f"- Download Anki: {base_url}/api/download/apkg/{file_info['apkg_filename']}"
        )

    return mcp
