from fastapi import APIRouter, HTTPException
import os
import json

router = APIRouter()

TESTING_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "testing"
)
OUTPUT_FILE = os.path.join(TESTING_DIR, "output.txt")

@router.post("/sanity-scheduler/run-test")
def run_sanity_test():
    # Only read and parse output.txt, do not run agent
    try:
        with open(OUTPUT_FILE, "r") as f:
            output = f.read()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to read output.txt: {e}"
        )
    # Try to parse as JSON, else return as text
    try:
        parsed = json.loads(output)
        return {"result": parsed}
    except Exception:
        return {"result": output} 