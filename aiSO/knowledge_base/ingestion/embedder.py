"""
Wraps sentence-transformers multilingual-e5-large for local embedding.
multilingual-e5-large supports 100+ languages including PT and EN and
performs well on technical/legal text without any API key.
"""

from functools import lru_cache
from typing import List

from sentence_transformers import SentenceTransformer
from rich.console import Console

console = Console()

MODEL_NAME = "intfloat/multilingual-e5-large"

# multilingual-e5 expects a task prefix on the query side
QUERY_PREFIX = "query: "
PASSAGE_PREFIX = "passage: "


@lru_cache(maxsize=1)
def _model() -> SentenceTransformer:
    console.print(f"[dim]Loading embedding model {MODEL_NAME} (first run downloads ~1.1 GB)…[/dim]")
    return SentenceTransformer(MODEL_NAME)


def embed_passages(texts: list[str]) -> list[list[float]]:
    """Embed document chunks (passage side)."""
    prefixed = [PASSAGE_PREFIX + t for t in texts]
    return _model().encode(prefixed, normalize_embeddings=True, show_progress_bar=True).tolist()


def embed_query(text: str) -> list[float]:
    """Embed a retrieval query (query side)."""
    return _model().encode(QUERY_PREFIX + text, normalize_embeddings=True).tolist()
