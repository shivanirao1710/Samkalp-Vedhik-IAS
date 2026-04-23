from sqlalchemy import text
from database import engine, Base
import models

def migrate():
    print("Running migrations...")
    try:
        # 1. Create all tables (handles new tables)
        Base.metadata.create_all(bind=engine)
        print("Base tables created successfully.")

        # 2. Handle schema updates (ALTER TABLE)
        with engine.connect() as conn:
            # Check if 'transcript' column exists in 'interview_results'
            # (Postgres/SQLite compatible check)
            print("Checking for schema updates...")
            
            # For Postgres
            res = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='interview_results' AND column_name='transcript';
            """))
            
            if not res.fetchone():
                print("Adding 'transcript' column to 'interview_results'...")
                conn.execute(text("ALTER TABLE interview_results ADD COLUMN transcript TEXT;"))
                conn.commit()
                print("Column 'transcript' added successfully.")
            else:
                print("Column 'transcript' already exists.")

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
