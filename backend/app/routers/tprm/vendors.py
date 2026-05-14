from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from ...database import get_db
from ...models.tprm import Vendor

router = APIRouter(prefix="/api/tprm/vendors", tags=["tprm-vendors"])


class VendorCreate(BaseModel):
    name: str
    category: str
    criticality: str
    contact_name: str
    contact_email: str
    country: str
    status: str = "active"
    contract_end: Optional[str] = None


@router.get("/")
def list_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()


@router.post("/", status_code=201)
def create_vendor(body: VendorCreate, db: Session = Depends(get_db)):
    vendor = Vendor(id=str(uuid.uuid4()), risk_score=0, **body.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.put("/{vendor_id}")
def update_vendor(vendor_id: str, body: VendorCreate, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(vendor, k, v)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=204)
def delete_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(404)
    db.delete(vendor)
    db.commit()
