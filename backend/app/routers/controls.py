from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..models.control import Control

router = APIRouter(prefix="/api/controls", tags=["controls"])


class ControlCreate(BaseModel):
    code:           str
    name:           str
    description:    Optional[str] = None
    category:       str
    framework_refs: Optional[str] = None
    status:         str = "not_implemented"
    effectiveness:  str = "untested"
    owner:          Optional[str] = None
    risk_ids:       str = ""
    notes:          Optional[str] = None


class ControlUpdate(ControlCreate):
    pass


class ControlPatch(BaseModel):
    code:           Optional[str] = None
    name:           Optional[str] = None
    description:    Optional[str] = None
    category:       Optional[str] = None
    framework_refs: Optional[str] = None
    status:         Optional[str] = None
    effectiveness:  Optional[str] = None
    owner:          Optional[str] = None
    risk_ids:       Optional[str] = None
    notes:          Optional[str] = None


@router.get("/")
def list_controls(db: Session = Depends(get_db)):
    return db.query(Control).order_by(Control.code).all()


@router.post("/", status_code=201)
def create_control(body: ControlCreate, db: Session = Depends(get_db)):
    c = Control(id=body.code, **body.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/{control_id}")
def update_control(control_id: str, body: ControlUpdate, db: Session = Depends(get_db)):
    c = db.query(Control).filter(Control.id == control_id).first()
    if not c:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.patch("/{control_id}")
def patch_control(control_id: str, body: ControlPatch, db: Session = Depends(get_db)):
    c = db.query(Control).filter(Control.id == control_id).first()
    if not c:
        raise HTTPException(404)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{control_id}", status_code=204)
def delete_control(control_id: str, db: Session = Depends(get_db)):
    c = db.query(Control).filter(Control.id == control_id).first()
    if not c:
        raise HTTPException(404)
    db.delete(c)
    db.commit()
