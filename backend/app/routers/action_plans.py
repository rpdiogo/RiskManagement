from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from ..database import get_db
from ..models.action_plan import ActionPlan

router = APIRouter(prefix="/api/action-plans", tags=["action-plans"])


class ActionPlanCreate(BaseModel):
    risk_id:  str
    title:    str
    owner:    str
    due_date: str
    status:   str = "not_started"


class ActionPlanUpdate(ActionPlanCreate):
    pass


@router.get("/")
def list_action_plans(risk_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(ActionPlan)
    if risk_id:
        q = q.filter(ActionPlan.risk_id == risk_id)
    return q.all()


@router.post("/", status_code=201)
def create_action_plan(body: ActionPlanCreate, db: Session = Depends(get_db)):
    ap = ActionPlan(id=str(uuid.uuid4()), **body.model_dump())
    db.add(ap)
    db.commit()
    db.refresh(ap)
    return ap


@router.put("/{ap_id}")
def update_action_plan(ap_id: str, body: ActionPlanUpdate, db: Session = Depends(get_db)):
    ap = db.query(ActionPlan).filter(ActionPlan.id == ap_id).first()
    if not ap:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(ap, k, v)
    db.commit()
    db.refresh(ap)
    return ap


@router.delete("/{ap_id}", status_code=204)
def delete_action_plan(ap_id: str, db: Session = Depends(get_db)):
    ap = db.query(ActionPlan).filter(ActionPlan.id == ap_id).first()
    if not ap:
        raise HTTPException(404)
    db.delete(ap)
    db.commit()
