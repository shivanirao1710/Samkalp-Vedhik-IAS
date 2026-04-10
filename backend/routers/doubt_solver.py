import os
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
import models
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/doubt-solver", tags=["Doubt Solver"])

class ChatMessage(BaseModel):
    role: str
    content: str
    
class DoubtRequest(BaseModel):
    user_id: int
    chat_id: Optional[int] = None
    messages: List[ChatMessage]
    user_name: Optional[str] = "Student"

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

groq_client = Groq(api_key=GROQ_KEY) if GROQ_KEY else None

@router.get("/history/{user_id}")
async def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    chats = db.query(models.DoubtSolverChat).filter(
        models.DoubtSolverChat.user_id == user_id
    ).order_by(models.DoubtSolverChat.updated_at.desc()).all()
    
    return [
        {
            "id": c.id,
            "title": c.title,
            "updated_at": c.updated_at,
            "created_at": c.created_at
        } for c in chats
    ]

@router.get("/chat/{chat_id}")
async def get_chat_details(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(models.DoubtSolverChat).filter(models.DoubtSolverChat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return {
        "id": chat.id,
        "title": chat.title,
        "messages": json.loads(chat.messages_json)
    }

@router.delete("/chat/{chat_id}")
async def delete_chat(chat_id: int, user_id: int, db: Session = Depends(get_db)):
    chat = db.query(models.DoubtSolverChat).filter(
        models.DoubtSolverChat.id == chat_id,
        models.DoubtSolverChat.user_id == user_id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted"}

@router.post("/ask")
async def solve_doubt(req: DoubtRequest, db: Session = Depends(get_db)):
    system_prompt = f"""You are 'Samkalp Intelligence', an elite AI Assistant engineered exclusively to solve academic doubts for IAS and UPSC civil services preparation.
Your user is {req.user_name}.
Core Directives:
1. Accuracy: Base answers strictly on facts (Constitution, NCERTs, established History, etc.).
2. Depth vs Brevity: If the question is simple, provide a quick, punchy answer. If complex, break down the concept structurally with headings or bullet points.
3. Formatting: Use **bold** for key terms. Use bullet points heavily for readability.
4. Professionalism: Be highly academic, encouraging, and authoritative but approachable.

Do not discuss anything unrelated to UPSC exams, academics, or civil services."""

    reply = ""
    model_used = ""

    if GEMINI_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            history_text = "\n".join([f"{'User' if m.role == 'user' else 'AI'}: {m.content}" for m in req.messages[:-1]])
            current_q = req.messages[-1].content
            full_prompt = f"SYSTEM:\n{system_prompt}\n\nCONVERSATION HISTORY:\n{history_text}\n\nCURRENT STUDENT DOUBT:\n{current_q}"
            response = model.generate_content(full_prompt)
            if response and response.text:
                reply = response.text.strip()
                model_used = "gemini-2.0-flash"
        except Exception as e:
            print(f"Gemini failed: {e}")

    if not reply and groq_client:
        try:
            groq_messages = [{"role": "system", "content": system_prompt}]
            for m in req.messages:
                role = "user" if m.role == "user" else "assistant"
                groq_messages.append({"role": role, "content": m.content})
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=groq_messages,
                max_tokens=1024,
                temperature=0.4,
            )
            reply = completion.choices[0].message.content.strip()
            model_used = "groq-llama"
        except Exception as e:
            print(f"Groq failed: {e}")

    if not reply:
        raise HTTPException(status_code=500, detail="AI Services unavailable")

    # Persist Chat
    full_messages = [m.dict() for m in req.messages]
    full_messages.append({"role": "ai", "content": reply})
    
    # Extract title from the FIRST USER message to avoid saving welcome message as title
    user_messages = [m for m in req.messages if m.role == "user"]
    if user_messages:
        first_q = user_messages[0].content
        title = first_q[:50] + "..." if len(first_q) > 50 else first_q
    else:
        title = "New Doubt Chat"
    
    if req.chat_id:
        chat = db.query(models.DoubtSolverChat).filter(models.DoubtSolverChat.id == req.chat_id).first()
        if chat:
            chat.messages_json = json.dumps(full_messages)
            db.commit()
            db.refresh(chat)
            final_chat_id = chat.id
        else:
            new_chat = models.DoubtSolverChat(user_id=req.user_id, title=title, messages_json=json.dumps(full_messages))
            db.add(new_chat)
            db.commit()
            db.refresh(new_chat)
            final_chat_id = new_chat.id
    else:
        new_chat = models.DoubtSolverChat(user_id=req.user_id, title=title, messages_json=json.dumps(full_messages))
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        final_chat_id = new_chat.id

    return {
        "reply": reply,
        "chat_id": final_chat_id,
        "model_used": model_used
    }
