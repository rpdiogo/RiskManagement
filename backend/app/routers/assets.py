from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from ..database import get_db
from ..models.asset import Asset

router = APIRouter(prefix="/api/assets", tags=["assets"])


class AssetCreate(BaseModel):
    name:        str
    type:        str
    owner:       str
    criticality: str = "medium"
    status:      str = "active"
    vendor:      Optional[str] = None
    contract_id: Optional[str] = None
    risk_ids:    str = ""
    description: Optional[str] = None


class AssetUpdate(AssetCreate):
    pass


@router.get("/")
def list_assets(db: Session = Depends(get_db)):
    return db.query(Asset).order_by(Asset.name).all()


@router.post("/", status_code=201)
def create_asset(body: AssetCreate, db: Session = Depends(get_db)):
    asset = Asset(id=str(uuid.uuid4()), **body.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.put("/{asset_id}")
def update_asset(asset_id: str, body: AssetUpdate, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404)
    for k, v in body.model_dump().items():
        setattr(asset, k, v)
    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404)
    db.delete(asset)
    db.commit()
