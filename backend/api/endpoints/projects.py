from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import logging
from api.models.database import get_db, Project, ProjectMember, User
from api.models.schemas import (
    ProjectCreate, ProjectResponse, ProjectMemberCreate, ProjectMemberResponse
)
from api.auth.router import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(
            f"Creating project: {project.name} for user: {current_user.email}"
        )
        logger.debug(f"Project data: {project.dict()}")
        
        # Check if project with the same name exists
        db_project = db.query(Project).filter(
            Project.name == project.name
        ).first()
        if db_project:
            logger.info(
                f"Project {project.name} already exists, adding user as member"
            )
            # Add user as member if not already
            member = db.query(ProjectMember).filter(
                ProjectMember.project_id == db_project.id,
                ProjectMember.email == current_user.email
            ).first()
            if not member:
                db_member = ProjectMember(
                    project_id=db_project.id,
                    user_id=current_user.id,
                    email=current_user.email,
                    role="member"
                )
                db.add(db_member)
                db.commit()
            db.refresh(db_project)
            return db_project

        logger.info("Creating new project")
        db_project = Project(
            name=project.name,
            description=project.description,
            color_scheme=project.color_scheme,
            owner_id=current_user.id,
            integrations=project.integrations or {}
        )
        db.add(db_project)
        db.flush()

        # Add owner as member
        logger.info("Adding owner as member")
        owner_member = ProjectMember(
            project_id=db_project.id,
            user_id=current_user.id,
            email=current_user.email,
            role="owner"
        )
        db.add(owner_member)

        # Add other members if any
        if project.members:
            logger.info(f"Adding {len(project.members)} additional members")
            for member in project.members:
                if member.email == current_user.email:
                    continue  # skip owner if in list
                db_member = ProjectMember(
                    project_id=db_project.id,
                    email=member.email,
                    role=member.role
                )
                db.add(db_member)

        db.commit()
        db.refresh(db_project)
        logger.info(f"Project created successfully with ID: {db_project.id}")
        return db_project

    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}"
        )


@router.get("/mine", response_model=List[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all projects where the current user is a member or owner.
    """
    try:
        # Projects where user is owner or member
        projects = (
            db.query(Project)
            .join(ProjectMember)
            .filter(ProjectMember.email == current_user.email)
            .options(joinedload(Project.members))  # Eager load members
            .all()
        )
        return projects
    except Exception as e:
        logger.error(f"Error fetching projects for user {current_user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching projects: {str(e)}"
        )


@router.post("/{project_id}/invite", response_model=ProjectMemberResponse)
def invite_member(
    project_id: int,
    member: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only owner can invite
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Check if current user is an owner in ProjectMember
    owner_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id,
        ProjectMember.role == "owner"
    ).first()
    if not owner_member:
        raise HTTPException(
            status_code=403,
            detail="Only project owners can invite members"
        )
    db_member = ProjectMember(
        project_id=project_id,
        user_id=member.user_id,
        email=member.email,
        role=member.role
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.get("/{project_id}/integrations")
def get_project_integrations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Only members can view
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.email == current_user.email
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"integrations": project.integrations or {}}


@router.patch("/{project_id}/integrations")
def update_project_integrations(
    project_id: int,
    integrations: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Only members can update
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.email == current_user.email
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized")
    project.integrations = integrations
    db.commit()
    db.refresh(project)
    return {"integrations": project.integrations}


@router.get("/", response_model=List[ProjectResponse])
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all projects (admin use, or for dashboard listing all projects).
    """
    projects = db.query(Project).all()
    return projects 