"""
How to run:
1. Start the server:
   uvicorn testing.ingestion_agent:app --reload
2. POST scenarios to http://127.0.0.1:8000/ingest
3. GET all concatenated data at http://127.0.0.1:8000/all
"""
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from sqlalchemy import create_engine, Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy setup
DATABASE_URL = "sqlite:///scenarios.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ScenarioDB(Base):
    __tablename__ = "scenarios"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(Text, nullable=False)  # Store the full scenario as JSON string

Base.metadata.create_all(bind=engine)

app = FastAPI()

class LogEntry(BaseModel):
    log_id: str
    timestamp: str
    log_level: str
    service: str
    message: str
    details: Dict[str, Any]
    trace_id: str

class LLMCall(BaseModel):
    call_id: str
    timestamp: str
    system_message: str
    user_prompt: str
    model_output: str
    confidence: float
    parent_call_id: Optional[str] = ""
    metadata: Dict[str, Any]

class TraceEntry(BaseModel):
    trace_id: str
    parent_id: Optional[str] = ""
    service: str
    operation: str
    start_time: str
    end_time: str
    duration_ms: int
    status: str
    attributes: Dict[str, Any]

class Metrics(BaseModel):
    latency_ms: int
    throughput: int
    error_rate: float
    resource_usage: Dict[str, Any]

class Scenario(BaseModel):
    user_input: str
    system_output: str
    prod_logs: List[LogEntry]
    llm_calls: List[LLMCall]
    traces: List[TraceEntry]
    metrics: Metrics

@app.post("/ingest")
async def ingest_scenario(scenario: Scenario):
    db = SessionLocal()
    db_obj = ScenarioDB(data=scenario.json())
    db.add(db_obj)
    db.commit()
    db.close()
    return {"status": "received"}

@app.get("/all")
async def get_all():
    db = SessionLocal()
    scenarios = db.query(ScenarioDB).all()
    db.close()
    return [json.loads(s.data) for s in scenarios]

@app.get("/health")
async def health():
    return {"status": "ok"} 