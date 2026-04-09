from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/tests", tags=["tests"])

class OptionCreate(BaseModel):
    text: str
    is_correct: bool

class QuestionCreate(BaseModel):
    text: str
    explanation: str = None
    options: List[OptionCreate]

class TestCreate(BaseModel):
    title: str
    category: str
    duration_mins: int
    questions: List[QuestionCreate]

@router.post("/")
def create_test(test: TestCreate, db: Session = Depends(get_db)):
    db_test = models.Test(
        title=test.title,
        category=test.category,
        duration_mins=test.duration_mins,
        total_questions=len(test.questions),
        status="Published"
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)

    for q in test.questions:
        db_q = models.Question(
            test_id=db_test.id,
            text=q.text,
            explanation=q.explanation
        )
        db.add(db_q)
        db.commit()
        db.refresh(db_q)

        for opt in q.options:
            db_opt = models.QuestionOption(
                question_id=db_q.id,
                text=opt.text,
                is_correct=1 if opt.is_correct else 0
            )
            db.add(db_opt)
    
    db.commit()
    return db_test

@router.get("/")
def get_tests(db: Session = Depends(get_db)):
    return db.query(models.Test).all()

@router.get("/{test_id}/questions")
def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    questions = db.query(models.Question).filter(models.Question.test_id == test_id).all()
    result = []
    for q in questions:
        options = db.query(models.QuestionOption).filter(models.QuestionOption.question_id == q.id).all()
        result.append({
            "id": q.id,
            "text": q.text,
            "explanation": q.explanation,
            "options": [{"id": o.id, "text": o.text, "is_correct": bool(o.is_correct)} for o in options]
        })
    return result
