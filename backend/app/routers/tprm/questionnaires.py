from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from ...database import get_db
from ...models.tprm import Questionnaire

router = APIRouter(prefix="/api/tprm/questionnaires", tags=["tprm-questionnaires"])


class QuestionnaireCreate(BaseModel):
    vendor_id: str
    title: str
    due_date: Optional[str] = None


@router.get("/")
def list_questionnaires(db: Session = Depends(get_db)):
    return db.query(Questionnaire).all()


@router.post("/", status_code=201)
def send_questionnaire(body: QuestionnaireCreate, db: Session = Depends(get_db)):
    from datetime import date
    q = Questionnaire(id=str(uuid.uuid4()), status="sent", sent_at=str(date.today()), **body.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.patch("/{q_id}/complete")
def complete_questionnaire(q_id: str, score: int, db: Session = Depends(get_db)):
    from datetime import date
    q = db.query(Questionnaire).filter(Questionnaire.id == q_id).first()
    if not q:
        raise HTTPException(404)
    q.status = "completed"
    q.score = score
    q.completed_at = str(date.today())
    db.commit()
    db.refresh(q)
    return q
