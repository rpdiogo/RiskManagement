"""
Extracts structured text from PDFs using pymupdf4llm.
Preserves headings and section hierarchy which is critical for ISO/regulatory docs.

Hybrid mode: for pages that contain both text AND significant images (diagrams,
figures, process flows), the images are also OCR'd and the result is appended
to the page text so no diagram content is lost.
"""

import re
from dataclasses import dataclass
from pathlib import Path

import fitz
import pymupdf4llm

# Images wider/taller than this threshold are considered content (not logos)
SIGNIFICANT_IMAGE_PX = 300


@dataclass
class ParsedSection:
    text: str
    page_start: int
    page_end: int
    heading: str = ""
    section_id: str = ""   # e.g. "A.5.1", "6.1.2" for ISO controls


def has_significant_images(pdf_path: Path) -> bool:
    """Return True if this PDF has pages with large embedded images."""
    doc = fitz.open(str(pdf_path))
    for page in doc:
        for img in page.get_images(full=True):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.width > SIGNIFICANT_IMAGE_PX and pix.height > SIGNIFICANT_IMAGE_PX:
                doc.close()
                return True
    doc.close()
    return False


def _ocr_page_images(page: fitz.Page, doc: fitz.Document, reader) -> str:
    """OCR all significant images on a page, return combined text."""
    import numpy as np

    ocr_parts = []
    matrix = fitz.Matrix(200 / 72, 200 / 72)

    for img in page.get_images(full=True):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)

        if pix.width <= SIGNIFICANT_IMAGE_PX or pix.height <= SIGNIFICANT_IMAGE_PX:
            continue  # skip logos/icons

        # Convert to RGB numpy array for easyocr
        if pix.n != 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        img_array = __import__("numpy").frombuffer(pix.samples, dtype=__import__("numpy").uint8).reshape(
            pix.height, pix.width, 3
        )
        results = reader.readtext(img_array, detail=0, paragraph=True)
        if results:
            ocr_parts.append("\n".join(results))

    return "\n\n".join(ocr_parts)


def _build_ocr_reader():
    import easyocr
    return easyocr.Reader(["en", "pt"], gpu=False, verbose=False)


def parse_pdf(pdf_path: Path, hybrid_ocr: bool = False) -> list[ParsedSection]:
    """
    Parse a PDF into sections.

    Args:
        pdf_path:    Path to the PDF file.
        hybrid_ocr:  If True, OCR significant images on mixed pages and append
                     the extracted text so diagram content is not lost.
    """
    if hybrid_ocr:
        return _parse_hybrid(pdf_path)

    md_text = pymupdf4llm.to_markdown(str(pdf_path), show_progress=False)
    return _split_by_headings(md_text)


def _parse_hybrid(pdf_path: Path) -> list[ParsedSection]:
    """
    Page-by-page extraction: normal text + OCR of any significant images found
    on the same page. Results are merged before heading-based splitting.
    """
    from rich.console import Console
    console = Console()

    doc = fitz.open(str(pdf_path))
    reader = None  # lazy-load OCR only if needed

    augmented_pages: list[str] = []

    for page_num in range(doc.page_count):
        page = doc[page_num]
        page_text = page.get_text().strip()

        significant = [
            img for img in page.get_images(full=True)
            if fitz.Pixmap(doc, img[0]).width > SIGNIFICANT_IMAGE_PX
            and fitz.Pixmap(doc, img[0]).height > SIGNIFICANT_IMAGE_PX
        ]

        if significant:
            if reader is None:
                console.print("  [dim]Loading OCR for diagram pages...[/dim]")
                reader = _build_ocr_reader()
            ocr_text = _ocr_page_images(page, doc, reader)
            if ocr_text.strip():
                combined = page_text + "\n\n[Diagram content]\n" + ocr_text if page_text else ocr_text
                augmented_pages.append(combined)
                continue

        augmented_pages.append(page_text)

    doc.close()

    full_text = "\n\n".join(p for p in augmented_pages if p.strip())
    return _split_by_headings(full_text)


def _split_by_headings(md_text: str) -> list[ParsedSection]:
    """Split markdown into sections on heading boundaries (## and ###)."""
    pattern = re.compile(r"^(#{1,4})\s+(.+)$", re.MULTILINE)
    sections: list[ParsedSection] = []
    matches = list(pattern.finditer(md_text))

    if not matches:
        return [ParsedSection(text=md_text.strip(), page_start=1, page_end=1)]

    for i, match in enumerate(matches):
        heading_text = match.group(2).strip()
        content_start = match.end()
        content_end = matches[i + 1].start() if i + 1 < len(matches) else len(md_text)
        body = md_text[content_start:content_end].strip()

        if not body:
            continue

        section_id = _extract_section_id(heading_text)
        sections.append(ParsedSection(
            text=f"{heading_text}\n\n{body}",
            page_start=1,
            page_end=1,
            heading=heading_text,
            section_id=section_id,
        ))

    preamble = md_text[:matches[0].start()].strip()
    if len(preamble) > 50:
        sections.insert(0, ParsedSection(
            text=preamble,
            page_start=1,
            page_end=1,
            heading="Introduction",
        ))

    return sections


_SECTION_RE = re.compile(r"\b([A-Z]?\d{1,2}(?:\.\d{1,2}){1,4})\b")


def _extract_section_id(heading: str) -> str:
    match = _SECTION_RE.search(heading)
    return match.group(1) if match else ""
