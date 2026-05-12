from pathlib import Path

# Project root
ROOT = Path(__file__).parent

# Directory where you drop your PDF files before ingestion
DOCUMENTS_DIR = ROOT / "knowledge_base" / "documents"

# ChromaDB persisted on disk
VECTOR_STORE_DIR = ROOT / "knowledge_base" / "vector_store"

# Collection name inside ChromaDB
COLLECTION_NAME = "compliance_kb"

# Multilingual embedding model (runs fully locally)
# Best multilingual model for technical/legal text — supports PT + EN
EMBEDDING_MODEL = "intfloat/multilingual-e5-large"

# Chunking parameters
CHUNK_SIZE = 800        # characters per chunk
CHUNK_OVERLAP = 150     # overlap to preserve context across chunks
MIN_CHUNK_SIZE = 100    # discard chunks shorter than this (headers, page nums)

# Known norm metadata — used to auto-tag documents on ingest
# Add entries as you acquire more documents
KNOWN_NORMS = {
    # ISO/IEC 27000 family — Information Security
    "27000": {"family": "ISO/IEC", "topic": "ISMS Overview & Vocabulary", "domain": "information_security"},
    "27001": {"family": "ISO/IEC", "topic": "ISMS Requirements",          "domain": "information_security"},
    "27002": {"family": "ISO/IEC", "topic": "Information Security Controls", "domain": "information_security"},
    "27005": {"family": "ISO/IEC", "topic": "Information Security Risk Management", "domain": "information_security"},
    "27036": {"family": "ISO/IEC", "topic": "Supplier Relationships Security", "domain": "information_security"},
    # ISO Risk, Business Continuity & AI
    "19011": {"family": "ISO",     "topic": "Auditing Management Systems","domain": "audit"},
    "22301": {"family": "ISO/IEC", "topic": "Business Continuity Management", "domain": "business_continuity"},
    "31000": {"family": "ISO",     "topic": "Risk Management",            "domain": "risk_management"},
    "42001": {"family": "ISO/IEC", "topic": "AI Management System",       "domain": "artificial_intelligence"},
    # ISO/IEC 15408 — Common Criteria (security evaluation)
    "15408": {"family": "ISO/IEC", "topic": "Common Criteria",            "domain": "information_security"},
    # NIST frameworks
    "nist_csf": {"family": "NIST", "topic": "Cybersecurity Framework 2.0", "domain": "information_security"},
    "nist.cyber": {"family": "NIST", "topic": "Cybersecurity Framework 2.0", "domain": "information_security"},
    # EU / Regulatory
    "nis2":  {"family": "EU",    "topic": "NIS2 Directive",               "domain": "regulatory"},
    "eu ai act": {"family": "EU", "topic": "EU AI Act",                   "domain": "artificial_intelligence"},
    "gdpr":  {"family": "EU",    "topic": "GDPR/RGPD",                   "domain": "data_protection"},
    "rgpd":  {"family": "EU",    "topic": "GDPR/RGPD",                   "domain": "data_protection"},
    # Portuguese national frameworks and law
    "regime juridico": {"family": "PT", "topic": "Regime Jurídico da Cibersegurança", "domain": "regulatory"},
    "regulamento":     {"family": "PT", "topic": "Regulamento de Cibersegurança PT",  "domain": "regulatory"},
    "lei_":  {"family": "PT",    "topic": "Portuguese Law",               "domain": "regulatory"},
    "cncs":  {"family": "PT",    "topic": "CNCS Framework",               "domain": "regulatory"},
    # Other frameworks
    "cis":   {"family": "CIS",   "topic": "CIS Controls",                 "domain": "information_security"},
    "soc2":  {"family": "AICPA", "topic": "SOC 2",                        "domain": "audit"},
}
