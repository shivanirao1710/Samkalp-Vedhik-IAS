from sqlalchemy import text
from database import engine

def add_fields():
    print("Updating 'users' table with new fields...")
    fields = [
        ("phone", "VARCHAR"),
        ("location", "VARCHAR"),
        ("target_exam", "VARCHAR"),
        ("profile_image", "VARCHAR"),
        ("study_streak", "INTEGER DEFAULT 0"),
        ("preferences_json", "TEXT")
    ]
    
    for field_name, field_type in fields:
        try:
            with engine.connect() as conn:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {field_name} {field_type};"))
                conn.commit()
                print(f"Added column: {field_name}")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print(f"Column {field_name} already exists.")
            else:
                print(f"Error adding {field_name}: {e}")

if __name__ == "__main__":
    add_fields()
