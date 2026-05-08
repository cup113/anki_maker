from typing import Annotated

from pydantic import BaseModel, Field, BeforeValidator


def coerce_str(v):
    if isinstance(v, (int, float)):
        return str(v)
    return v


class AdditionInput(BaseModel):
    icon: str = Field(
        default="→",
        description="Derivation marker: → for generic, ①②③ for numbered items",
    )
    front: str = Field(default="", description="Derivation front side content (HTML allowed)")
    back: str = Field(default="", description="Derivation back side content (HTML allowed)")


class ChunkInput(BaseModel):
    front: str = Field(description="Flashcard front side content (HTML allowed)")
    back: str = Field(description="Flashcard back side content (HTML allowed)")
    level: Annotated[str, BeforeValidator(coerce_str)] = Field(
        default="-", description="Difficulty level, e.g. A, B, C, D"
    )
    additions: list[AdditionInput] = Field(
        default_factory=list,
        description="List of additional example sentences. Each item is an object with front/back/icon. "
        'Example: [{"front": "...", "back": "..."}]',
    )
