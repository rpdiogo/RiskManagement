"""
Retrieval interface over the compliance knowledge base.
Used by the compliance agent (Phase 2) as a tool call.
"""

from dataclasses import dataclass
from pathlib import Path

from config import VECTOR_STORE_DIR
from knowledge_base.store import VectorStore
from knowledge_base.ingestion.embedder import embed_query


@dataclass
class RetrievedChunk:
    text: str
    score: float          # cosine similarity — higher = more relevant
    source_file: str
    norm_key: str
    family: str
    topic: str
    heading: str
    section_id: str


_store: VectorStore | None = None


def _get_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore(VECTOR_STORE_DIR / "store.db")
    return _store


def retrieve(
    query: str,
    n_results: int = 8,
    filter_domain: str | None = None,
    filter_family: str | None = None,
) -> list[RetrievedChunk]:
    """
    Semantic search over the compliance knowledge base.

    Args:
        query:         Natural language query (EN or PT)
        n_results:     Number of chunks to return
        filter_domain: Optional — restrict to a domain e.g. "information_security"
        filter_family: Optional — restrict to a norm family e.g. "ISO/IEC"
    """
    store = _get_store()
    query_embedding = embed_query(query)

    where = None
    if filter_domain and filter_family:
        where = {"$and": [{"domain": filter_domain}, {"family": filter_family}]}
    elif filter_domain:
        where = {"domain": filter_domain}
    elif filter_family:
        where = {"family": filter_family}

    results = store.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where,
    )

    chunks: list[RetrievedChunk] = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        chunks.append(RetrievedChunk(
            text=doc,
            score=round(1 - dist, 4),
            source_file=meta.get("source_file", ""),
            norm_key=meta.get("norm_key", ""),
            family=meta.get("family", ""),
            topic=meta.get("topic", ""),
            heading=meta.get("heading", ""),
            section_id=meta.get("section_id", ""),
        ))

    return sorted(chunks, key=lambda c: c.score, reverse=True)


def collection_stats() -> dict:
    store = _get_store()
    count = store.count()
    metadatas = store.all_metadata(limit=min(count, 10000))
    sources: dict[str, int] = {}
    for m in metadatas:
        key = f"{m.get('family', '')} - {m.get('topic', '')} ({m.get('source_file', '')})"
        sources[key] = sources.get(key, 0) + 1
    return {"total_chunks": count, "sources": sources}
