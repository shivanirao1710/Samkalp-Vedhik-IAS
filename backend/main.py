from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models, database
from routers import auth, courses, tests, psychometric, admin, live_classes, study_materials, users
import os
# Initialize database
models.Base.metadata.create_all(bind=database.engine)

def ensure_admin_exists():
    """Startup logic to ensure at least one admin account exists."""
    from database import SessionLocal
    from utils import hash_password
    db = SessionLocal()
    try:
        admin_email = "admin@samkalp.com"
        existing = db.query(models.User).filter(models.User.role == "admin").first()
        if not existing:
            print("No admin found. Creating default admin...")
            new_admin = models.User(
                email=admin_email,
                name="Samkalp Admin",
                hashed_password=hash_password("admin123"),
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            print(f"Default admin created: {admin_email}")
    except Exception as e:
        print(f"Admin auto-setup failed: {e}")
    finally:
        db.close()

# Run admin check
ensure_admin_exists()

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
app.include_router(admin.router)
app.include_router(live_classes.router)
app.include_router(study_materials.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Welcome to Samkalp Vedhik API"}

