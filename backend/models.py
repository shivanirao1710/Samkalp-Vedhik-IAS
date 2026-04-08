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
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # or Enum(UserRole)
