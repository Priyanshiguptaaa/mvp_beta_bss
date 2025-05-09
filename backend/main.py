from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from logging.handlers import RotatingFileHandler
from pydantic import BaseModel
from datetime import datetime
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from typing import List, Optional, Dict

from api.database.database import engine
from api.models.database import Base as DatabaseBase
from api.routes import api_router
from api.auth.router import router as auth_router
from api.endpoints import projects
from config.settings import settings

# Set up logging
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)

# Create a logger
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# Create a file handler
file_handler = RotatingFileHandler(
    os.path.join(log_dir, 'app.log'),
    maxBytes=1024*1024,  # 1MB
    backupCount=5
)
file_handler.setLevel(logging.DEBUG)

# Create a console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)

# Create a formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add the handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Check if tables exist, create if they don't
try:
    logger.info("Checking database tables...")
    DatabaseBase.metadata.create_all(bind=engine)
    logger.info("Database tables verified successfully")
except Exception as e:
    logger.error(f"Error initializing database: {str(e)}")
    raise

# Determine if we're in development or production
is_development = os.getenv("ENVIRONMENT", "development") == "development"

app = FastAPI(
    title="EchosysAI API",
    description="API for EchosysAI platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key="super-secret-key"  # Replace with a secure, random value in production!
)

# Add database session middleware
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = None
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Error in request: {str(e)}")
        raise
    finally:
        # Ensure the session is closed
        db = request.state.db if hasattr(request.state, 'db') else None
        if db:
            db.close()
    return response

# Include routers
app.include_router(auth_router)

# Include the main API router
app.include_router(api_router)

# Models
class Model(BaseModel):
    id: str
    name: str
    version: str
    status: str
    last_updated: datetime

class Log(BaseModel):
    id: str
    timestamp: datetime
    level: str
    message: str
    model_id: str
    trace_id: Optional[str] = None

class Trace(BaseModel):
    id: str
    start_time: datetime
    end_time: datetime
    model_id: str
    status: str
    metadata: Dict[str, str]

class Incident(BaseModel):
    id: str
    model_id: str
    title: str
    description: str
    status: str
    severity: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    root_cause: Optional[str] = None
    logs: List[Log] = []
    traces: List[Trace] = []

class SystemHealth(BaseModel):
    total_models: int
    active_models: int
    open_incidents: int
    system_status: str
    last_rca: Optional[datetime]

# Mock database (replace with real database in production)
models_db: Dict[str, Model] = {}
incidents_db: Dict[str, Incident] = {}
logs_db: Dict[str, Log] = {}
traces_db: Dict[str, Trace] = {}

# Endpoints
@app.get("/system_health")
async def get_system_health() -> SystemHealth:
    return SystemHealth(
        total_models=len(models_db),
        active_models=len([m for m in models_db.values() if m.status == "active"]),
        open_incidents=len([i for i in incidents_db.values() if i.status != "resolved"]),
        system_status="healthy",
        last_rca=datetime.now()
    )

@app.get("/models")
async def get_models() -> List[Model]:
    return list(models_db.values())

@app.get("/incidents")
async def get_incidents(status: Optional[str] = None) -> List[Incident]:
    if status:
        return [i for i in incidents_db.values() if i.status == status]
    return list(incidents_db.values())

@app.get("/incidents/{incident_id}")
async def get_incident(incident_id: str) -> Incident:
    if incident_id not in incidents_db:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incidents_db[incident_id]

@app.get("/logs")
async def get_logs(model_id: Optional[str] = None) -> List[Log]:
    if model_id:
        return [l for l in logs_db.values() if l.model_id == model_id]
    return list(logs_db.values())

@app.get("/traces")
async def get_traces(model_id: Optional[str] = None) -> List[Trace]:
    if model_id:
        return [t for t in traces_db.values() if t.model_id == model_id]
    return list(traces_db.values())

@app.post("/chat")
async def chat(message: str) -> Dict[str, str]:
    # This is a placeholder for the chat functionality
    # In production, this would integrate with your RCA analysis engine
    return {"response": f"Analyzing your query about: {message}"}

@app.get("/")
async def root():
    return {"message": "Welcome to EchosysAI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=is_development,
        ssl_keyfile=os.getenv("SSL_KEYFILE") if not is_development else None,
        ssl_certfile=os.getenv("SSL_CERTFILE") if not is_development else None
    ) 