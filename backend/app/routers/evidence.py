import uuid
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.evidence import ControlEvidence

router = APIRouter(prefix="/api/evidence", tags=["evidence"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "evidence")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _row_to_dict(e: ControlEvidence) -> dict:
    return {
        "id":           e.id,
        "controlId":    e.control_id,
        "originalName": e.original_name,
        "fileSize":     e.file_size,
        "mimeType":     e.mime_type,
        "uploadedAt":   e.uploaded_at,
        "uploadedBy":   e.uploaded_by,
        "notes":        e.notes,
    }


@router.get("/control/{control_id}")
def list_evidence(control_id: str, db: Session = Depends(get_db)):
    rows = db.query(ControlEvidence).filter(
        ControlEvidence.control_id == control_id
    ).order_by(ControlEvidence.uploaded_at.desc()).all()
    return [_row_to_dict(r) for r in rows]


@router.post("/control/{control_id}", status_code=201)
async def upload_evidence(
    control_id: str,
    file: UploadFile = File(...),
    notes: str = Form(default=""),
    uploaded_by: str = Form(default=""),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "Ficheiro demasiado grande (máx. 20 MB)")

    ext = os.path.splitext(file.filename or "")[-1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, stored_name)
    with open(dest, "wb") as f:
        f.write(content)

    row = ControlEvidence(
        id=uuid.uuid4().hex,
        control_id=control_id,
        original_name=file.filename or stored_name,
        stored_name=stored_name,
        file_size=len(content),
        mime_type=file.content_type or "application/octet-stream",
        uploaded_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        uploaded_by=uploaded_by,
        notes=notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _row_to_dict(row)


@router.get("/{evidence_id}/download")
def download_evidence(evidence_id: str, db: Session = Depends(get_db)):
    row = db.query(ControlEvidence).filter(ControlEvidence.id == evidence_id).first()
    if not row:
        raise HTTPException(404)
    path = os.path.join(UPLOAD_DIR, row.stored_name)
    if not os.path.exists(path):
        raise HTTPException(404, "Ficheiro não encontrado no disco")
    return FileResponse(
        path,
        media_type=row.mime_type,
        filename=row.original_name,
    )


@router.delete("/{evidence_id}", status_code=204)
def delete_evidence(evidence_id: str, db: Session = Depends(get_db)):
    row = db.query(ControlEvidence).filter(ControlEvidence.id == evidence_id).first()
    if not row:
        raise HTTPException(404)
    path = os.path.join(UPLOAD_DIR, row.stored_name)
    if os.path.exists(path):
        os.remove(path)
    db.delete(row)
    db.commit()
