from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from ..models.database import get_db, Trace
from ..decorators import log_function_call
from typing import Dict, Any, Optional
from datetime import datetime

router = APIRouter()

@router.post("/log_function")
@log_function_call
def log_function_call_endpoint(
    function_name: str = Body(...),
    args: Dict[str, Any] = Body(...),
    output: Any = Body(...),
    llm_prompt: Optional[Dict[str, Any]] = Body(None),
    metadata: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db)
):
    # Create a new trace record
    trace = Trace(
        content={
            "function_name": function_name,
            "args": args,
            "output": output,
            "llm_prompt": llm_prompt,
            "metadata": metadata
        },
        file_name=metadata.get("file_name") if metadata else None,
        file_size=metadata.get("file_size") if metadata else None,
        status="completed"
    )
    
    db.add(trace)
    db.commit()
    db.refresh(trace)
    
    return {"message": "Function call logged successfully", "trace_id": trace.id} 