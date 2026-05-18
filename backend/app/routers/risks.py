from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from ..database import get_db
from ..models.risk import Risk

router = APIRouter(prefix="/api/risks", tags=["risks"])


class RiskCreate(BaseModel):
    name: str
    description: str
    category: str
    probability: int
    impact: int
    owner: str
    status: str = "open"
    vendor_id: Optional[str] = None


class RiskUpdate(RiskCreate):
    pass


@router.get("/")
def list_risks(db: Session = Depends(get_db)):
    return db.query(Risk).all()


@router.post("/", status_code=201)
def create_risk(body: RiskCreate, db: Session = Depends(get_db)):
    score = body.probability * body.impact
    level = _level(score)
    risk = Risk(id=str(uuid.uuid4()), score=score, level=level, trend="stable", **body.model_dump())
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return risk


@router.put("/{risk_id}")
def update_risk(risk_id: str, body: RiskUpdate, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(risk, k, v)
    risk.score = body.probability * body.impact
    risk.level = _level(risk.score)
    db.commit()
    db.refresh(risk)
    return risk


@router.delete("/{risk_id}", status_code=204)
def delete_risk(risk_id: str, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(404)
    db.delete(risk)
    db.commit()


def _level(score: int) -> str:
    if score > 16: return "critical"
    if score >= 10: return "high"
    if score >= 5:  return "medium"
    return "low"
