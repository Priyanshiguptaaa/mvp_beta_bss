from fastapi import APIRouter
from .sanity_scheduler import router as sanity_scheduler_router
from .rca_details import router as rca_details_router
from .test_schedules import router as test_schedules_router
from .incidents import router as incidents_router

api_router = APIRouter()

# Include all routers
api_router.include_router(
    sanity_scheduler_router,
    prefix="/api/scheduler",
    tags=["scheduler"]
)
api_router.include_router(
    rca_details_router,
    prefix="/api/rca",
    tags=["rca"]
)
api_router.include_router(
    test_schedules_router,
    prefix="/api/test-schedules",
    tags=["test-schedules"]
)
api_router.include_router(
    incidents_router,
    prefix="/api/incidents",
    tags=["incidents"]
) 