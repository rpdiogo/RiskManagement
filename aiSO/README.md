# aiSO — AI-powered Cybersecurity Compliance Agent

> A local-first, bilingual (EN/PT) compliance assistant for GRC teams. Built on a semantic knowledge base of ISO standards, EU regulations, and Portuguese national directives.

---

## Overview

**aiSO** (AI Security Officer) is a two-phase project:

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Knowledge Base | **Complete** | Ingest, embed and semantically search all compliance documents |
| 2 — Compliance Agent | Coming soon | Gap analysis, policy generation, and compliance Q&A via Claude |

---

## Knowledge Base

### Supported Documents

| Standard / Regulation | Scope |
|---|---|
| ISO/IEC 27001:2022 | Information Security Management System |
| ISO/IEC 27002:2022 | Information Security Controls |
| ISO/IEC 27005:2022 | Information Security Risk Management |
| ISO/IEC 27000:2018 | ISMS Overview and Vocabulary |
| ISO/IEC 42001:2023 | AI Management System |
| ISO/IEC 15408-1:2022 | Common Criteria (IT Security Evaluation) |
| ISO/IEC 19011:2018 | Guidelines for Auditing Management Systems |
| ISO/IEC 22301:2019 | Business Continuity Management |
| ISO 31000:2018 | Risk Management |
| NIST CSF 2.0 | Cybersecurity Framework |
| NIS2 Directive | EU Network and Information Security |
| GDPR | EU General Data Protection Regulation |
| EU AI Act | EU Artificial Intelligence Regulation |
| Regime Juridico de Ciberseguranca | Portuguese national cybersecurity law |

### Architecture

```
knowledge_base/
  documents/          # Place PDF files here
  ingestion/
    ingestor.py       # Main pipeline: PDF -> parse -> chunk -> embed -> store
    pdf_parser.py     # Structured text extraction (pymupdf4llm) + hybrid OCR
    chunker.py        # Section-aware sliding window chunker
    embedder.py       # multilingual-e5-large embeddings (EN + PT)
  retrieval/
    retriever.py      # Semantic search interface for the agent
  store.py            # Custom SQLite + PyTorch vector store
  vector_store/       # Auto-generated SQLite database (not tracked in git)
config.py             # Paths, model name, chunking params, norm metadata
main.py               # CLI: ingest | stats | search
```

### PDF Extraction Modes

The ingestor automatically selects the best extraction strategy per document:

| Mode | Trigger | Description |
|---|---|---|
| **text** | Normal PDF | `pymupdf4llm` preserves heading hierarchy for section-aware chunking |
| **OCR** | Fully scanned PDF | Full-page render at 200 DPI + easyocr (EN+PT) |
| **hybrid text+OCR** | Text PDF with embedded diagrams | Text extracted normally; significant images (>300px) are also OCR'd and appended |

---

## Setup

### Requirements

- Python 3.11+
- ~2 GB disk for the embedding model (`intfloat/multilingual-e5-large`, downloaded on first run)
- ~500 MB for easyocr models (downloaded on first OCR run)

### Install

```bash
pip install -r requirements.txt
```

### Add your documents

Place PDF files in `knowledge_base/documents/`. The ingestor maps filenames to norm metadata automatically — see `KNOWN_NORMS` in `config.py` for supported filename patterns.

### Ingest

```bash
# Ingest all new PDFs (skips already-processed files)
python main.py ingest

# Ingest a single file
python main.py ingest --file knowledge_base/documents/myfile.pdf

# Wipe everything and re-ingest from scratch
python main.py ingest --reset
```

### Search

```bash
# Semantic search (English or Portuguese)
python main.py search "access control requirements for privileged users"
python main.py search "medidas de seguranca obrigatorias NIS2"

# Return more results
python main.py search "risk assessment methodology" -n 10

# Filter by norm family
python main.py search "encryption at rest" --family "ISO/IEC"
```

### Stats

```bash
python main.py stats
```

---

## Embedding Model

`intfloat/multilingual-e5-large` — 560M parameter multilingual sentence transformer.

- Supports 100+ languages including English and Portuguese
- Optimised for technical/legal text similarity
- Runs fully locally on CPU (no GPU required)
- Prefixes: `"passage: "` for documents, `"query: "` for search queries (e5 requirement)

---

## Configuration

Edit `config.py` to adjust:

| Setting | Default | Description |
|---|---|---|
| `EMBEDDING_MODEL` | `intfloat/multilingual-e5-large` | HuggingFace model name |
| `CHUNK_SIZE` | 800 | Target tokens per chunk |
| `CHUNK_OVERLAP` | 150 | Overlap between adjacent chunks |
| `BATCH_SIZE` | 32 | Embedding batch size |
| `KNOWN_NORMS` | see config | Filename -> metadata mapping |

---

## Roadmap

- [x] Multi-format PDF ingestion (text, scanned, hybrid)
- [x] Bilingual semantic search (EN + PT)
- [x] Custom SQLite + PyTorch vector store (no external dependencies)
- [x] Section-aware chunking (preserves ISO control hierarchy)
- [ ] Compliance agent (Phase 2) — gap analysis against selected frameworks
- [ ] Policy generation from norm requirements
- [ ] Compliance report export (PDF/DOCX)
- [ ] Web UI

---

## License

Private — Jose de Mello internal tooling.
