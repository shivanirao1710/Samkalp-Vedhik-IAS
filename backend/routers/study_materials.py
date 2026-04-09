from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import os
import shutil
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/study-materials",
    tags=["study_materials"]
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "materials")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
def upload_material(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form("General Studies"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    ext = os.path.splitext(file.filename)[-1].lower()
    filename = f"mat_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    file_url = f"/static/materials/{filename}"
    
    # Determine type
    file_type = "document"
    if ext in [".pdf"]:
        file_type = "pdf"
    elif ext in [".mp4", ".mov", ".avi", ".webm"]:
        file_type = "video"
    elif ext in [".pptx", ".ppt"]:
        file_type = "presentation"
    elif ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        file_type = "image"
    elif ext in [".doc", ".docx"]:
        file_type = "word"
    elif ext in [".txt", ".csv"]:
        file_type = "txt"

    db_material = models.StudyMaterial(
        title=title,
        description=description,
        category=category,
        file_url=file_url,
        file_type=file_type,
        uploaded_at=datetime.utcnow()
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@router.get("/")
def get_materials(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.StudyMaterial)
    if category and category != 'All':
        query = query.filter(models.StudyMaterial.category == category)
    return query.order_by(models.StudyMaterial.uploaded_at.desc()).all()

@router.get("/student/{user_id}")
def get_student_materials(user_id: int, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.StudyMaterial)
    if category and category not in ['All', 'Favorites']:
        query = query.filter(models.StudyMaterial.category == category)
    materials = query.order_by(models.StudyMaterial.uploaded_at.desc()).all()
    
    favorites = db.query(models.FavoriteMaterial).filter(models.FavoriteMaterial.user_id == user_id).all()
    favorite_ids = {f.material_id for f in favorites}
    
    result = []
    for m in materials:
        is_favorite = m.id in favorite_ids
        
        # If user is specifically looking at "Favorites" tab, only include favored ones
        if category == 'Favorites' and not is_favorite:
            continue
            
        m_dict = {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "category": m.category,
            "file_url": m.file_url,
            "file_type": m.file_type,
            "is_favorite": is_favorite
        }
        result.append(m_dict)
    return result

@router.post("/{material_id}/favorite/{user_id}")
def toggle_favorite(material_id: int, user_id: int, db: Session = Depends(get_db)):
    existing = db.query(models.FavoriteMaterial).filter(
        models.FavoriteMaterial.user_id == user_id, 
        models.FavoriteMaterial.material_id == material_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed"}
    else:
        new_fav = models.FavoriteMaterial(user_id=user_id, material_id=material_id)
        db.add(new_fav)
        db.commit()
        return {"status": "added"}

@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(models.StudyMaterial).filter(models.StudyMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    if material.file_url and material.file_url.startswith("/static/materials/"):
        old_path = os.path.join(os.path.dirname(__file__), "..", material.file_url.lstrip("/"))
        if os.path.exists(old_path):
            os.remove(old_path)

    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}
