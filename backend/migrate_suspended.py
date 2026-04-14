import models, database
from sqlalchemy import text

def add_suspended_column():
    engine = database.engine
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Successfully added is_suspended column to users table.")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("Column is_suspended already exists.")
            else:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_suspended_column()
