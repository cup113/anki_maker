# server/main.py
from fastapi import FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from nanoid import generate
from pathlib import Path
from typing import Literal
from os import getenv

from genanki import Model, Note, Deck, Package  # type: ignore

from server.data_models import Chunk, ChunkDocument
from server.document_utils import create_document, generate_tables, generate_footer

app = FastAPI(title="Anki Maker API")
PRODUCTION = getenv("APP_ENV") == "production"


class DocumentResponse(BaseModel):
    message: str
    docx_filename: str
    apkg_filename: str


def gen_anki(
    chunks: list[Chunk],
    deck_type: Literal["one-side", "two-sides", "type"],
    file_path: Path,
):
    CSS = """
.card {
    font-family: "微软雅黑", arial;
    font-size: 20px;
    text-align: center;
    color: black;
    background-color: white;
}

.card p {
    margin: 0;
    padding: 0;
}
"""

    MODEL_ID_ONE_SIDE = 1739425482
    MODEL_ID_TWO_SIDES = 1739425489
    MODEL_ID_TYPE = 1739425493
    assert len({MODEL_ID_ONE_SIDE, MODEL_ID_TWO_SIDES, MODEL_ID_TYPE}) == 3

    ANKI_MODEL_ONE_SIDE = Model(
        MODEL_ID_ONE_SIDE,
        "LanguageLearning",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
        ],
        templates=[
            {
                "name": "Forward",
                "qfmt": "{{Front}}",
                "afmt": '{{Front}}<hr id="answer">{{Back}}',
            }
        ],
        css=CSS,
    )

    ANKI_MODEL_TWO_SIDE = Model(
        MODEL_ID_TWO_SIDES,
        "LanguageLearningType",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
        ],
        templates=[
            {
                "name": "Forward",
                "qfmt": "{{Front}}",
                "afmt": '{{Front}}<hr id="answer">{{Back}}',
            },
            {
                "name": "Backward",
                "qfmt": "{{Back}}",
                "afmt": '{{Back}}<hr id="answer">{{Front}}',
            },
        ],
        css=CSS,
    )

    ANKI_MODEL_TYPE = Model(
        MODEL_ID_TYPE,
        "LanguageLearningType",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
        ],
        templates=[
            {
                "name": "Forward",
                "qfmt": "{{Front}}\n{{type:Back}}",
                "afmt": '{{Front}}<hr id="answer">{{type:Back}}',
            }
        ],
        css=CSS,
    )

    MODEL_DICT = {
        "one-side": ANKI_MODEL_ONE_SIDE,
        "two-sides": ANKI_MODEL_TWO_SIDE,
        "type": ANKI_MODEL_TYPE,
    }

    notes = [
        Note(
            model=MODEL_DICT[deck_type],
            fields=[chunk.get_merged_front(), chunk.get_merged_back()],
        )
        for chunk in chunks
    ]

    deck_id = 2973800905
    deck = Deck(deck_id, "Generated")
    for note in notes:
        deck.add_note(note)  # type: ignore

    pkg = Package(deck)
    pkg.write_to_file(file_path)  # type: ignore


@app.post("/api/generate", response_model=DocumentResponse)
async def generate_documents(request: ChunkDocument):
    output_dir = Path("/app/output") if PRODUCTION else Path("./temp")
    file_id = generate()

    try:
        document = request
        doc = create_document(document)
        generate_tables(doc, document.records)
        generate_footer(doc, document.footer)

        docx_file_path = output_dir / f"{file_id}.docx"
        doc.save(str(docx_file_path))

        apkg_file_path = output_dir / f"{file_id}.apkg"
        gen_anki(
            document.records,
            document.deckType,
            apkg_file_path,
        )

        final_docx_path = Path(output_dir) / f"{file_id}.docx"
        final_apkg_path = Path(output_dir) / f"{file_id}.apkg"

        docx_file_path.rename(final_docx_path)
        apkg_file_path.rename(final_apkg_path)

        return DocumentResponse(
            message="Documents generated successfully",
            docx_filename=f"{file_id}.docx",
            apkg_filename=f"{file_id}.apkg",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{file_type}/{filename}")
async def download_file(file_type: str, filename: str):
    if file_type not in ["docx", "apkg"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_path = Path("/app/output" if PRODUCTION else "./temp") / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    media_types = {
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "apkg": "application/octet-stream",
    }

    content = file_path.read_bytes()

    return Response(
        content=content,
        media_type=media_types[file_type],
        headers={"Content-Disposition": f"attachment"},
    )


@app.get("/api/")
async def root():
    return {"message": "Anki Maker API is running"}


app.mount("/", StaticFiles(directory="client/dist", html=True), name="static")
