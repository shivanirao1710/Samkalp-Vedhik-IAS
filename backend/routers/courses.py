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
import json
from storage_utils import save_file, delete_file

router = APIRouter(
    prefix="/courses",
    tags=["courses"]
)

@router.post("/", response_model=schemas.Course)
def create_course(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    modules_count: int = Form(0),
    lessons_count: int = Form(0),
    status: str = Form("not_started"),
    progress: int = Form(0),
    modules: Optional[str] = Form(None), # JSON string of modules
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    image_url = None
    if thumbnail and thumbnail.filename:
        image_url = save_file(thumbnail, "thumbnails")

    db_course = models.Course(
        title=title,
        description=description,
        modules_count=modules_count,
        lessons_count=lessons_count,
        image_url=image_url,
        status=status,
        progress=progress
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)

    # Process modules if provided
    if modules:
        try:
            modules_data = json.loads(modules)
            for m_idx, m_data in enumerate(modules_data):
                db_module = models.Module(
                    course_id=db_course.id,
                    title=m_data.get("title", f"Module {m_idx + 1}"),
                    order=m_idx
                )
                db.add(db_module)
                db.commit()
                db.refresh(db_module)

                lessons_data = m_data.get("lessons", [])
                for l_idx, l_data in enumerate(lessons_data):
                    db_lesson = models.Lesson(
                        module_id=db_module.id,
                        title=l_data.get("title", f"Lesson {l_idx + 1}"),
                        content_type=l_data.get("content_type", "video"),
                        content_url=l_data.get("content_url"),
                        order=l_idx
                    )
                    db.add(db_lesson)
            db.commit()
            db.refresh(db_course)
        except Exception as e:
            print(f"Error parsing modules: {e}")

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
    modules_count: int = Form(0),
    lessons_count: int = Form(0),
    status: str = Form("not_started"),
    progress: int = Form(0),
    modules: Optional[str] = Form(None), # JSON string
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.title = title
    course.description = description
    course.modules_count = modules_count
    course.lessons_count = lessons_count
    course.status = status
    course.progress = progress

    # Only replace image if a new file is uploaded
    if thumbnail and thumbnail.filename:
        if course.image_url:
            delete_file(course.image_url)
        course.image_url = save_file(thumbnail, "thumbnails")

    # Update modules if provided
    if modules:
        try:
            # Delete existing modules and lessons
            # We must delete lessons first because of foreign key constraints
            module_ids = [m.id for m in course.course_modules]
            if module_ids:
                db.query(models.Lesson).filter(models.Lesson.module_id.in_(module_ids)).delete(synchronize_session=False)
            db.query(models.Module).filter(models.Module.course_id == course_id).delete(synchronize_session=False)
            
            modules_data = json.loads(modules)
            for m_idx, m_data in enumerate(modules_data):
                db_module = models.Module(
                    course_id=course.id,
                    title=m_data.get("title", f"Module {m_idx + 1}"),
                    order=m_idx
                )
                db.add(db_module)
                db.commit()
                db.refresh(db_module)

                lessons_data = m_data.get("lessons", [])
                for l_idx, l_data in enumerate(lessons_data):
                    db_lesson = models.Lesson(
                        module_id=db_module.id,
                        title=l_data.get("title", f"Lesson {l_idx + 1}"),
                        content_type=l_data.get("content_type", "video"),
                        content_url=l_data.get("content_url"),
                        order=l_idx
                    )
                    db.add(db_lesson)
            db.commit()
        except Exception as e:
            print(f"Error updating modules: {e}")

    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.image_url:
        delete_file(course.image_url)

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
    # Fetch courses with their modules
    courses = db.query(models.Course).all()
    enrollments = db.query(models.CourseEnrollment).filter(models.CourseEnrollment.user_id == user_id).all()
    enrolled_dict = {e.course_id: e for e in enrollments}
    
    result = []
    for c in courses:
        # Construct module list
        modules_list = []
        for m in c.course_modules:
            lessons_list = []
            for l in m.lessons:
                lessons_list.append({
                    "id": l.id,
                    "title": l.title,
                    "content_type": l.content_type,
                    "content_url": l.content_url
                })
            modules_list.append({
                "id": m.id,
                "title": m.title,
                "lessons": lessons_list
            })

        c_dict = {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "modules_count": c.modules_count,
            "lessons_count": c.lessons_count,
            "image_url": c.image_url,
            "course_modules": modules_list
        }
        if c.id in enrolled_dict:
            c_dict["is_enrolled"] = True
            c_dict["status"] = enrolled_dict[c.id].status
            c_dict["progress"] = enrolled_dict[c.id].progress
            c_dict["completed_lessons"] = json.loads(enrolled_dict[c.id].completed_lessons or "[]")
        else:
            c_dict["is_enrolled"] = False
            c_dict["status"] = "not_enrolled"
            c_dict["progress"] = 0
            c_dict["completed_lessons"] = []
            
        result.append(c_dict)
    return result

@router.post("/lessons/upload")
def upload_lesson_content(file: UploadFile = File(...)):
    """Uploads lesson content (video, pdf, etc.) and returns the URL."""
    try:
        # Determine folder based on file type
        folder = "lessons"
        if file.content_type.startswith("video/"):
            folder = "videos"
        elif file.content_type == "application/pdf":
            folder = "pdfs"
            
        file_url = save_file(file, folder)
        return {"url": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/{course_id}/lessons/{lesson_id}/complete/{user_id}")
def complete_lesson(course_id: int, lesson_id: int, user_id: int, db: Session = Depends(get_db)):
    enrollment = db.query(models.CourseEnrollment).filter(
        models.CourseEnrollment.user_id == user_id,
        models.CourseEnrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
        
    completed = json.loads(enrollment.completed_lessons or "[]")
    if lesson_id not in completed:
        completed.append(lesson_id)
        enrollment.completed_lessons = json.dumps(completed)
        
        # Update progress
        course = db.query(models.Course).filter(models.Course.id == course_id).first()
        if course and course.lessons_count > 0:
            enrollment.progress = int((len(completed) / course.lessons_count) * 100)
            if enrollment.progress >= 100:
                enrollment.status = "completed"
            else:
                enrollment.status = "in_progress"
        
        db.commit()
        db.refresh(enrollment)
        
    return {"status": "success", "progress": enrollment.progress}
