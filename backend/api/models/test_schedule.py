from sqlalchemy import Column, Integer, String, Date, Time
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from typing import List

Base = declarative_base()

class TestSchedule(Base):
    __tablename__ = "test_schedules"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    test_name = Column(String, nullable=False)
    description = Column(String, default="")
    tags = Column(String, default="")  # Comma-separated tags
    time = Column(Time, nullable=False)

class TestScheduleCreate(BaseModel):
    date: str
    test_name: str
    description: str = ""
    tags: List[str] = []
    time: str

class TestScheduleRead(BaseModel):
    id: int
    date: str
    test_name: str
    description: str
    tags: List[str]
    time: str

    class Config:
        orm_mode = True 