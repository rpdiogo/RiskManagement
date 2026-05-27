from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from ..database import Base

class Risk(Base):
    __tablename__ = "risks"

    id          = Column(String, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    description = Column(Text)
    category    = Column(String)
    level       = Column(String)
    probability = Column(Integer)
    impact      = Column(Integer)
    score       = Column(Integer)
    status      = Column(String, default="open")
    owner       = Column(String)
    trend                = Column(String, default="stable")
    residual_probability = Column(Integer, nullable=True)
    residual_impact      = Column(Integer, nullable=True)
    residual_score       = Column(Integer, nullable=True)
    residual_level       = Column(String, nullable=True)
    vendor_id            = Column(String, ForeignKey("vendors.id"), nullable=True)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, server_default=func.now(), onupdate=func.now())
