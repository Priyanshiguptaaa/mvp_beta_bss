from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models.incident import Incident, IncidentCreate, IncidentRead, SeverityEnum, StatusEnum
from api.database.database import get_db
from typing import List
from datetime import datetime

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("/", response_model=List[IncidentRead])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).all()

@router.get("/{incident_id}", response_model=IncidentRead)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/", response_model=IncidentRead)
def create_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    db_incident = Incident(**incident.dict())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.put("/{incident_id}", response_model=IncidentRead)
def update_incident(incident_id: int, incident: IncidentCreate, db: Session = Depends(get_db)):
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    for key, value in incident.dict().items():
        setattr(db_incident, key, value)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.delete("/{incident_id}")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(db_incident)
    db.commit()
    return {"ok": True} 