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

            res2 = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='scholarship_status';
            """))
            if not res2.fetchone():
                print("Adding 'scholarship_status' and 'scholarship_score' columns to 'users'...")
                conn.execute(text("ALTER TABLE users ADD COLUMN scholarship_status VARCHAR DEFAULT 'pending';"))
                conn.execute(text("ALTER TABLE users ADD COLUMN scholarship_score INTEGER;"))
                conn.commit()
                print("Columns added successfully.")
            else:
                print("Columns 'scholarship_status' already exist.")
                
            res3 = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='scholarship_answers_json';
            """))
            if not res3.fetchone():
                print("Adding 'scholarship_answers_json' column to 'users'...")
                conn.execute(text("ALTER TABLE users ADD COLUMN scholarship_answers_json TEXT;"))
                conn.commit()
                print("Column 'scholarship_answers_json' added successfully.")
            else:
                print("Column 'scholarship_answers_json' already exists.")

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
