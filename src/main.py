import tkinter as tk
from tkinter import filedialog
from os import startfile
from json import loads as json_loads
from typing import Literal, Callable
from pathlib import Path
from argparse import ArgumentParser

from genanki import Model, Note, Deck, Package  # type: ignore

from data_models import Chunk, ChunkDocument
from document_utils import create_document, generate_tables, generate_footer


def load_document(file_path: Path) -> ChunkDocument:
    with open(file_path, "r", encoding="utf-8") as f:
        raw = f.read()
        data = json_loads(raw)
        return ChunkDocument.from_dict(data)


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


def gen(file_path: Path):
    document = load_document(file_path)
    doc = create_document(document)
    generate_tables(doc, document.records)
    generate_footer(doc, document.footer)
    doc.save(str(file_path.parent / f"{file_path.stem}.docx"))
    gen_anki(
        document.records,
        document.deckType,
        file_path.parent / f"{file_path.stem}.apkg",
    )


def select_file(on_success: Callable[[Path], None], on_fail: Callable[[], None]):
    file_path = filedialog.askopenfilename(filetypes=[("JSON Files", "*.json")])
    if file_path:
        gen(Path(file_path))
        on_success(Path(file_path))
    else:
        on_fail()


def get_folder_opener(folder_path: Path):
    def open_folder():
        startfile(folder_path)

    return open_folder


def main():
    parser = ArgumentParser(description="Anki Maker")
    parser.add_argument("file", nargs="?", help="File to open")
    parser.add_argument(
        "--open-folder", action="store_true", help="Open the folder after generating"
    )
    args = parser.parse_args()

    if args.file:
        file_path = Path(args.file)
        if file_path.exists():
            gen(Path(args.file))
            if args.open_folder:
                file_opener = get_folder_opener(file_path.parent)
                file_opener()
        else:
            print(f"File not found: {args.file}")
    else:
        root = tk.Tk()
        root.title("Anki Maker")
        root.geometry("240x240")

        button = tk.Button(
            root,
            text="选择文件",
            command=lambda: select_file(on_select_file_success, on_select_file_fail),
        )
        button.pack(pady=20)

        success_label = tk.Label(root, text="", fg="black", font=("Arial", 12))
        success_label.pack(pady=10)

        open_folder_button = tk.Button(root, text="打开文件夹")
        open_folder_button.pack_forget()

        def on_select_file_success(file_path: Path):
            success_label.config(
                text=f"{file_path.parent.stem}\n{file_path.stem}\nDone",
                fg="green",
                font=("Arial", 14, "bold"),
            )
            open_folder_button.config(command=get_folder_opener(Path(file_path).parent))
            open_folder_button.pack(pady=10)

        def on_select_file_fail():
            success_label.config(  # type: ignore
                text="File not chosen", fg="orange", font=("Arial", 12, "bold")
            )
            open_folder_button.pack_forget()

        root.mainloop()


if __name__ == "__main__":
    main()
