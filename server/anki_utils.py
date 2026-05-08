from pathlib import Path
from typing import Literal

from genanki import Model, Note, Deck, Package

from server.data_models import Chunk

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

DECK_ID = 2973800905


def gen_anki(
    chunks: list[Chunk],
    deck_type: Literal["one-side", "two-sides", "type"],
    file_path: Path,
):
    notes = [
        Note(
            model=MODEL_DICT[deck_type],
            fields=[chunk.get_merged_front(), chunk.get_merged_back()],
        )
        for chunk in chunks
    ]

    deck = Deck(DECK_ID, "Generated")
    for note in notes:
        deck.add_note(note)

    pkg = Package(deck)
    pkg.write_to_file(file_path)
