from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str
    role: str = "student"
    phone: Optional[str] = None
    location: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str = "student"

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    role: str
    phone: Optional[str] = None
    location: Optional[str] = None
    target_exam: Optional[str] = None
    department: Optional[str] = None
    profile_image: Optional[str] = None
    member_since: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    target_exam: Optional[str] = None
    department: Optional[str] = None
    preferences_json: Optional[str] = None

class PasswordReset(BaseModel):
    user_id: int
    new_password: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserAdminResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    role: str
    phone: Optional[str] = None
    location: Optional[str] = None
    member_since: Optional[datetime] = None
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

class LiveClassBase(BaseModel):
    title: str
    instructor: str
    date: str
    time: str
    duration: float
    capacity: int
    meeting_link: Optional[str] = None

class LiveClassCreate(LiveClassBase):
    pass

class LiveClassResponse(LiveClassBase):
    id: int
    registered: int
    status: str
    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"

class NotificationCreate(NotificationBase):
    sender_id: Optional[int] = None

class NotificationResponse(NotificationBase):
    id: int
    sender_id: Optional[int]
    created_at: datetime
    is_read: Optional[bool] = False
    read_count: Optional[int] = 0
    class Config:
        from_attributes = True

class NotificationReadMark(BaseModel):
    user_id: int

class AdminRequestCreate(BaseModel):
    subject: str
    message: str
    faculty_id: int
    faculty_name: str

class AdminRequestReply(BaseModel):
    reply: str

class AdminRequestResponse(BaseModel):
    id: int
    faculty_id: int
    faculty_name: str
    subject: str
    message: str
    status: str
    reply: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True
