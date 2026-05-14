from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from ...database import get_db
from ...models.tprm import Contract

router = APIRouter(prefix="/api/tprm/contracts", tags=["tprm-contracts"])


class ContractCreate(BaseModel):
    vendor_id: str
    title: str
    start_date: str
    end_date: str
    value: Optional[float] = None
    auto_renew: bool = False


@router.get("/")
def list_contracts(db: Session = Depends(get_db)):
    return db.query(Contract).all()


@router.post("/", status_code=201)
def create_contract(body: ContractCreate, db: Session = Depends(get_db)):
    contract = Contract(id=str(uuid.uuid4()), status="active", sla_compliance=100.0, **body.model_dump())
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract


@router.delete("/{contract_id}", status_code=204)
def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    c = db.query(Contract).filter(Contract.id == contract_id).first()
    if not c:
        raise HTTPException(404)
    db.delete(c)
    db.commit()
