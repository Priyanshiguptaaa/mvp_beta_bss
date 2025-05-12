from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from logging.handlers import RotatingFileHandler
from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import json

from api.database.database import engine, get_db
from api.models.database import Base as DatabaseBase, User, Trace as DBTrace
from api.routes import api_router
from api.auth.router import router as auth_router
from agents import DataIngestionAgent, RCAAgent, EvaluationAgent

# Set up logging
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)

# Create a logger
logger = logging.getLogger(__name__)
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
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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
    secret_key="super-secret-key"  # Replace with secure key in production
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
app.include_router(api_router)


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


class TraceModel(BaseModel):
    id: int
    user_id: int
    content: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


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
    traces: List[TraceModel] = []


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
traces_db: Dict[str, TraceModel] = {}


@app.get("/system_health")
async def get_system_health() -> SystemHealth:
    return SystemHealth(
        total_models=len(models_db),
        active_models=len([
            m for m in models_db.values() if m.status == "active"
        ]),
        open_incidents=len([
            i for i in incidents_db.values() if i.status != "resolved"
        ]),
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
        return [log for log in logs_db.values() if log.model_id == model_id]
    return list(logs_db.values())


@app.get("/traces")
async def get_traces(model_id: Optional[str] = None) -> List[TraceModel]:
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
    """
    Health check endpoint for load balancer and monitoring.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


class RCAOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.data_agent = DataIngestionAgent(db)
        self.rca_agent = RCAAgent()
        self.eval_agent = EvaluationAgent(db)

    async def analyze_user_data(self, user_id: int) -> dict:
        """Analyze user data"""
        try:
            # Process traces
            self.data_agent.process_traces(user_id=user_id)
            
            # Get analysis data
            analysis_data = self.data_agent.get_analysis_data()
            
            # Get evaluation metrics
            eval_metrics = self.eval_agent.evaluate_metrics(user_id)
            
            # Add evaluation metrics to analysis data
            analysis_data['data']['evaluation_metrics'] = eval_metrics
            
            # Get RCA analysis
            rca_result = self.rca_agent.analyze_data(analysis_data)
            
            if rca_result.get('status') == 'error':
                error_msg = rca_result.get('error', 'Unknown error')
                logger.error(f"RCA analysis failed: {error_msg}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error in RCA analysis: {error_msg}"
                )
            
            return {
                'user_id': user_id,
                'rca_result': rca_result['rca_report']
            }
            
        except Exception as e:
            logger.error(f"Error in RCA analysis: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error performing RCA analysis: {str(e)}"
            )


@app.post("/api/rca/analyze/{user_id}")
async def analyze_user_data(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Analyze user data"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Run analysis
        orchestrator = RCAOrchestrator(db)
        return await orchestrator.analyze_user_data(user_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in RCA endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )


@app.get("/api/rca/status/{user_id}")
async def get_analysis_status(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Check if data is available for RCA analysis for a specific user
    """
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}

        # Get traces for the user
        traces = db.query(DBTrace).filter(DBTrace.user_id == user_id).all()
        
        # Count traces
        trace_count = len(traces)
        
        # Get latest trace
        latest_trace = db.query(DBTrace).filter(
            DBTrace.user_id == user_id
        ).order_by(DBTrace.created_at.desc()).first()
        
        # Prepare metadata
        metadata = {
            'total_traces': trace_count,
            'time_range': {
                'start': (
                    traces[0].created_at.isoformat() if traces else None
                ),
                'end': (
                    latest_trace.created_at.isoformat() 
                    if latest_trace else None
                )
            },
            'data_types': {
                'interactions': sum(
                    1 for t in traces if t.type == 'interaction'
                ),
                'logs': sum(1 for t in traces if t.type == 'log'),
                'metrics': sum(1 for t in traces if t.type == 'metric')
            }
        }
        
        # Get latest trace details if available
        latest_trace_details = None
        if latest_trace:
            try:
                content = (
                    latest_trace.content 
                    if isinstance(latest_trace.content, dict) 
                    else json.loads(latest_trace.content)
                )
                latest_trace_details = {
                    'trace_id': latest_trace.id,
                    'type': latest_trace.type,
                    'content': content,
                    'timestamp': latest_trace.created_at.isoformat()
                }
            except Exception as e:
                logger.error(f"Error parsing latest trace content: {str(e)}")
        
        return {
            "user_id": user_id,
            "status": "data_available" if trace_count > 0 else "no_data",
            "trace_count": trace_count,
            "latest_trace": latest_trace_details,
            "metadata": metadata,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in get_analysis_status: {str(e)}")
        return {"error": str(e)}

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