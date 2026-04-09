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
        raise HTTPException(status_code=44, detail="Course not found")
    return course
