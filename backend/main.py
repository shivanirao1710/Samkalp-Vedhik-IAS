from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import Optional
# 
# Initialize database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Samkalp Vedhik API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pwd, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "id": new_user.id}

@app.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    # Normally we would return a JWT here
    return {"message": "Login successful", "email": user.email, "role": user.role}

@app.get("/")
def root():
    return {"message": "Welcome to Samkalp Vedhik API"}
