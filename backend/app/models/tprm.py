from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from ..database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id            = Column(String, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    category      = Column(String)
    criticality   = Column(String)
    contact_name  = Column(String)
    contact_email = Column(String)
    country       = Column(String)
    status        = Column(String, default="active")
    risk_score    = Column(Integer, default=0)
    contract_end  = Column(String, nullable=True)
    created_at    = Column(DateTime, server_default=func.now())


class Questionnaire(Base):
    __tablename__ = "questionnaires"

    id           = Column(String, primary_key=True, index=True)
    vendor_id    = Column(String, ForeignKey("vendors.id"))
    title        = Column(String)
    status       = Column(String, default="draft")
    sent_at      = Column(String, nullable=True)
    due_date     = Column(String, nullable=True)
    completed_at = Column(String, nullable=True)
    score        = Column(Integer, nullable=True)


class Contract(Base):
    __tablename__ = "contracts"

    id             = Column(String, primary_key=True, index=True)
    vendor_id      = Column(String, ForeignKey("vendors.id"))
    title          = Column(String)
    start_date     = Column(String)
    end_date       = Column(String)
    value          = Column(Float, nullable=True)
    sla_compliance = Column(Float, default=100.0)
    status         = Column(String, default="active")
    auto_renew     = Column(Boolean, default=False)
