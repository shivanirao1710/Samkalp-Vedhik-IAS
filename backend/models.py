from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, Float, Boolean
from database import Base
import enum
from datetime import datetime

class UserRole(enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # or Enum(UserRole)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    target_exam = Column(String, nullable=True)
    department = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    study_streak = Column(Integer, default=0)
    preferences_json = Column(Text, nullable=True)
    member_since = Column(DateTime, default=datetime.utcnow)
    is_suspended = Column(Boolean, default=False)
    scholarship_status = Column(String, default="pending") # pending, under_evaluation, approved, rejected
    scholarship_score = Column(Integer, nullable=True)
    scholarship_answers_json = Column(Text, nullable=True)

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

class PsychometricReport(Base):
    __tablename__ = "psychometric_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    user_name = Column(String, nullable=True)
    report_json = Column(Text, nullable=False)  # Full AI-generated report as JSON
    answers_json = Column(Text, nullable=True)  # Student answers as JSON
    created_at = Column(DateTime, default=datetime.utcnow)

class LiveClass(Base):
    __tablename__ = "live_classes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    instructor = Column(String)
    date = Column(String)
    time = Column(String)
    duration = Column(Float)
    capacity = Column(Integer, default=200)
    registered = Column(Integer, default=0)
    meeting_link = Column(String, nullable=True)
    status = Column(String, default="Upcoming")

class LiveClassEnrollment(Base):
    __tablename__ = "live_class_enrollments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    class_id = Column(Integer, index=True)

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    course_id = Column(Integer, index=True)
    status = Column(String, default="not_started")
    progress = Column(Integer, default=0)

class StudyMaterial(Base):
    __tablename__ = "study_materials"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, default="Art and Culture")
    file_url = Column(String)
    file_type = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class FavoriteMaterial(Base):
    __tablename__ = "favorite_materials"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    material_id = Column(Integer, index=True)

class DoubtSolverChat(Base):
    __tablename__ = "doubt_solver_chats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String, nullable=True) # First question or summary
    messages_json = Column(Text, nullable=False) # List of chat messages
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # info, warning, success
    sender_id = Column(Integer, nullable=True) # ID of faculty/admin who sent it
    created_at = Column(DateTime, default=datetime.utcnow)

class AdminRequest(Base):
    __tablename__ = "admin_requests"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, index=True)
    faculty_name = Column(String)
    subject = Column(String)
    message = Column(Text)
    status = Column(String, default="pending") # pending, seen, replied
    reply = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    overall_score = Column(Integer)
    report_json = Column(Text, nullable=False) # Store the full analysis object
    transcript = Column(Text, nullable=True) # Store the candidate's spoken responses
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationRead(Base):
    __tablename__ = "notification_reads"
    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    read_at = Column(DateTime, default=datetime.utcnow)

class CurrentAffairs(Base):
    __tablename__ = "current_affairs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content_url = Column(String)
    file_type = Column(String, default="pdf")
    published_date = Column(DateTime, default=datetime.utcnow)

class CourseFeedback(Base):
    __tablename__ = "course_feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    user_name = Column(String)
    answers_json = Column(Text) # The 3 answers from the avatar
    analysis_json = Column(Text) # Groq analysis result
    created_at = Column(DateTime, default=datetime.utcnow)
