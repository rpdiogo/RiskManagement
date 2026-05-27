from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from ..database import Base


class Control(Base):
    __tablename__ = "controls"

    id              = Column(String, primary_key=True, index=True)   # ex: "A.8.7"
    code            = Column(String)                                 # ex: "A.8.7"
    name            = Column(String, nullable=False)
    description     = Column(Text)                                   # texto oficial ISO
    category        = Column(String)                                 # Organizacional | Pessoas | Físico | Tecnológico
    framework_refs  = Column(Text)                                   # "ISO 27001:2022 A.8.7 · NIS2 Art.21(2)(g)"
    status          = Column(String, default="not_implemented")     # implemented | partial | planned | not_implemented | not_applicable
    effectiveness   = Column(String, default="untested")            # effective | needs_improvement | ineffective | untested
    owner           = Column(String)
    risk_ids        = Column(Text, default="")                       # CSV de risk IDs
    notes           = Column(Text)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, server_default=func.now(), onupdate=func.now())
