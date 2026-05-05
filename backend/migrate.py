from sqlalchemy import text
from database import engine, Base
import models

def migrate():
    print("Running migrations...")
    try:
        # 1. Create all tables (handles new tables like modules and lessons)
        Base.metadata.create_all(bind=engine)
        print("Base tables created successfully.")

        # 2. Handle schema updates (ALTER TABLE)
        with engine.connect() as conn:
            print("Checking for schema updates...")
            
            # Rename 'modules' to 'modules_count' in 'courses' if it exists
            res_m = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='courses' AND column_name='modules';
            """))
            if res_m.fetchone():
                print("Renaming 'modules' to 'modules_count' in 'courses'...")
                conn.execute(text("ALTER TABLE courses RENAME COLUMN modules TO modules_count;"))
                conn.commit()
            
            # Rename 'lessons' to 'lessons_count' in 'courses' if it exists
            res_l = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='courses' AND column_name='lessons';
            """))
            if res_l.fetchone():
                print("Renaming 'lessons' to 'lessons_count' in 'courses'...")
                conn.execute(text("ALTER TABLE courses RENAME COLUMN lessons TO lessons_count;"))
                conn.commit()

            # Check if 'transcript' column exists in 'interview_results'
            res = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='interview_results' AND column_name='transcript';
            """))
            
            if not res.fetchone():
                print("Adding 'transcript' column to 'interview_results'...")
                conn.execute(text("ALTER TABLE interview_results ADD COLUMN transcript TEXT;"))
                conn.commit()
            
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
                
            res3 = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='scholarship_answers_json';
            """))
            if not res3.fetchone():
                print("Adding 'scholarship_answers_json' column to 'users'...")
                conn.execute(text("ALTER TABLE users ADD COLUMN scholarship_answers_json TEXT;"))
                conn.commit()

            res4 = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='course_enrollments' AND column_name='completed_lessons';
            """))
            if not res4.fetchone():
                print("Adding 'completed_lessons' column to 'course_enrollments'...")
                conn.execute(text("ALTER TABLE course_enrollments ADD COLUMN completed_lessons TEXT DEFAULT '[]';"))
                # Also update existing rows to be sure
                conn.execute(text("UPDATE course_enrollments SET completed_lessons = '[]' WHERE completed_lessons IS NULL;"))
                conn.commit()

    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
