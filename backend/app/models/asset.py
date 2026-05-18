from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from ..database import Base

class Asset(Base):
    __tablename__ = "assets"

    id           = Column(String, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    type         = Column(String)          # software | hardware | network | service
    owner        = Column(String)
    criticality  = Column(String)          # critical | high | medium | low
    status       = Column(String, default="active")  # active | maintenance | decommissioned
    vendor       = Column(String)
    contract_id  = Column(String, nullable=True)     # FK to contracts (optional)
    risk_ids     = Column(String, default="")        # comma-separated risk IDs
    description  = Column(String)
    created_at   = Column(DateTime, server_default=func.now())
    updated_at   = Column(DateTime, server_default=func.now(), onupdate=func.now())
