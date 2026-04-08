from sqlalchemy import text
from database import engine, Base
from models import Course

def migrate():
    print("Running migrations...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully (if they didn't exist).")

        # Check if we need to seed data
        with engine.connect() as conn:
            result = conn.execute(text("SELECT count(*) FROM courses"))
            count = result.scalar()
            
            if count == 0:
                print("Seeding initial course data...")
                seed_data = [
                    {
                        "title": "Indian Polity & Governance",
                        "description": "Comprehensive guide to Indian political system",
                        "modules": 4,
                        "lessons": 36,
                        "image_url": "https://img.freepik.com/free-photo/view-palace-india_23-2148281313.jpg",
                        "status": "in_progress",
                        "progress": 65
                    },
                    {
                        "title": "Modern Indian History",
                        "description": "The journey of modern India",
                        "modules": 3,
                        "lessons": 35,
                        "image_url": "https://img.freepik.com/free-photo/red-fort-delhi-india_1150-11107.jpg",
                        "status": "in_progress",
                        "progress": 40
                    },
                    {
                        "title": "Geography & Environment",
                        "description": "Understanding physical and social geography",
                        "modules": 3,
                        "lessons": 40,
                        "image_url": "https://img.freepik.com/free-photo/world-map-background_23-2148083811.jpg",
                        "status": "in_progress",
                        "progress": 80
                    }
                ]
                
                for course in seed_data:
                    conn.execute(
                        text("INSERT INTO courses (title, description, modules, lessons, image_url, status, progress) VALUES (:title, :description, :modules, :lessons, :image_url, :status, :progress)"),
                        course
                    )
                conn.commit()
                print("Seeding complete.")
            else:
                print("Course data already exists, skipping seed.")

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
