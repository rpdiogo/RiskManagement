"""
Lightweight vector store — SQLite (stdlib) + PyTorch tensors.

No native C++ deps, no compaction bugs, fully persistent.
Replaces ChromaDB for local use.

Schema:
    chunks(id TEXT PK, text TEXT, metadata JSON, embedding BLOB)

The embedding BLOB is a float32 numpy array serialised via numpy.save.
At query time all embeddings are loaded into a torch tensor for fast
batched cosine similarity — works fine for up to ~100k chunks on CPU.
"""

import io
import json
import sqlite3
from pathlib import Path
from typing import Any

import numpy as np

DB_PATH_DEFAULT = Path(__file__).parent / "vector_store" / "store.db"


class VectorStore:
    def __init__(self, db_path: Path = DB_PATH_DEFAULT):
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._db_path = db_path
        self._conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.execute("""
            CREATE TABLE IF NOT EXISTS chunks (
                id       TEXT PRIMARY KEY,
                text     TEXT NOT NULL,
                metadata TEXT NOT NULL,
                embedding BLOB NOT NULL
            )
        """)
        self._conn.commit()
        # In-memory cache — rebuilt lazily
        self._cache_ids: list[str] | None = None
        self._cache_mat: Any = None   # torch.Tensor  [N, D]

    # ------------------------------------------------------------------
    # Write API
    # ------------------------------------------------------------------

    def upsert(
        self,
        ids: list[str],
        embeddings: list[list[float]],
        documents: list[str],
        metadatas: list[dict],
    ) -> None:
        rows = []
        for id_, emb, doc, meta in zip(ids, embeddings, documents, metadatas):
            buf = io.BytesIO()
            np.save(buf, np.array(emb, dtype=np.float32))
            rows.append((id_, doc, json.dumps(meta), buf.getvalue()))

        self._conn.executemany(
            "INSERT OR REPLACE INTO chunks(id, text, metadata, embedding) VALUES (?,?,?,?)",
            rows,
        )
        self._conn.commit()
        self._cache_ids = None   # invalidate cache

    # ------------------------------------------------------------------
    # Read API
    # ------------------------------------------------------------------

    def count(self) -> int:
        return self._conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]

    def get(self, ids: list[str] | None = None, limit: int = 1000) -> dict:
        if ids is not None:
            placeholders = ",".join("?" * len(ids))
            rows = self._conn.execute(
                f"SELECT id, text, metadata FROM chunks WHERE id IN ({placeholders})",
                ids,
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT id, text, metadata FROM chunks LIMIT ?", (limit,)
            ).fetchall()

        return {
            "ids":       [r[0] for r in rows],
            "documents": [r[1] for r in rows],
            "metadatas": [json.loads(r[2]) for r in rows],
        }

    def query(
        self,
        query_embeddings: list[list[float]],
        n_results: int = 8,
        where: dict | None = None,
    ) -> dict:
        import torch

        # Load all embeddings into memory (cached)
        if self._cache_ids is None:
            self._rebuild_cache()

        if not self._cache_ids:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        q = torch.tensor(query_embeddings[0], dtype=torch.float32)
        scores = torch.mv(self._cache_mat, q)          # cosine similarity (pre-normalised)

        # Apply metadata filter if requested
        if where:
            mask = self._build_mask(where)
            scores = scores * mask

        top_k = min(n_results, len(self._cache_ids))
        top_indices = torch.topk(scores, top_k).indices.tolist()

        ids, docs, metas, dists = [], [], [], []
        for idx in top_indices:
            cid = self._cache_ids[idx]
            row = self._conn.execute(
                "SELECT text, metadata FROM chunks WHERE id=?", (cid,)
            ).fetchone()
            if row:
                ids.append(cid)
                docs.append(row[0])
                metas.append(json.loads(row[1]))
                dists.append(round(1 - scores[idx].item(), 4))  # distance = 1 - similarity

        return {"ids": [ids], "documents": [docs], "metadatas": [metas], "distances": [dists]}

    def all_metadata(self, limit: int = 10000) -> list[dict]:
        rows = self._conn.execute(
            "SELECT metadata FROM chunks LIMIT ?", (limit,)
        ).fetchall()
        return [json.loads(r[0]) for r in rows]

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _rebuild_cache(self) -> None:
        import torch
        rows = self._conn.execute("SELECT id, embedding FROM chunks").fetchall()
        self._cache_ids = [r[0] for r in rows]
        if not rows:
            self._cache_mat = torch.zeros((0, 1))
            return
        vecs = []
        for _, blob in rows:
            arr = np.load(io.BytesIO(blob))
            vecs.append(arr)
        mat = np.stack(vecs)                          # [N, D]
        self._cache_mat = torch.tensor(mat, dtype=torch.float32)

    def _build_mask(self, where: dict):
        import torch
        """Return a float mask [N] — 1.0 if metadata matches, 0.0 otherwise."""
        rows = self._conn.execute("SELECT id, metadata FROM chunks").fetchall()
        id_to_idx = {cid: i for i, cid in enumerate(self._cache_ids)}
        mask = torch.ones(len(self._cache_ids))

        for cid, meta_json in rows:
            meta = json.loads(meta_json)
            if not _matches_where(meta, where):
                idx = id_to_idx.get(cid)
                if idx is not None:
                    mask[idx] = 0.0
        return mask

    def close(self) -> None:
        self._conn.close()


def _matches_where(meta: dict, where: dict) -> bool:
    """Simple ChromaDB-compatible where clause evaluator."""
    if "$and" in where:
        return all(_matches_where(meta, clause) for clause in where["$and"])
    if "$or" in where:
        return any(_matches_where(meta, clause) for clause in where["$or"])
    for key, val in where.items():
        if meta.get(key) != val:
            return False
    return True
