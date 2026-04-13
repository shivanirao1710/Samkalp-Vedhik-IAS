from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class RawTextRequest(BaseModel):
    text: str

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

@router.post("/parse-ai")
def parse_ai_questions(request: RawTextRequest):
    try:
        # Using Groq (Llama 3.3 70B) for faster extraction
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile", # Try the standard 70b first if versatile fails, but versatile is usually better. 
            # Wait, user error said llama3-70b-8192 is decommissioned.
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional exam parser. Extract multiple choice questions from the provided HTML. "
                               "Correct answers are indicated by <strong> or <b> tags inside paragraphs. "
                               "CRITICAL: 'is_correct' MUST BE A BOOLEAN true/false, NOT a string. "
                               "Return exactly a JSON object with a key 'questions' containing the array. "
                               "JSON structure: {\"questions\": [{\"text\": \"...\", \"explanation\": \"...\", \"options\": [{\"text\": \"...\", \"is_correct\": true}]}]}"
                },
                {
                    "role": "user",
                    "content": request.text
                }
            ],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(completion.choices[0].message.content)
        questions = data.get("questions", [])
        if not isinstance(questions, list):
            # Try to find any list in the object
            for val in data.values():
                if isinstance(val, list):
                    questions = val
                    break
        
        # Cleanup and validate
        final_questions = []
        for q in questions:
            if not isinstance(q, dict) or "text" not in q:
                continue
            
            clean_q = {
                "text": str(q.get("text", "")).strip(),
                "explanation": str(q.get("explanation", "") or "").strip(),
                "options": []
            }
            
            raw_options = q.get("options", [])
            if not isinstance(raw_options, list):
                continue
                
            for opt in raw_options:
                if not isinstance(opt, dict) or "text" not in opt:
                    continue
                clean_q["options"].append({
                    "text": str(opt.get("text", "")).strip(),
                    "is_correct": bool(opt.get("is_correct", False))
                })
            
            if len(clean_q["options"]) >= 2:
                final_questions.append(clean_q)
                
        return final_questions
        
    except Exception as e:
        print(f"Groq Parse Error: {str(e)}")
        # Fallback to Gemini if Groq fails
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            Extract MCQ JSON from this HTML. Identify correct answers via bold/strong tags.
            Return exactly this JSON format: [{{ "text": "...", "explanation": "...", "options": [{{ "text": "...", "is_correct": true }}] }}]
            Ensure is_correct is a boolean.
            
            HTML:
            {request.text}
            """
            response = model.generate_content(prompt)
            text_resp = response.text.strip()
            if "```json" in text_resp:
                text_resp = text_resp.split("```json")[1].split("```")[0].strip()
            elif "```" in text_resp:
                text_resp = text_resp.split("```")[1].split("```")[0].strip()
            
            return json.loads(text_resp)
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"AI Parsing failed: {str(e)}")
