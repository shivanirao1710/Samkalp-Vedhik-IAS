import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/mentor", tags=["Mentor Chat"])

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    reportData: Optional[Any] = None
    candidateName: Optional[str] = "Candidate"

# Configure AI Clients
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

groq_client = Groq(api_key=GROQ_KEY) if GROQ_KEY else None

@router.post("/chat")
async def chat_with_mentor(req: ChatRequest):
    # Construct System Prompt
    name = req.candidateName.split(' ')[0] if req.candidateName else 'there'
    
    system_prompt = f"""You are Aryan, a dedicated male AI mentor for IAS preparation helping {name}.
You are conducting a video counselling session based on their psychometric analysis report.
You are professional, warm, encouraging, and deeply knowledgeable about the UPSC civil services exam.

"""
    if req.reportData:
        r = req.reportData
        score = r.get("upsc_readiness", {}).get("score", "Unknown")
        desc = r.get("upsc_readiness", {}).get("description", "")
        strengths = r.get("strengths", [])
        areas = r.get("areas_for_improvement", [])
        
        system_prompt += f"""Candidate Data:
- UPSC Readiness Score: {score}/100
- Summary: {desc}
- Key Strengths: {', '.join(strengths) if strengths else 'Unknown'}
- Areas for Improvement: {', '.join(areas) if areas else 'Unknown'}

"""

    system_prompt += """You MUST:
1. Speak clearly and knowledgeably about UPSC/IAS preparation.
2. Be encouraging but realistic.
3. Keep answers concise (2-4 sentences max) for a natural video conversation.
4. Answer candidate questions using their report data where applicable.
5. Never break character. You are Aryan - a professional, warm IAS mentor.
"""

    # 1. Try Gemini
    if GEMINI_KEY:
        try:
            # We use gemini-2.0-flash which is the current high-speed/quality model
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            # Build history for Gemini
            history = []
            # Last message is the user prompt
            user_prompt = req.messages[-1].text
            
            # Full prompt with system context
            full_prompt = f"SYSTEM INSTRUCTION:\n{system_prompt}\n\nUSER QUESTION: {user_prompt}"
            
            response = model.generate_content(full_prompt)
            if response and response.text:
                return {
                    "reply": response.text.strip(),
                    "model_used": "gemini-2.0-flash"
                }
        except Exception as e:
            print(f"Gemini (gemini-2.0-flash) failed: {e}")

    # 2. Try Groq Fallback
    if groq_client:
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    *[{"role": "user" if m.role == "you" else "assistant", "content": m.text} for m in req.messages]
                ],
                max_tokens=250,
                temperature=0.7,
            )
            return {
                "reply": completion.choices[0].message.content.strip(),
                "model_used": "groq-llama-3.3-70b"
            }
        except Exception as e:
            print(f"Groq fallback failed: {e}")

    # Final Fallback (Static)
    return {
        "reply": "I'm sorry, I'm having a bit of trouble connecting right now. Let's try that again.",
        "model_used": "static-fallback"
    }
