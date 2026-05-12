"""
Splits parsed sections into embed-ready chunks.
Keeps section context (heading, section_id) attached to every chunk.
"""

from dataclasses import dataclass
from typing import Any

from knowledge_base.ingestion.pdf_parser import ParsedSection
from config import CHUNK_SIZE, CHUNK_OVERLAP, MIN_CHUNK_SIZE


@dataclass
class Chunk:
    text: str
    metadata: dict[str, Any]


def chunk_sections(
    sections: list[ParsedSection],
    doc_metadata: dict[str, Any],
) -> list[Chunk]:
    """
    Turn a list of ParsedSection into overlapping Chunk objects.
    Each chunk carries the full document + section metadata so the agent
    can always tell which norm/control a retrieved passage came from.
    """
    chunks: list[Chunk] = []

    for section in sections:
        text = section.text.strip()
        if len(text) < MIN_CHUNK_SIZE:
            continue

        base_meta = {
            **doc_metadata,
            "heading": section.heading,
            "section_id": section.section_id,
        }

        if len(text) <= CHUNK_SIZE:
            chunks.append(Chunk(text=text, metadata=base_meta))
            continue

        # Slide a window over longer sections
        for i, (start, end) in enumerate(_windows(text, CHUNK_SIZE, CHUNK_OVERLAP)):
            chunk_text = text[start:end].strip()
            if len(chunk_text) < MIN_CHUNK_SIZE:
                continue
            chunks.append(Chunk(
                text=chunk_text,
                metadata={**base_meta, "chunk_index": i},
            ))

    return chunks


def _windows(text: str, size: int, overlap: int):
    """Yield (start, end) index pairs with overlap."""
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        yield start, end
        if end == len(text):
            break
        start += size - overlap
