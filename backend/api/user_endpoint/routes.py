from fastapi import APIRouter, Depends, Body, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..models.database import get_db, Trace, User, generate_api_key
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel
from pathlib import Path
import logging
import json
from api.auth.router import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Security
security = HTTPBearer()

# Data models
class Interaction(BaseModel):
    prompt: str
    response: str
    model: str
    start_time: datetime
    end_time: datetime
    metadata: Optional[Dict[str, Any]] = None

class LogEntry(BaseModel):
    timestamp: datetime
    type: str
    data: Dict[str, Any]

class Metric(BaseModel):
    timestamp: datetime
    value: float
    tags: Dict[str, str]

class TraceData(BaseModel):
    trace_id: str
    name: str
    start_time: datetime
    end_time: datetime
    attributes: Dict[str, Any]

class UploadData(BaseModel):
    interactions: List[Dict[str, Any]]
    logs: List[Dict[str, Any]]
    metrics: Dict[str, List[Dict[str, Any]]]
    traces: List[Dict[str, Any]]

# Storage configuration
DATA_DIR = Path("backend/server_data")
for subdir in ["interactions", "logs", "metrics", "traces"]:
    (DATA_DIR / subdir).mkdir(parents=True, exist_ok=True)

# API key validation
def validate_api_key(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> str:
    """Validate the API key from the Authorization header."""
    api_key = credentials.credentials
    
    # Check if API key exists in database
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    
    return api_key

@router.post("/upload_data")
async def upload_data(
    data: UploadData,
    api_key: str = Depends(validate_api_key),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Handle data upload from EchoSysAI SDK and store in database.
    
    Args:
        data: The uploaded data containing interactions, logs, metrics, and traces
        api_key: Validated API key from the Authorization header
        db: Database session
        
    Returns:
        Dictionary with upload status
    """
    try:
        # Get user from API key
        user = db.query(User).filter(User.api_key == api_key).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid API key")

        # Process interactions
        for interaction in data.interactions:
            # Convert string timestamps to datetime objects if needed
            start_time = interaction.get("start_time")
            end_time = interaction.get("end_time")
            
            if isinstance(start_time, str):
                start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            if isinstance(end_time, str):
                end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            trace = Trace(
                user_id=user.id,  # Set the user_id
                content={
                    "type": "interaction",
                    "data": {
                        **interaction,
                        "start_time": start_time.isoformat() if start_time else None,
                        "end_time": end_time.isoformat() if end_time else None
                    }
                },
                status="completed",
                created_at=start_time or datetime.utcnow()
            )
            db.add(trace)
        
        # Process logs
        for log in data.logs:
            timestamp = log.get("timestamp")
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            trace = Trace(
                user_id=user.id,  # Set the user_id
                content={
                    "type": "log",
                    "data": {
                        **log,
                        "timestamp": timestamp.isoformat() if timestamp else None
                    }
                },
                status="completed",
                created_at=timestamp or datetime.utcnow()
            )
            db.add(trace)
        
        # Process metrics
        for metric_name, metric_data in data.metrics.items():
            for metric in metric_data:
                timestamp = metric.get("timestamp")
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                
                trace = Trace(
                    user_id=user.id,  # Set the user_id
                    content={
                        "type": "metric",
                        "metric_name": metric_name,
                        "data": {
                            **metric,
                            "timestamp": timestamp.isoformat() if timestamp else None
                        }
                    },
                    status="completed",
                    created_at=timestamp or datetime.utcnow()
                )
                db.add(trace)
        
        # Process traces
        for trace_data in data.traces:
            start_time = trace_data.get("start_time")
            end_time = trace_data.get("end_time")
            
            if isinstance(start_time, str):
                start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            if isinstance(end_time, str):
                end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            trace = Trace(
                user_id=user.id,  # Set the user_id
                content={
                    "type": "trace",
                    "data": {
                        **trace_data,
                        "start_time": start_time.isoformat() if start_time else None,
                        "end_time": end_time.isoformat() if end_time else None
                    }
                },
                status="completed",
                created_at=start_time or datetime.utcnow()
            )
            db.add(trace)
        
        # Commit all changes
        db.commit()
        
        return {
            "status": "success",
            "message": "Data uploaded successfully",
            "counts": {
                "interactions": len(data.interactions),
                "logs": len(data.logs),
                "metrics": sum(len(metrics) for metrics in data.metrics.values()),
                "traces": len(data.traces)
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process upload: {str(e)}"
        )

@router.post("/regenerate_api_key")
async def regenerate_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Regenerate the API key for the current user.
    """
    try:
        # Generate new API key
        new_api_key = generate_api_key()
        current_user.api_key = new_api_key
        
        # Create audit log
        audit_log = AuditLog(
            user_id=current_user.id,
            action_type="regenerate_api_key",
            resource_type="user",
            resource_id=current_user.id,
            meta_data={
                "details": "API key regenerated"
            }
        )
        db.add(audit_log)
        
        # Commit changes
        db.commit()
        
        return {"api_key": new_api_key}
    except Exception as e:
        logger.error(f"Error regenerating API key: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error regenerating API key"
        )