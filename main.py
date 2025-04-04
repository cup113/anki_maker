from data_models import Chunk, ChunkDocument
from document_utils import create_document, generate_tables
from genanki import Model, Note, Deck, Package  # type: ignore
import json


def load_document(file_path: str) -> ChunkDocument:
    with open(file_path, "r", encoding="utf-8") as f:
        raw = f.read()
        data = json.loads(raw)
        return ChunkDocument.from_dict(data)


def gen_anki(chunks: list[Chunk]):
    model_id = 1739425471
    model = Model(
        model_id,
        "Chunks",
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
        css="""
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
""",
    )

    notes = [
        Note(model=model, fields=[chunk.get_merged_front(), chunk.get_merged_back()])
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
    doc.save("anki_maker/Chunks.docx")
    gen_anki(document.records)


# 在main.py中
if __name__ == "__main__":
    main()
    print("文档生成成功！")
