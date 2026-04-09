from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
import os
import shutil
import uuid

router = APIRouter(
    prefix="/courses",
    tags=["courses"]
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "thumbnails")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=schemas.Course)
def create_course(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    modules: int = Form(0),
    lessons: int = Form(0),
    status: str = Form("not_started"),
    progress: int = Form(0),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    image_url = None
    if thumbnail and thumbnail.filename:
        ext = os.path.splitext(thumbnail.filename)[-1]
        filename = f"thumb_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(thumbnail.file, f)
        image_url = f"/static/thumbnails/{filename}"

    db_course = models.Course(
        title=title,
        description=description,
        modules=modules,
        lessons=lessons,
        image_url=image_url,
        status=status,
        progress=progress
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@router.get("/", response_model=List[schemas.Course])
def get_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    courses = db.query(models.Course).offset(skip).limit(limit).all()
    return courses


@router.get("/{course_id}", response_model=schemas.Course)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/{course_id}", response_model=schemas.Course)
def update_course(
    course_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    modules: int = Form(0),
    lessons: int = Form(0),
    status: str = Form("not_started"),
    progress: int = Form(0),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.title = title
    course.description = description
    course.modules = modules
    course.lessons = lessons
    course.status = status
    course.progress = progress

    # Only replace image if a new file is uploaded
    if thumbnail and thumbnail.filename:
        if course.image_url and course.image_url.startswith("/static/thumbnails/"):
            old_path = os.path.join(os.path.dirname(__file__), "..", course.image_url.lstrip("/"))
            if os.path.exists(old_path):
                os.remove(old_path)
        ext = os.path.splitext(thumbnail.filename)[-1]
        filename = f"thumb_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(thumbnail.file, f)
        course.image_url = f"/static/thumbnails/{filename}"

    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.image_url and course.image_url.startswith("/static/thumbnails/"):
        old_path = os.path.join(os.path.dirname(__file__), "..", course.image_url.lstrip("/"))
        if os.path.exists(old_path):
            os.remove(old_path)

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}

@router.post("/{course_id}/enroll/{user_id}")
def enroll_in_course(course_id: int, user_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = db.query(models.CourseEnrollment).filter(
        models.CourseEnrollment.user_id == user_id, 
        models.CourseEnrollment.course_id == course_id
    ).first()
    
    if existing:
        return {"message": "Already enrolled"}
        
    enrollment = models.CourseEnrollment(user_id=user_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    return {"message": "Enrolled successfully"}

@router.get("/student/{user_id}")
def get_student_courses(user_id: int, db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    enrollments = db.query(models.CourseEnrollment).filter(models.CourseEnrollment.user_id == user_id).all()
    enrolled_dict = {e.course_id: e for e in enrollments}
    
    result = []
    for c in courses:
        c_dict = {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "modules": c.modules,
            "lessons": c.lessons,
            "image_url": c.image_url,
        }
        if c.id in enrolled_dict:
            c_dict["is_enrolled"] = True
            c_dict["status"] = enrolled_dict[c.id].status
            c_dict["progress"] = enrolled_dict[c.id].progress
        else:
            c_dict["is_enrolled"] = False
            c_dict["status"] = "not_enrolled"
            c_dict["progress"] = 0
            
        result.append(c_dict)
    return result
