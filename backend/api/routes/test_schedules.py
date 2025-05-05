from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models.test_schedule import TestSchedule, TestScheduleCreate, TestScheduleRead
from api.database.database import get_db
from typing import List

router = APIRouter(prefix="/test_schedules", tags=["test_schedules"])

@router.get("/", response_model=List[TestScheduleRead])
def list_test_schedules(db: Session = Depends(get_db)):
    return db.query(TestSchedule).all()

@router.get("/{test_id}", response_model=TestScheduleRead)
def get_test_schedule(test_id: int, db: Session = Depends(get_db)):
    test = db.query(TestSchedule).filter(TestSchedule.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test schedule not found")
    return test

@router.post("/", response_model=TestScheduleRead)
def create_test_schedule(test: TestScheduleCreate, db: Session = Depends(get_db)):
    db_test = TestSchedule(
        date=test.date,
        test_name=test.test_name,
        description=test.description,
        tags=",".join(test.tags),
        time=test.time
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

@router.put("/{test_id}", response_model=TestScheduleRead)
def update_test_schedule(test_id: int, test: TestScheduleCreate, db: Session = Depends(get_db)):
    db_test = db.query(TestSchedule).filter(TestSchedule.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Test schedule not found")
    db_test.date = test.date
    db_test.test_name = test.test_name
    db_test.description = test.description
    db_test.tags = ",".join(test.tags)
    db_test.time = test.time
    db.commit()
    db.refresh(db_test)
    return db_test

@router.delete("/{test_id}")
def delete_test_schedule(test_id: int, db: Session = Depends(get_db)):
    db_test = db.query(TestSchedule).filter(TestSchedule.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Test schedule not found")
    db.delete(db_test)
    db.commit()
    return {"ok": True} 