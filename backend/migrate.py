from sqlalchemy import text
from database import engine, Base
from models import Course

def migrate():
    print("Running migrations...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully (if they didn't exist).")

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
