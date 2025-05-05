from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel
import enum

Base = declarative_base()

class SeverityEnum(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"

class StatusEnum(str, enum.Enum):
    investigating = "investigating"
    mitigated = "mitigated"
    resolved = "resolved"

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    severity = Column(Enum(SeverityEnum), nullable=False)
    status = Column(Enum(StatusEnum), nullable=False)
    time = Column(DateTime, default=datetime.utcnow)
    impact = Column(Integer, default=0)
    description = Column(String, default="")

class IncidentCreate(BaseModel):
    title: str
    severity: SeverityEnum
    status: StatusEnum
    time: datetime
    impact: int
    description: str = ""

class IncidentRead(BaseModel):
    id: int
    title: str
    severity: SeverityEnum
    status: StatusEnum
    time: datetime
    impact: int
    description: str

    class Config:
        orm_mode = True 