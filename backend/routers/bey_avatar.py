import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/beyond-presence", tags=["Beyond Presence Auth"])

BEY_API_BASE = "https://api.bey.dev/v1"

class InitSessionRequest(BaseModel):
    reportData: Dict[str, Any]
    candidateName: str

@router.post("/init-session")
async def init_session(req: InitSessionRequest):
    load_dotenv()
    bey_key = os.getenv("BEY_API_KEY")
    if not bey_key:
        raise HTTPException(status_code=500, detail="BEY_API_KEY is not configured in .env")

    headers = {
        "x-api-key": bey_key,
        "Content-Type": "application/json"
    }

    r = req.reportData
    name = req.candidateName.split(' ')[0] if req.candidateName else 'there'

    score = r.get("upsc_readiness", {}).get("score", 0)
    readiness_desc = r.get("upsc_readiness", {}).get("description", "")
    strengths = r.get("strengths", [])
    areas = r.get("areas_for_improvement", [])

    system_prompt = f"""You are Aryan, a dedicated male AI mentor for IAS preparation helping {name}.
You are conducting a video counselling session based on their psychometric analysis report.

Candidate Data:
- UPSC Readiness Score: {score}/100
- Summary: {readiness_desc}
- Key Strengths: {', '.join(strengths) if strengths else 'Unknown'}
- Areas for Improvement: {', '.join(areas) if areas else 'Unknown'}

You MUST:
1. Speak clearly and knowledgeably about UPSC/IAS preparation.
2. Be encouraging but realistic.
3. Keep answers concise to allow natural conversational flow.
4. Answer candidate questions using their report data where applicable.
5. Never break character. You are Aryan - a professional, warm IAS mentor.
"""

    greeting = f"Namaste {name}! I'm Aryan, your AI mentor for IAS preparation. I've reviewed your psychometric analysis. What would you like to discuss first?"

    try:
        ag_payload = {
            "name": f"Aryan Mentor - {name}",
            "avatar_id": "2ed7477f-3961-4ce1-b331-5e4530c55a57",  # Awais - Stock avatar V2 (South Asian male with glasses)
            "system_prompt": system_prompt,
            "greeting": greeting,
            "max_session_length_minutes": 30,
            # Google TTS — en-IN-Neural2-B is a clear male Indian English Neural voice
            # Field must be "voice" (not "voice_id") per Beyond Presence API schema
            "tts": {
                "type": "google_tts",
                "voice": "en-IN-Neural2-B"
            }
        }
        ag_resp = requests.post(f"{BEY_API_BASE}/agents", headers=headers, json=ag_payload)
        if not ag_resp.ok:
            raise Exception(ag_resp.text)
        agent_data = ag_resp.json()
        agent_id = agent_data.get("agent_id") or agent_data.get("id")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Bey Agent: {str(e)}")

    # Free-tier does not allow programmatic call creation via /v1/calls.
    # Return the direct bey.chat iframe link which handles WebRTC internally.
    return {
        "agent_id": agent_id,
        "call_id": "iframe-session",
        "beyCallLink": f"https://bey.chat/{agent_id}",
    }
@router.post("/init-interview")
async def init_interview(user_name: str = "Candidate"):
    load_dotenv()
    bey_key = os.getenv("BEY_API_KEY")
    if not bey_key:
        raise HTTPException(status_code=500, detail="BEY_API_KEY is not configured in .env")

    headers = {
        "x-api-key": bey_key,
        "Content-Type": "application/json"
    }

    name = user_name.split(' ')[0]

    system_prompt = f"""You are a senior UPSC Board Interview Panelist conducting a mock interview for {name}.
You are professional, serious yet encouraging, and highly intellectually sharp.
Your goal is to evaluate the candidate's personality, ethics, and administrative aptitude.

Instructions:
1. Conduct the interview strictly as a UPSC Board Member.
2. Ask questions one by one.
3. Be attentive to the candidate's answers.
4. Maintain a neutral but professional persona.
5. Your name is 'Chairman'.
"""

    greeting = f"Welcome {name}. I am the Chairman of this board. We shall begin your mock interview now. Please take a seat and relax. Are you ready to begin?"

    try:
        ag_payload = {
            "name": f"UPSC Interviewer - {name}",
            "avatar_id": "2ed7477f-3961-4ce1-b331-5e4530c55a57", 
            "system_prompt": system_prompt,
            "greeting": greeting,
            "max_session_length_minutes": 30,
            "tts": {
                "type": "google_tts",
                "voice": "en-IN-Neural2-B"
            }
        }
        ag_resp = requests.post(f"{BEY_API_BASE}/agents", headers=headers, json=ag_payload)
        if not ag_resp.ok:
            raise Exception(ag_resp.text)
        agent_data = ag_resp.json()
        agent_id = agent_data.get("agent_id") or agent_data.get("id")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Bey Agent: {str(e)}")

    return {
        "agent_id": agent_id,
        "beyCallLink": f"https://bey.chat/{agent_id}",
    }
