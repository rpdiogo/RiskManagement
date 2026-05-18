from sqlalchemy import Column, String, Integer
from ..database import Base

class MonthlySnapshot(Base):
    __tablename__ = "monthly_snapshots"

    month    = Column(String, primary_key=True)   # "YYYY-MM"
    total    = Column(Integer, default=0)
    critical = Column(Integer, default=0)
    high     = Column(Integer, default=0)
    medium   = Column(Integer, default=0)
    low      = Column(Integer, default=0)
