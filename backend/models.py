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

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String)
    duration_mins = Column(Integer, default=60)
    total_questions = Column(Integer, default=0)
    status = Column(String, default="Published") # Published, Draft

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, index=True)
    text = Column(String, nullable=False)
    explanation = Column(String, nullable=True)
    points = Column(Integer, default=1)

class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, index=True)
    text = Column(String, nullable=False)
    is_correct = Column(Integer, default=0) # 0 for false, 1 for true

class StudentTestAttempt(Base):
    __tablename__ = "student_test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    test_id = Column(Integer, index=True)
    score = Column(Integer, default=0)
    percentage = Column(Integer, default=0)
    completed_at = Column(String) # For simplicity, using String for timestamps

class StudentAnswer(Base):
    __tablename__ = "student_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, index=True)
    question_id = Column(Integer, index=True)
    selected_option_id = Column(Integer)
    is_correct = Column(Integer) # Cached for performance
