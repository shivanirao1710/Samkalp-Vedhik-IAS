import database
from sqlalchemy import text

def check_type():
    with database.engine.connect() as conn:
        res = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_suspended'"))
        print(res.fetchall())

if __name__ == "__main__":
    check_type()
