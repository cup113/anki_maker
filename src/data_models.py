from typing import Literal
from pydantic import BaseModel, Field


class Addition(BaseModel):
    id: str
    icon: str
    front: str
    back: str

    @classmethod
    def empty_additions(cls) -> list["Addition"]:
        return []


class Chunk(BaseModel):
    id: str
    level: str
    front: str
    back: str
    additions: list[Addition] = Field(default_factory=Addition.empty_additions)

    def get_merged_front(self) -> str:
        SPACES = "&nbsp;" * 2
        return self.front + "".join(
            f"<p>{SPACES}{a.icon} {self.dissolve_p_tags(a.front)}</p>"
            for a in self.additions
        )

    def get_merged_back(self) -> str:
        SPACES = "&nbsp;" * 2
        return self.back + "".join(
            f"<p>{SPACES}{a.icon} {self.dissolve_p_tags(a.back)}</p>"
            for a in self.additions
        )

    @staticmethod
    def dissolve_p_tags(text: str) -> str:
        return text.replace("<p>", "").replace("</p>", "")


class ChunkDocument(BaseModel):
    version: int
    records: list[Chunk]
    title: str
    footer: str = Field(default="")
    deckType: Literal["one-side", "two-sides", "type"] = Field(default="one-side")
