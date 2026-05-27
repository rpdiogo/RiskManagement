from sqlalchemy import Column, String, Integer
from ..database import Base


class ControlEvidence(Base):
    __tablename__ = "control_evidence"

    id            = Column(String, primary_key=True)
    control_id    = Column(String, nullable=False, index=True)
    original_name = Column(String, nullable=False)
    stored_name   = Column(String, nullable=False)   # filename on disk
    file_size     = Column(Integer, default=0)
    mime_type     = Column(String, default="application/octet-stream")
    uploaded_at   = Column(String, nullable=False)
    uploaded_by   = Column(String, default="")
    notes         = Column(String, default="")
