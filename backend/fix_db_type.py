import database
from sqlalchemy import text

def fix_type():
    with database.engine.connect() as conn:
        try:
            # Drop default first
            conn.execute(text("ALTER TABLE users ALTER COLUMN is_suspended DROP DEFAULT"))
            # Alter type
            conn.execute(text("ALTER TABLE users ALTER COLUMN is_suspended TYPE BOOLEAN USING (CASE WHEN is_suspended=1 THEN TRUE ELSE FALSE END)"))
            # Set new default
            conn.execute(text("ALTER TABLE users ALTER COLUMN is_suspended SET DEFAULT FALSE"))
            conn.commit()
            print("Successfully altered is_suspended column to BOOLEAN with correct default.")
        except Exception as e:
            print(f"Error altering column: {e}")

if __name__ == "__main__":
    fix_type()
