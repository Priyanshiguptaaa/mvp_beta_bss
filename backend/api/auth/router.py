from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict, ValidationError, EmailStr
import logging
import re
from slowapi import Limiter
from slowapi.util import get_remote_address
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse, JSONResponse
from starlette.config import Config
import os

from ..database.database import get_db
from ..models.database import User, AuditLog
from ..models.user import UserCreate, UserLogin, UserResponse, Token, TokenData
from config.settings import settings

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# GitHub OAuth config
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_CALLBACK_URL = f"https://{os.getenv('RAILWAY_PUBLIC_DOMAIN')}/auth/github/callback"

config = Config(environ={
    'GITHUB_CLIENT_ID': GITHUB_CLIENT_ID,
    'GITHUB_CLIENT_SECRET': GITHUB_CLIENT_SECRET,
})

oauth = OAuth(config)
oauth.register(
    name='github',
    client_id=GITHUB_CLIENT_ID,
    client_secret=GITHUB_CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

class TokenResponse(BaseModel):
    """Response model for token responses"""
    user: UserResponse
    token: str
    token_type: str = "bearer"
    expires_in: int

    model_config = ConfigDict(from_attributes=True)

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Password validation regex
PASSWORD_REGEX = re.compile(r'.{6,}$')  # Just require minimum 6 characters for now

def validate_password(password: str) -> bool:
    """Validate password strength."""
    return bool(PASSWORD_REGEX.match(password))

def validate_email(email: str) -> bool:
    """Validate email format."""
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    """
    logger.debug("Verifying password")
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        logger.debug(f"Password verification result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error verifying password: {str(e)}")
        return False

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    """
    logger.debug(f"Attempting to authenticate user: {email}")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        logger.warning(f"User not found: {email}")
        return None
    
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Invalid password for user: {email}")
        return None
    
    logger.info(f"User authenticated successfully: {email}")
    return user

def get_password_hash(password: str) -> str:
    """
    Hash a password for storing.
    """
    logger.debug("Hashing password")
    try:
        hashed = pwd_context.hash(password)
        logger.debug("Password hashed successfully")
        return hashed
    except Exception as e:
        logger.error(f"Error hashing password: {str(e)}")
        raise

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def is_demo_token(token: str) -> bool:
    """Check if the token is a demo token."""
    return token.startswith("demo_token_")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Get current user from JWT token or demo token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Handle demo token
    if is_demo_token(token):
        # Create or get a demo user
        demo_email = f"demo_{token.split('_')[-1]}@example.com"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                full_name="Demo User",
                hashed_password='',
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    # Handle JWT token
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    try:
        user = db.query(User).filter(User.email == token_data.email).first()
        if user is None:
            raise credentials_exception
        return user
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise credentials_exception

@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    """
    try:
        # Log the raw request body
        body = await request.body()
        logger.info(f"Raw request body: {body}")
        logger.info(f"Content-Type header: {request.headers.get('content-type')}")
        logger.info(f"Parsed user_data: {user_data}")
        logger.info(f"Attempting to register user: {user_data.email}")
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            logger.info(f"User already exists: {user_data.email}")
            # If it's a demo user, return their token
            if user_data.email.startswith('demo_'):
                access_token = create_access_token(
                    data={"sub": user_data.email},
                    expires_delta=timedelta(days=7)  # Demo tokens last longer
                )
                return TokenResponse(
                    user=UserResponse.from_orm(existing_user),
                    token=access_token,
                    expires_in=7 * 24 * 60 * 60  # 7 days in seconds
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        logger.info("Creating new user...")
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            is_active=True
        )
        
        db.add(db_user)
        db.flush()
        
        # Create audit log
        audit_log = AuditLog(
            user_id=db_user.id,
            action_type="register",
            resource_type="user",
            resource_id=db_user.id,
            meta_data={
                "ip_address": request.client.host if request.client else None,
                "details": f"User registered: {db_user.email}"
            }
        )
        db.add(audit_log)
        
        # Commit both user and audit log
        db.commit()
        logger.info(f"User created successfully: {db_user.id}")
        
        # Create access token
        access_token_expires = timedelta(days=7 if user_data.email.startswith('demo_') else settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data.email},
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            user=UserResponse.from_orm(db_user),
            token=access_token,
            expires_in=7 * 24 * 60 * 60 if user_data.email.startswith('demo_') else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
    except Exception as e:
        logger.error(f"Error in registration: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    try:
        # Use email as username since that's what we're using for authentication
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Create single audit log
        audit_log = AuditLog(
            user_id=user.id,
            action_type="login",
            resource_type="user",
            resource_id=user.id,
            meta_data={
                "ip_address": request.client.host if request.client else None,
                "details": f"User logged in: {user.email}"
            }
        )
        db.add(audit_log)
        db.commit()
        
        return TokenResponse(
            user=UserResponse.from_orm(user),
            token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout the current user.
    """
    try:
        # Create single audit log
        audit_log = AuditLog(
            user_id=current_user.id,
            action_type="logout",
            resource_type="user",
            resource_id=current_user.id,
            meta_data={
                "ip_address": request.client.host if request.client else None,
                "details": f"User logged out: {current_user.email}"
            }
        )
        db.add(audit_log)
        db.commit()
        
        return {"message": "Successfully logged out"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during logout"
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    """
    return UserResponse.from_orm(current_user)

@router.get("/github/login")
async def github_login(request: Request):
    redirect_uri = GITHUB_CALLBACK_URL
    return await oauth.github.authorize_redirect(request, redirect_uri)

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    try:
        logger.info("Received GitHub callback")
        token = await oauth.github.authorize_access_token(request)
        logger.info("Successfully obtained access token")
        
        resp = await oauth.github.get('user', token=token)
        user_data = resp.json()
        logger.info(f"Retrieved user data: {user_data.get('login')}")
        
        email = user_data.get('email')
        if not email:
            logger.info("Email not in public profile, fetching from emails endpoint")
            emails_resp = await oauth.github.get('user/emails', token=token)
            emails = emails_resp.json()
            email = next((e['email'] for e in emails if e.get('primary')), None)
            
        if not email:
            logger.error("No email found in GitHub profile")
            return JSONResponse(
                {"error": "Email not available from GitHub. Please make your email public or use a different authentication method."},
                status_code=400
            )
            
        logger.info(f"Processing user with email: {email}")
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.info(f"Creating new user for email: {email}")
            user = User(
                email=email,
                full_name=user_data.get('name') or user_data.get('login'),
                hashed_password='',  # Not used for OAuth
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user with ID: {user.id}")
        else:
            logger.info(f"Found existing user with ID: {user.id}")
            
        # Issue JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        logger.info("Generated JWT token")
        
        # Get frontend URL from environment
        frontend_url = os.getenv("FRONTEND_URL")
        if not frontend_url:
            logger.error("FRONTEND_URL not configured")
            return JSONResponse(
                {"error": "Server configuration error. Please contact support."},
                status_code=500
            )
            
        # Redirect to frontend with token
        redirect_url = f"{frontend_url}/auth/callback?token={access_token}"
        logger.info(f"Redirecting to: {frontend_url}/auth/callback")
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.error(f"GitHub OAuth error: {str(e)}", exc_info=True)
        return JSONResponse(
            {"error": "Authentication failed. Please try again."},
            status_code=400
        ) 