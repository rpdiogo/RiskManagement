"""
Main ingestion pipeline: PDF -> parse -> chunk -> embed -> VectorStore.
Handles both text-based and scanned (OCR) PDFs in a single pass.
Uses a custom SQLite+PyTorch vector store (no ChromaDB dependency).

Usage:
    python -m knowledge_base.ingestion.ingestor                  # ingest all new PDFs
    python -m knowledge_base.ingestion.ingestor --file doc.pdf   # ingest a single file
    python -m knowledge_base.ingestion.ingestor --reset          # wipe & re-ingest everything
"""

import argparse
import hashlib
import json
import sys
from pathlib import Path

from rich.console import Console
from rich.progress import track

sys.path.insert(0, str(Path(__file__).parents[3]))

from config import DOCUMENTS_DIR, VECTOR_STORE_DIR, KNOWN_NORMS
from knowledge_base.store import VectorStore
from knowledge_base.ingestion.pdf_parser import parse_pdf, has_significant_images
from knowledge_base.ingestion.chunker import chunk_sections, Chunk, _windows
from knowledge_base.ingestion.embedder import embed_passages

console = Console()

# Checkpoint file — tracks which files have been successfully ingested
CHECKPOINT_FILE = VECTOR_STORE_DIR.parent / ".ingest_checkpoint.json"

# OCR chunking (no headings available from scanned pages)
OCR_CHUNK_SIZE = 1000
OCR_CHUNK_OVERLAP = 200
OCR_MIN_CHUNK = 80

# Render resolution for fully-scanned PDFs
OCR_DPI = 200

_store: VectorStore | None = None


def _get_store(reset: bool = False) -> VectorStore:
    global _store
    db_path = VECTOR_STORE_DIR / "store.db"

    if reset and db_path.exists():
        db_path.unlink()
        console.print("[yellow]Existing store deleted.[/yellow]")
        _save_checkpoint({})

    if _store is None:
        _store = VectorStore(db_path)

    return _store


# Keep old name for backward compatibility with any callers
def _get_collection(reset: bool = False):
    return _get_store(reset)


def _file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def _infer_metadata(filename: str) -> dict:
    lower = filename.lower()
    for key, meta in KNOWN_NORMS.items():
        if key.lower() in lower:
            return {"norm_key": key, **meta}
    return {"norm_key": "unknown", "family": "unknown", "topic": "unknown", "domain": "unknown"}


# --- Checkpoint helpers ---

def _load_checkpoint() -> dict:
    if CHECKPOINT_FILE.exists():
        return json.loads(CHECKPOINT_FILE.read_text())
    return {}


def _save_checkpoint(data: dict) -> None:
    CHECKPOINT_FILE.parent.mkdir(parents=True, exist_ok=True)
    CHECKPOINT_FILE.write_text(json.dumps(data, indent=2))


def _mark_done(checkpoint: dict, filename: str, chunks: int) -> None:
    checkpoint[filename] = chunks
    _save_checkpoint(checkpoint)


# --- Scanned PDF detection & OCR ---

def _is_scanned(pdf_path: Path) -> bool:
    import fitz
    doc = fitz.open(str(pdf_path))
    for page in doc:
        if len(page.get_text().strip()) > 50:
            doc.close()
            return False
    doc.close()
    return True


def _ocr_pdf(pdf_path: Path) -> str:
    import fitz
    import numpy as np
    import easyocr

    matrix = fitz.Matrix(OCR_DPI / 72, OCR_DPI / 72)
    console.print("  Loading OCR model (first run downloads ~200 MB)...")
    reader = easyocr.Reader(["en", "pt"], gpu=False, verbose=False)

    doc = fitz.open(str(pdf_path))
    all_text: list[str] = []

    for page_num in range(doc.page_count):
        page = doc[page_num]
        pix = page.get_pixmap(matrix=matrix, colorspace=fitz.csRGB)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
            pix.height, pix.width, 3
        )
        results = reader.readtext(img, detail=0, paragraph=True)
        page_text = "\n".join(results)
        if page_text.strip():
            all_text.append(f"[Page {page_num + 1}]\n{page_text}")

        if (page_num + 1) % 5 == 0 or page_num == 0:
            console.print(f"  OCR page {page_num + 1}/{doc.page_count}...")

    doc.close()
    return "\n\n".join(all_text)


def _chunk_ocr_text(text: str, doc_metadata: dict) -> list[Chunk]:
    chunks = []
    for i, (start, end) in enumerate(_windows(text, OCR_CHUNK_SIZE, OCR_CHUNK_OVERLAP)):
        chunk_text = text[start:end].strip()
        if len(chunk_text) < OCR_MIN_CHUNK:
            continue
        chunks.append(Chunk(
            text=chunk_text,
            metadata={**doc_metadata, "chunk_index": i, "extraction": "ocr"},
        ))
    return chunks


# --- Main ingest ---

def _upsert_chunks(
    chunks: list[Chunk],
    doc_id_prefix: str,
    store: VectorStore,
) -> int:
    texts = [c.text for c in chunks]
    embeddings = embed_passages(texts)

    batch_size = 500
    added = 0
    for i in range(0, len(chunks), batch_size):
        b_chunks = chunks[i : i + batch_size]
        b_embeddings = embeddings[i : i + batch_size]
        store.upsert(
            ids=[f"{doc_id_prefix}_{i + j}" for j in range(len(b_chunks))],
            embeddings=b_embeddings,
            documents=[c.text for c in b_chunks],
            metadatas=[c.metadata for c in b_chunks],
        )
        added += len(b_chunks)
    return added


def ingest_file(pdf_path: Path, store: VectorStore, checkpoint: dict | None = None) -> int:
    if checkpoint is None:
        checkpoint = _load_checkpoint()

    filename = pdf_path.name
    if filename in checkpoint:
        console.print(f"[dim]Skipping {filename} (checkpoint)[/dim]")
        return 0

    file_hash = _file_hash(pdf_path)
    doc_id_prefix = f"{pdf_path.stem}_{file_hash}"
    inferred = _infer_metadata(filename)
    doc_metadata = {"source_file": filename, "file_hash": file_hash, **inferred}

    scanned = _is_scanned(pdf_path)
    hybrid = (not scanned) and has_significant_images(pdf_path)
    mode = "OCR" if scanned else ("hybrid text+OCR" if hybrid else "text")
    console.print(f"[bold]Ingesting[/bold] {filename} ({mode})...")

    if scanned:
        raw_text = _ocr_pdf(pdf_path)
        if not raw_text.strip():
            console.print(f"  [red]No text extracted[/red]")
            _mark_done(checkpoint, filename, 0)
            return 0
        chunks = _chunk_ocr_text(raw_text, {**doc_metadata, "extraction": "ocr"})
    else:
        sections = parse_pdf(pdf_path, hybrid_ocr=hybrid)
        chunks = chunk_sections(sections, doc_metadata)

    console.print(f"  {len(chunks)} chunks")

    if not chunks:
        _mark_done(checkpoint, filename, 0)
        return 0

    added = _upsert_chunks(chunks, doc_id_prefix, store)
    console.print(f"  [green]OK {added} chunks stored[/green]")
    _mark_done(checkpoint, filename, added)
    return added


def ingest_all(documents_dir: Path, reset: bool = False) -> None:
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(documents_dir.glob("**/*.pdf"))

    if not pdfs:
        console.print(f"[yellow]No PDFs found in {documents_dir}.[/yellow]")
        return

    store = _get_store(reset=reset)
    checkpoint = _load_checkpoint()

    total = 0
    for pdf in track(pdfs, description="Processing PDFs"):
        total += ingest_file(pdf, store, checkpoint)

    console.print(f"\n[bold green]Done.[/bold green] Total new chunks: {total}")
    console.print(f"Store size: {store.count()} chunks")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest PDFs into the compliance knowledge base")
    parser.add_argument("--file", type=Path, help="Ingest a single PDF file")
    parser.add_argument("--reset", action="store_true", help="Wipe existing data first")
    args = parser.parse_args()

    if args.file:
        store = _get_store(reset=args.reset)
        ingest_file(args.file.resolve(), store)
    else:
        ingest_all(DOCUMENTS_DIR, reset=args.reset)


if __name__ == "__main__":
    main()
