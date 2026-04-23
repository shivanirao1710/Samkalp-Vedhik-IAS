from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
import os
import google.generativeai as genai
from groq import Groq
from typing import List, Optional
from datetime import datetime
from database import get_db
import models

router = APIRouter(prefix="/api/interview", tags=["Interview"])

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

# Configure Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def get_ai_response(prompt: str):
    """Try Gemini first, then Groq as fallback."""
    # 1. Try Gemini
    if GEMINI_API_KEY:
        try:
            response = gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
    
    # 2. Try Groq Fallback
    if groq_client:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Error: {e}")
    
    raise Exception("No AI models available or all failed.")

class InterviewStartRequest(BaseModel):
    user_id: int

class AnswerPayload(BaseModel):
    question: str
    answer: str

class InterviewAnalysisRequest(BaseModel):
    user_id: int
    answers: List[AnswerPayload]

class SaveResultRequest(BaseModel):
    user_id: int
    analysis: dict
    transcript: Optional[str] = None
    timestamp: Optional[str] = None # Support candidate's system time

@router.post("/save")
async def save_interview_result(req: SaveResultRequest):
    db = next(get_db())
    try:
        # Use provided timestamp if available, else use UTC
        created_dt = datetime.now() # Default to server local for now
        if req.timestamp:
            try:
                # Expecting format from frontend like '11 Apr 2026, 11:23 AM'
                # Let's try to parse a standard ISO string or use current if it fails.
                created_dt = datetime.fromisoformat(req.timestamp.replace('Z', '+00:00'))
            except:
                created_dt = datetime.now()

        db_result = models.InterviewResult(
            user_id=req.user_id,
            overall_score=req.analysis.get("overall_score", 0),
            report_json=json.dumps(req.analysis),
            transcript=req.transcript,
            created_at=created_dt
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        return {"status": "success", "id": db_result.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/questions")
async def generate_questions(level: str = "Medium"):
    prompt = f"""
    List 5 {level} difficulty UPSC interview questions.
    Return ONLY a JSON array of strings. 
    Format: ["Q1", "Q2", "Q3", "Q4", "Q5"]
    
    Topic: {level} UPSC Interview.
    """
    try:
        raw_text = get_ai_response(prompt)
        text = raw_text.strip()
        
        # More robust JSON array extraction
        if "[" in text and "]" in text:
            start = text.find("[")
            end = text.rfind("]") + 1
            text = text[start:end]
        
        questions = json.loads(text)
        if not isinstance(questions, list) or len(questions) == 0:
            raise ValueError("AI returned empty or invalid question list")
            
        return questions
    except Exception as e:
        print(f"Question Generation Error: {e}")
        # Fallback questions
        return [
            f"[{level}] Why do you want to join the Civil Services despite having other career options?",
            f"[{level}] What is your take on the current debate between development and environmental conservation?",
            f"[{level}] If you were a DM, how would you handle a corrupt but efficient subordinate?",
            f"[{level}] How can technology improve last-mile delivery of government schemes?",
            f"[{level}] Explain the relevance of the Basic Structure Doctrine today."
        ]

@router.post("/analyze")
async def analyze_interview(req: InterviewAnalysisRequest):
    answers_text = "\n".join([f"Q: {a.question}\nA: {a.answer}" for a in req.answers])
    
    prompt = f"""
    Evaluate this UPSC Mock Interview. YOU MUST BE CRITICAL AND TRUTHFUL.
    If the candidate's answers are random, irrelevant, too short, or nonsensical, they MUST receive a VERY LOW score (e.g., 0-30).
    
    Candidate Responses:
    {answers_text}
    
    Evaluate based on UPSC standards:
    - Relevancy to the question.
    - depth of understanding.
    - Administrative aptitude.
    - Clarity of expression.
    
    Provide evaluation in JSON format only:
    {{
      "overall_score": (int 0-100),
      "communication_skills": (int 0-100),
      "knowledge_depth": (int 0-100),
      "analytical_ability": (int 0-100),
      "feedback": "string",
      "strengths": ["string", "string", "string"],
      "areas_for_improvement": ["string", "string", "string"],
      "verdict": "string"
    }}
    """
    
    try:
        raw_text = get_ai_response(prompt)
        text = raw_text.strip()
        
        # More robust JSON cleaning
        if "{" in text and "}" in text:
            start = text.find("{")
            end = text.rfind("}") + 1
            text = text[start:end]
            
        analysis = json.loads(text)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{result_id}")
async def delete_interview_result(result_id: int):
    db = next(get_db())
    try:
        result = db.query(models.InterviewResult).filter(models.InterviewResult.id == result_id).first()
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        db.delete(result)
        db.commit()
        return {"status": "success", "message": "Interview result deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all")
async def get_all_interview_results():
    db = next(get_db())
    # Join with User table to get names
    results = db.query(models.InterviewResult, models.User).join(models.User, models.User.id == models.InterviewResult.user_id).order_by(models.InterviewResult.created_at.desc()).all()
    
    formatted_results = []
    for r, u in results:
        report = json.loads(r.report_json)
        report["id"] = r.id
        report["candidate_name"] = u.name or u.email
        report["user_id"] = r.user_id
        report["transcript"] = r.transcript
        report["date"] = r.created_at.strftime("%d %b %Y, %I:%M %p")
        formatted_results.append(report)
        
    return formatted_results

@router.get("/history/{user_id}")
async def get_interview_history(user_id: int):
    db = next(get_db())
    results = db.query(models.InterviewResult).filter(models.InterviewResult.user_id == user_id).order_by(models.InterviewResult.created_at.desc()).all()
    
    formatted_results = []
    for r in results:
        report = json.loads(r.report_json)
        # Add date and ID for uniqueness
        report["id"] = r.id
        report["transcript"] = r.transcript
        report["date"] = r.created_at.strftime("%d %b %Y, %I:%M %p")
        formatted_results.append(report)
        
    return formatted_results

@router.get("/stats/{user_id}")
async def get_interview_stats(user_id: int):
    db = next(get_db())
    results = db.query(models.InterviewResult).filter(models.InterviewResult.user_id == user_id).all()
    
    total = len(results)
    avg_score = 0
    if total > 0:
        avg_score = sum(r.overall_score for r in results) // total
        
    return {
        "total_interviews": total,
        "avg_score": avg_score,
        "improvement": f"+{total*2}%" if total > 0 else "0%"
    }
