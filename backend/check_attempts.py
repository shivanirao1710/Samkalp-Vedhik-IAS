from database import SessionLocal
import models
db = SessionLocal()
try:
    attempts = db.query(models.StudentTestAttempt).all()
    print(f"Total attempts: {len(attempts)}")
    for a in attempts:
        print(f"ID: {a.id}, User: {a.user_id}, Test: {a.test_id}, Score: {a.score}, %: {a.percentage}")
finally:
    db.close()
