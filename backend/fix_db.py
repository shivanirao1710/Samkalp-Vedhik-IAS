from sqlalchemy import text
from database import engine

def fix_db():
    print("Fixing database: adding 'points' column to 'questions' table...")
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE questions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;"))
            conn.commit()
            print("Successfully added 'points' column.")
    except Exception as e:
        print(f"Error fixing database: {e}")

if __name__ == "__main__":
    fix_db()
