from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from datetime import datetime
import os
import shutil

from storage_utils import save_file, delete_file

router = APIRouter(
    prefix="/current-affairs",
    tags=["current-affairs"]
)

@router.post("/", response_model=schemas.CurrentAffairsResponse)
async def create_current_affairs(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save file
    file_url = save_file(file, "current_affairs")
    
    file_ext = os.path.splitext(file.filename)[1]
    db_ca = models.CurrentAffairs(
        title=title,
        content_url=file_url,
        file_type="pdf" if file_ext.lower() == ".pdf" else "document",
        published_date=datetime.utcnow()
    )
    db.add(db_ca)
    db.commit()
    db.refresh(db_ca)
    return db_ca

@router.get("/", response_model=List[schemas.CurrentAffairsResponse])
def get_current_affairs(db: Session = Depends(get_db)):
    return db.query(models.CurrentAffairs).order_by(models.CurrentAffairs.published_date.desc()).all()

@router.delete("/{ca_id}")
def delete_current_affairs(ca_id: int, db: Session = Depends(get_db)):
    db_ca = db.query(models.CurrentAffairs).filter(models.CurrentAffairs.id == ca_id).first()
    if not db_ca:
        raise HTTPException(status_code=404, detail="Current Affairs not found")
    
    # Try to delete file
    if db_ca.content_url:
        delete_file(db_ca.content_url)

    db.delete(db_ca)
    db.commit()
    return {"message": "Deleted successfully"}
