from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from datetime import datetime

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

@router.post("/", response_model=schemas.NotificationResponse)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    db_notification = models.Notification(
        title=notification.title,
        message=notification.message,
        type=notification.type,
        sender_id=notification.sender_id,
        created_at=datetime.utcnow()
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).order_by(models.Notification.created_at.desc()).all()
    
    result = []
    for notification in notifications:
        # Check if read by this user
        is_read = False
        if user_id:
            read_record = db.query(models.NotificationRead).filter(
                models.NotificationRead.notification_id == notification.id,
                models.NotificationRead.user_id == user_id
            ).first()
            is_read = True if read_record else False
            
        # Count total reads (for faculty view)
        read_count = db.query(models.NotificationRead).filter(
            models.NotificationRead.notification_id == notification.id
        ).count()
        
        # We can't easily modify the SQLAlchemy model instance attributes without it trying to save to DB 
        # unless they are defined as @property or hybrid_property, 
        # but for simplicity we convert to dict or use a wrapper.
        setattr(notification, 'is_read', is_read)
        setattr(notification, 'read_count', read_count)
        result.append(notification)
        
    return result

@router.post("/{notification_id}/read")
def mark_as_read(notification_id: int, data: schemas.NotificationReadMark, db: Session = Depends(get_db)):
    # Check if notification exists
    noti = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not noti:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    # Check if already read
    existing = db.query(models.NotificationRead).filter(
        models.NotificationRead.notification_id == notification_id,
        models.NotificationRead.user_id == data.user_id
    ).first()
    
    if not existing:
        db_read = models.NotificationRead(
            notification_id=notification_id,
            user_id=data.user_id
        )
        db.add(db_read)
        db.commit()
        
    return {"message": "Marked as read"}

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    db_notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(db_notification)
    db.commit()
    return {"message": "Notification deleted successfully"}
