from dataclasses import dataclass, field
from dataclasses_json import dataclass_json
from typing import  Any

@dataclass_json
@dataclass
class Addition:
    id: str
    icon: str
    front: str
    back: str

@dataclass_json
@dataclass
class Chunk:
    id: str
    level: str
    front: str
    back: str
    additions: list[Addition] = field(default_factory=list)

    def get_merged_front(self) -> str:
        SPACES = "&nbsp;" * 2
        return self.front + "".join(f"<p>{SPACES}{a.icon} {self.dissolve_p_tags(a.front)}</p>" for a in self.additions)

    def get_merged_back(self) -> str:
        SPACES = "&nbsp;" * 2
        return self.back + "".join(f"<p>{SPACES}{a.icon} {self.dissolve_p_tags(a.back)}</p>" for a in self.additions)

    @classmethod
    def dissolve_p_tags(cls, text: str) -> str:
        return text.replace("<p>", "").replace("</p>", "")

    @classmethod
    def from_dict(cls, d: Any) -> "Chunk": ...

@dataclass_json
@dataclass
class ChunkDocument:
    version: int
    records: list[Chunk]
    title: str

    @classmethod
    def from_dict(cls, d: Any) -> "ChunkDocument": ...
