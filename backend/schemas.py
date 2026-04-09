from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class PasswordReset(BaseModel):
    user_id: int
    new_password: str

class UserAdminResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    role: str
    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    modules: int = 0
    lessons: int = 0
    image_url: Optional[str] = None
    status: str = "not_started"
    progress: int = 0

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int

    class Config:
        from_attributes = True
