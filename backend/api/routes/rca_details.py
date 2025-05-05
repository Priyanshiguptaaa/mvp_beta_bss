from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models.rca_detail import RCADetail, RCADetailCreate, RCADetailRead
from api.database.database import get_db
from typing import List
import json

router = APIRouter(prefix="/rca_details", tags=["rca_details"])

@router.get("/", response_model=List[RCADetailRead])
def list_rca_details(db: Session = Depends(get_db)):
    return db.query(RCADetail).all()

@router.get("/{rca_id}", response_model=RCADetailRead)
def get_rca_detail(rca_id: int, db: Session = Depends(get_db)):
    rca = db.query(RCADetail).filter(RCADetail.id == rca_id).first()
    if not rca:
        raise HTTPException(status_code=404, detail="RCA detail not found")
    # Convert contributing_factors from string to list
    if rca.contributing_factors:
        try:
            rca.contributing_factors = json.loads(rca.contributing_factors)
        except Exception:
            rca.contributing_factors = rca.contributing_factors.split(",")
    return rca

@router.post("/", response_model=RCADetailRead)
def create_rca_detail(rca: RCADetailCreate, db: Session = Depends(get_db)):
    factors = json.dumps(rca.contributing_factors) if rca.contributing_factors else "[]"
    db_rca = RCADetail(
        incident_id=rca.incident_id,
        summary=rca.summary,
        root_cause=rca.root_cause,
        contributing_factors=factors,
        replay=rca.replay,
        resolution=rca.resolution,
        status=rca.status
    )
    db.add(db_rca)
    db.commit()
    db.refresh(db_rca)
    return db_rca

@router.put("/{rca_id}", response_model=RCADetailRead)
def update_rca_detail(rca_id: int, rca: RCADetailCreate, db: Session = Depends(get_db)):
    db_rca = db.query(RCADetail).filter(RCADetail.id == rca_id).first()
    if not db_rca:
        raise HTTPException(status_code=404, detail="RCA detail not found")
    db_rca.incident_id = rca.incident_id
    db_rca.summary = rca.summary
    db_rca.root_cause = rca.root_cause
    db_rca.contributing_factors = json.dumps(rca.contributing_factors) if rca.contributing_factors else "[]"
    db_rca.replay = rca.replay
    db_rca.resolution = rca.resolution
    db_rca.status = rca.status
    db.commit()
    db.refresh(db_rca)
    return db_rca

@router.delete("/{rca_id}")
def delete_rca_detail(rca_id: int, db: Session = Depends(get_db)):
    db_rca = db.query(RCADetail).filter(RCADetail.id == rca_id).first()
    if not db_rca:
        raise HTTPException(status_code=404, detail="RCA detail not found")
    db.delete(db_rca)
    db.commit()
    return {"ok": True} 