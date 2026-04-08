from sqlalchemy import Column, Integer, String, Enum
from database import Base
import enum

class UserRole(enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # or Enum(UserRole)

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    modules = Column(Integer, default=0)
    lessons = Column(Integer, default=0)
    image_url = Column(String)
    status = Column(String, default="not_started") # not_started, in_progress, completed
    progress = Column(Integer, default=0)

