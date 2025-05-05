from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import List, Optional

Base = declarative_base()

class RCADetail(Base):
    __tablename__ = "rca_details"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    summary = Column(Text, default="")
    root_cause = Column(String, default="")
    contributing_factors = Column(Text, default="")  # JSON or comma-separated
    replay = Column(Text, default="")
    resolution = Column(Text, default="")
    status = Column(String, default="")

    incident = relationship("Incident")

class RCADetailCreate(BaseModel):
    incident_id: int
    summary: str = ""
    root_cause: str = ""
    contributing_factors: Optional[List[str]] = None
    replay: str = ""
    resolution: str = ""
    status: str = ""

class RCADetailRead(BaseModel):
    id: int
    incident_id: int
    summary: str
    root_cause: str
    contributing_factors: Optional[List[str]]
    replay: str
    resolution: str
    status: str

    class Config:
        orm_mode = True 