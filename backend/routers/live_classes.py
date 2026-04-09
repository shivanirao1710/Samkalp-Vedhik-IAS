from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, database

router = APIRouter(
    prefix="/live-classes",
    tags=['Live Classes']
)

@router.get("/", response_model=list[schemas.LiveClassResponse])
def get_live_classes(db: Session = Depends(database.get_db)):
    return db.query(models.LiveClass).all()

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.LiveClassResponse)
def create_live_class(live: schemas.LiveClassCreate, db: Session = Depends(database.get_db)):
    new_class = models.LiveClass(**live.model_dump())
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@router.delete("/{class_id}")
def delete_live_class(class_id: int, db: Session = Depends(database.get_db)):
    live = db.query(models.LiveClass).filter(models.LiveClass.id == class_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(live)
    db.commit()
    return {"message": "Live class deleted"}

@router.put("/{class_id}", response_model=schemas.LiveClassResponse)
def update_live_class(class_id: int, live: schemas.LiveClassCreate, db: Session = Depends(database.get_db)):
    db_live = db.query(models.LiveClass).filter(models.LiveClass.id == class_id).first()
    if not db_live:
        raise HTTPException(status_code=404, detail="Class not found")
    
    for key, value in live.model_dump().items():
        setattr(db_live, key, value)
    
    db.commit()
    db.refresh(db_live)
    return db_live

@router.post("/{class_id}/book")
def book_live_class(class_id: int, user_id: int, db: Session = Depends(database.get_db)):
    # Check if already booked
    existing = db.query(models.LiveClassEnrollment).filter(
        models.LiveClassEnrollment.user_id == user_id,
        models.LiveClassEnrollment.class_id == class_id
    ).first()
    if existing:
        return {"message": "Already booked", "already_booked": True}

    live = db.query(models.LiveClass).filter(models.LiveClass.id == class_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="Class not found")
    if live.registered >= live.capacity:
        raise HTTPException(status_code=400, detail="Class is already full")
    
    # Record enrollment
    enrollment = models.LiveClassEnrollment(user_id=user_id, class_id=class_id)
    db.add(enrollment)
    
    live.registered += 1
    db.commit()
    db.refresh(live)
    return {"message": "Spot booked successfully", "registered": live.registered}

@router.get("/user/{user_id}/enrollments")
def get_user_enrollments(user_id: int, db: Session = Depends(database.get_db)):
    enrollments = db.query(models.LiveClassEnrollment).filter(models.LiveClassEnrollment.user_id == user_id).all()
    return [e.class_id for e in enrollments]
