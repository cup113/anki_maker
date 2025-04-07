from data_models import Chunk, ChunkDocument
from document_utils import create_document, generate_tables, generate_footer
from genanki import Model, Note, Deck, Package  # type: ignore
from typing import Literal
import json


def load_document(file_path: str) -> ChunkDocument:
    with open(file_path, "r", encoding="utf-8") as f:
        raw = f.read()
        data = json.loads(raw)
        return ChunkDocument.from_dict(data)


def gen_anki(chunks: list[Chunk], deck_type: Literal["one-side", "two-side", "type"]):
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

    ANKI_MODEL_ONE_SIDE = Model(
        1739425482,
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
        1739425489,
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
        1739425493,
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
        "two-side": ANKI_MODEL_TWO_SIDE,
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
        deck.add_note(note)

    pkg = Package(deck)
    pkg.write_to_file("anki_maker/Chunks.apkg")


def main():
    document = load_document("anki_maker/AL_document.json")
    doc = create_document(document)
    generate_tables(doc, document.records)
    generate_footer(doc, document.footer)
    doc.save("anki_maker/Chunks.docx")
    gen_anki(document.records, document.deckType)


if __name__ == "__main__":
    main()
    print("文档生成成功！")
