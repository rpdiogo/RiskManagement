from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from ..database import Base

class ActionPlan(Base):
    __tablename__ = "action_plans"

    id       = Column(String, primary_key=True, index=True)
    risk_id  = Column(String, ForeignKey("risks.id"), nullable=False)
    title    = Column(String, nullable=False)
    owner    = Column(String)
    due_date = Column(String)
    status   = Column(String, default="not_started")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
