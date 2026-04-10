from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Optional

import models, database, schemas


router = APIRouter(
    tags=['Authentication']
)

from utils import hash_password, verify_password

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Only students can sign up via public registration
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only student accounts can be created via public registration")
    
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    new_user = models.User(
        email=user.email, 
        name=user.name, 
        hashed_password=hashed_pwd, 
        role=user.role,
        phone=user.phone,
        location=user.location
    )
    db.add(new_user)

    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "id": new_user.id}

@router.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    # Check if role matches the login portal used
    # Admins are allowed to login through the faculty portal
    is_admin_on_faculty = (user.role == 'admin' and user_credentials.role == 'faculty')
    if user.role != user_credentials.role and not is_admin_on_faculty:
        raise HTTPException(
            status_code=403, 
            detail=f"This account is registered as a {user.role}. Please use the correct sign-in page."
        )
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    # Normally we would return a JWT here
    return {
        "message": "Login successful", 
        "id": user.id,
        "email": user.email, 
        "name": user.name,
        "role": user.role,
        "phone": user.phone,
        "location": user.location,
        "target_exam": user.target_exam,
        "profile_image": user.profile_image,
        "member_since": user.member_since.isoformat() if user.member_since else None
    }


