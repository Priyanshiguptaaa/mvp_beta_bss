from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from api.database.database import get_db
from agents.test_execution_agent import TestExecutionAgent
from api.models.database import TestResult, Incident
from typing import Dict, Any, List
from datetime import datetime
import json

router = APIRouter()

@router.post("/run-test")
def run_sanity_test(test_config: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Run a sanity test using the TestExecutionAgent
    
    Args:
        test_config: Test configuration including:
            - test_name: Name of the test
            - instruction: Test instruction
            - agent: Agent to test
            - environment: Environment to run test in
            - expected_behavior: Expected behavior description
    """
    try:
        test_agent = TestExecutionAgent(db)
        result = test_agent.execute_test(test_config)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to run test: {str(e)}"
        )

@router.post("/run-batch-tests")
def run_batch_tests(test_configs: list[Dict[str, Any]], db: Session = Depends(get_db)):
    """
    Run multiple sanity tests in batch
    
    Args:
        test_configs: List of test configurations
    """
    try:
        test_agent = TestExecutionAgent(db)
        results = test_agent.execute_batch_tests(test_configs)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to run batch tests: {str(e)}"
        )

@router.get("/test-results")
def get_test_results(db: Session = Depends(get_db)):
    """
    Get all test results with their associated incidents
    """
    try:
        test_results = db.query(TestResult).order_by(TestResult.created_at.desc()).all()
        results = []
        for tr in test_results:
            # Fetch previous runs for the same test_name and agent, excluding this run
            history_q = db.query(TestResult).filter(
                TestResult.test_name == tr.test_name,
                TestResult.agent == tr.agent,
                TestResult.id != tr.id
            ).order_by(TestResult.created_at.desc()).all()
            history = [
                {
                    "id": h.id,
                    "timestamp": h.created_at.strftime("%b %d, %Y, %I:%M %p"),
                    "agentVersion": "1.0.0",  # Placeholder, update if you have versioning
                    "status": h.status,
                    "promptBefore": h.instruction,
                    "promptAfter": h.instruction,  # Placeholder, update if you track prompt changes
                    "settingsBefore": {},  # Placeholder
                    "settingsAfter": {},   # Placeholder
                }
                for h in history
            ]
            results.append({
                "id": tr.id,
                "testName": tr.test_name,
                "runDate": tr.created_at.strftime("%b %d, %Y, %I:%M %p"),
                "status": tr.status,
                "details": tr.details or "",
                "incidentId": tr.incident.id if tr.incident else None,
                "agent": tr.agent,
                "environment": tr.environment,
                "history": history
            })
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch test results: {str(e)}"
        )

@router.get("/incidents/{incident_id}")
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific incident, including its RCA report
    """
    try:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        # Flatten rca_report if nested
        rca = incident.rca_report
        if isinstance(rca, dict) and "rca_report" in rca:
            rca = rca["rca_report"]
        desc = incident.description
        if isinstance(desc, str):
            try:
                desc = json.loads(desc)
            except Exception:
                pass  # fallback to string if not valid JSON
        return {
            "id": incident.id,
            "title": incident.title,
            "description": desc,
            "rca_report": rca,
            "status": incident.status,
            "severity": incident.severity,
            "agent": incident.agent,
            "created_at": incident.created_at.strftime("%b %d, %Y, %I:%M %p"),
            "updated_at": incident.updated_at.strftime("%b %d, %Y, %I:%M %p"),
            "resolved_at": incident.resolved_at.strftime("%b %d, %Y, %I:%M %p") if incident.resolved_at else None,
            "test_result": {
                "id": incident.test_result.id,
                "test_name": incident.test_result.test_name,
                "instruction": incident.test_result.instruction,
                "expected_behavior": incident.test_result.expected_behavior,
                "status": incident.test_result.status,
                "details": incident.test_result.details,
                "run_date": incident.test_result.created_at.strftime("%b %d, %Y, %I:%M %p")
            } if incident.test_result else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch incident details: {str(e)}"
        )

@router.get("/incidents")
def list_incidents(db: Session = Depends(get_db)):
    """
    List all incidents with RCA details and associated test results (if any)
    """
    try:
        incidents = db.query(Incident).order_by(Incident.created_at.desc()).all()
        result = []
        for incident in incidents:
            result.append({
                "id": incident.id,
                "title": incident.title,
                "description": incident.description,
                "rca_report": incident.rca_report,
                "status": incident.status,
                "severity": incident.severity,
                "agent": incident.agent,
                "created_at": incident.created_at.strftime("%b %d, %Y, %I:%M %p"),
                "updated_at": incident.updated_at.strftime("%b %d, %Y, %I:%M %p"),
                "resolved_at": incident.resolved_at.strftime("%b %d, %Y, %I:%M %p") if incident.resolved_at else None,
                "test_result": {
                    "id": incident.test_result.id,
                    "test_name": incident.test_result.test_name,
                    "instruction": incident.test_result.instruction,
                    "expected_behavior": incident.test_result.expected_behavior,
                    "status": incident.test_result.status,
                    "details": incident.test_result.details,
                    "run_date": incident.test_result.created_at.strftime("%b %d, %Y, %I:%M %p")
                } if incident.test_result else None
            })
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch incidents: {str(e)}"
        ) 