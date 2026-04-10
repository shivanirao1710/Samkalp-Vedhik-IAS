from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import models, database, schemas
import os
import shutil
from datetime import datetime
from utils import hash_password, verify_password

router = APIRouter(
    prefix="/users",
    tags=['Users']
)

# In a real app, we'd use dependencies for current_user
# Since the current auth is simple, we'll pass user_id as a query param for now
# consistent with how other routers in this project might work.

@router.get("/me/{user_id}", response_model=schemas.UserResponse)
def get_user_me(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/stats/{user_id}")
def get_user_stats(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Live stats computation
    courses_completed = db.query(models.CourseEnrollment).filter(
        models.CourseEnrollment.user_id == user_id,
        models.CourseEnrollment.status == "completed"
    ).count()
    
    total_courses = db.query(models.CourseEnrollment).filter(
        models.CourseEnrollment.user_id == user_id
    ).count()
    
    tests_taken = db.query(models.StudentTestAttempt).filter(
        models.StudentTestAttempt.user_id == user_id
    ).count()
    
    # Mocking interviews for now as there's no model
    interviews_done = 8 # Static for now or we could create a model
    
    return {
        "courses_completed": f"{courses_completed}/{total_courses}" if total_courses > 0 else "0/0",
        "tests_taken": tests_taken,
        "interviews_done": interviews_done,
        "study_streak": user.study_streak
    }

@router.put("/update/{user_id}", response_model=schemas.UserResponse)
def update_profile(user_id: int, profile: schemas.ProfileUpdate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if profile.name is not None:
        db_user.name = profile.name
    if profile.email is not None:
        db_user.email = profile.email
    if profile.phone is not None:
        db_user.phone = profile.phone
    if profile.location is not None:
        db_user.location = profile.location
    if profile.target_exam is not None:
        db_user.target_exam = profile.target_exam
    if profile.department is not None:
        db_user.department = profile.department
    if profile.preferences_json is not None:
        db_user.preferences_json = profile.preferences_json
        
    try:
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        if "unique constraint" in str(e).lower() or "already exists" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already taken by another user")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
        
    return db_user

@router.put("/update-password/{user_id}")
def update_password(user_id: int, data: schemas.PasswordUpdate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(data.current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    db_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/upload-image/{user_id}")
async def upload_profile_image(user_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Ensure directory exists
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "profiles")
    os.makedirs(static_dir, exist_ok=True)
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"profile_{user_id}{file_extension}"
    file_path = os.path.join(static_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user
    image_url = f"http://localhost:8000/static/profiles/{filename}"
    db_user.profile_image = image_url
    db.commit()
    
    return {"image_url": image_url}

@router.post("/remove-image/{user_id}")
def remove_profile_image(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.profile_image = None
    db.commit()
    return {"message": "Profile image removed"}

@router.delete("/delete/{user_id}")
def delete_account(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "Account deleted successfully"}
