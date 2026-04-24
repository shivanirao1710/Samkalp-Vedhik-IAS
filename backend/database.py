from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:user@localhost/samkalp")
 
# Added connection pooling for high concurrency (e.g., 300-400 simultaneous test takers)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,          # Maintain 20 connections in the pool
    max_overflow=30,       # Allow up to 30 additional connections if the pool is full
    pool_timeout=30        # Wait up to 30 seconds for an available connection before throwing an error
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
