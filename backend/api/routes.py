from fastapi import APIRouter
from api.auth.router import router as auth_router
from api.endpoints.projects import router as projects_router
from api.user_endpoint.routes import router as user_endpoint_router
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Create the main API router
api_router = APIRouter()

# Include essential routers for MVP
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(projects_router, tags=["projects"])
api_router.include_router(user_endpoint_router, prefix="/user", tags=["user"]) 