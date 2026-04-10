from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, database
from utils import hash_password

router = APIRouter(
    prefix="/admin",
    tags=['Admin']
)

# HELPER: In a real app, this would use JWT tokens
# For simplicity in this session, we'll assume the admin_id is passed or checked via role logic

@router.get("/users", response_model=list[schemas.UserAdminResponse])
def get_all_users(db: Session = Depends(database.get_db)):
    """Fetch all users except potentially current admin."""
    users = db.query(models.User).all()
    return users

@router.post("/faculty", status_code=status.HTTP_201_CREATED)
def create_faculty(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Create a faculty account manually by Admin."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    # Force role to faculty
    new_user = models.User(
        email=user.email, 
        name=user.name, 
        hashed_password=hashed_pwd, 
        role="faculty"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Faculty account created successfully", "id": new_user.id}

@router.post("/reset-password")
def admin_reset_password(data: schemas.PasswordReset, db: Session = Depends(database.get_db)):
    """Reset any user's password."""
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": f"Password reset successfully for {user.email}"}

@router.delete("/user/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    """Delete a user account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/students-detailed")
def get_students_detailed(db: Session = Depends(database.get_db)):
    """Fetch all students with extra metrics like course/test counts."""
    students = db.query(models.User).filter(models.User.role == "student").all()
    result = []
    for s in students:
        course_count = db.query(models.CourseEnrollment).filter(models.CourseEnrollment.user_id == s.id).count()
        test_count = db.query(models.StudentTestAttempt).filter(models.StudentTestAttempt.user_id == s.id).count()
        
        result.append({
            "id": s.id,
            "name": s.name or s.email.split('@')[0],
            "email": s.email,
            "phone": s.phone or "N/A",
            "enrolled_date": s.member_since.strftime("%Y-%m-%d") if s.member_since else "N/A",
            "courses": f"{course_count} courses",
            "tests": test_count,
            "status": "Active", # Simplified
            "color": "#F2921D" # Placeholder color
        })
    return result
