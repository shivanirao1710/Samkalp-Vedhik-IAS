from sqlalchemy import text
from database import engine

def migrate():
    print("Running migration: adding 'name' column to 'users' table...")
    try:
        with engine.connect() as conn:
            # Check if column exists (PostgreSQL syntax)
            # For SQLite, it would be different, but the user is using PostgreSQL based on database.py change
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR;"))
            conn.commit()
            print("Migration successful: 'name' column added or already exists.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
