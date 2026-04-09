from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models, database
from routers import auth, courses, tests, psychometric
import os
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

# Serve static files (uploaded thumbnails)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "thumbnails"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(tests.router)
app.include_router(psychometric.router)

@app.get("/")
def root():
    return {"message": "Welcome to Samkalp Vedhik API"}

