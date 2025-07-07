from pydantic import BaseModel, EmailStr, ConfigDict, field_serializer
from typing import Optional
from datetime import datetime
from pydantic import Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Response model for user data."""
    id: int
    email: str
    full_name: str = Field(..., alias="name")
    is_active: bool
    created_at: datetime
    api_key: str

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("full_name")
    def get_full_name(self, value, info):
        # Map full_name to the SQLAlchemy model's 'name' field
        if hasattr(info.data, "name"):
            return info.data.name
        return value

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None 