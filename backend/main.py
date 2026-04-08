from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routers import auth, courses

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

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)

@app.get("/")
def root():
    return {"message": "Welcome to Samkalp Vedhik API"}

