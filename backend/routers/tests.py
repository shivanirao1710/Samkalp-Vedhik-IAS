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
@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    db_q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Delete associated options first
    db.query(models.QuestionOption).filter(models.QuestionOption.question_id == question_id).delete()
    db.delete(db_q)
    db.commit()
    return {"message": "Question deleted successfully"}

@router.delete("/{test_id}")
def delete_test(test_id: int, db: Session = Depends(get_db)):
    db_test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Delete associated questions and their options
    questions = db.query(models.Question).filter(models.Question.test_id == test_id).all()
    for q in questions:
        db.query(models.QuestionOption).filter(models.QuestionOption.question_id == q.id).delete()
        db.delete(q)
    
    db.delete(db_test)
    db.commit()
    return {"message": "Test and all associated questions deleted successfully"}

@router.put("/questions/{question_id}")
def update_question(question_id: int, question_data: QuestionCreate, db: Session = Depends(get_db)):
    db_q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db_q.text = question_data.text
    db_q.explanation = question_data.explanation
    
    db.query(models.QuestionOption).filter(models.QuestionOption.question_id == question_id).delete()
    for opt in question_data.options:
        db_opt = models.QuestionOption(
            question_id=question_id,
            text=opt.text,
            is_correct=1 if opt.is_correct else 0
        )
        db.add(db_opt)
    
    db.commit()
    return db_q
