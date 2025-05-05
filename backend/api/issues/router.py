from fastapi import APIRouter

router = APIRouter(
    prefix="/issues",
    tags=["issues"]
)

@router.get("/")
async def list_issues():
    return {"issues": []} 