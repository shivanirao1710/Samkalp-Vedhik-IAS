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

# Simple in-memory cache for Agent IDs to speed up initialization
AGENT_CACHE = {}

def get_or_update_agent(headers: dict, name: str, avatar_id: str, system_prompt: str, greeting: str):
    """
    Checks if an agent with the given name and avatar_id already exists.
    If yes, updates its system_prompt and greeting and returns its ID.
    If no, creates a new agent.
    """
    try:
        # Check cache first
        cached_id = AGENT_CACHE.get(name)
        if cached_id:
            print(f"Using cached Agent ID for '{name}': {cached_id}")
            update_payload = {
                "system_prompt": system_prompt,
                "greeting": greeting,
                "avatar_id": avatar_id
            }
            patch_resp = requests.patch(f"{BEY_API_BASE}/agents/{cached_id}", headers=headers, json=update_payload)
            if patch_resp.ok:
                return cached_id
            else:
                print(f"Cached ID failed, refreshing search...")

        # 1. List existing agents
        print(f"--- BEYOND PRESENCE DEBUG ---")
        print(f"Target Agent Name: '{name}'")
        print(f"Calling: GET {BEY_API_BASE}/agents")
        
        resp = requests.get(f"{BEY_API_BASE}/agents", headers=headers)
        print(f"Response Status: {resp.status_code}")
        
        if resp.ok:
            data = resp.json()
            print(f"Raw Response Data: {data}")
            
            # Try to find the list of agents in common response keys
            agents = []
            if isinstance(data, list):
                agents = data
            elif isinstance(data, dict):
                agents = data.get("agents") or data.get("data") or data.get("items") or []
            
            print(f"Processed Agents List Length: {len(agents)}")
            
            for agent in agents:
                found_name = str(agent.get("name", "")).strip()
                found_id = agent.get("id") or agent.get("agent_id")
                found_avatar = agent.get("avatar_id")
                
                print(f" Checking Agent: '{found_name}' (ID: {found_id})")
                
                # Case-insensitive name match
                if found_name.lower() == name.lower():
                    print(f" >>> MATCH FOUND! Reusing Agent: {found_id}")
                    AGENT_CACHE[name] = found_id # Update cache
                    
                    # Update it to ensure latest prompt/greeting/avatar
                    update_payload = {
                        "system_prompt": system_prompt,
                        "greeting": greeting,
                        "avatar_id": avatar_id
                    }
                    patch_resp = requests.patch(f"{BEY_API_BASE}/agents/{found_id}", headers=headers, json=update_payload)
                    print(f" PATCH Update Status: {patch_resp.status_code}")
                    return found_id
            print("No matching agent name found in the list.")
        else:
            print(f"Error listing agents: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Exception during agent check: {str(e)}")
    
    print("Proceeding to create a new agent...")

    # 2. Create new agent if not found or list failed
    print(f"Creating new agent '{name}'...")
    ag_payload = {
        "name": name,
        "avatar_id": avatar_id,
        "system_prompt": system_prompt,
        "greeting": greeting,
        "max_session_length_minutes": 30
    }
    ag_resp = requests.post(f"{BEY_API_BASE}/agents", headers=headers, json=ag_payload)
    if not ag_resp.ok:
        print(f"Error creating agent: {ag_resp.status_code} - {ag_resp.text}")
        raise Exception(f"Failed to create agent: {ag_resp.text}")
    
    agent_data = ag_resp.json()
    new_id = agent_data.get("agent_id") or agent_data.get("id")
    AGENT_CACHE[name] = new_id # Cache it
    return new_id

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

    greeting = f"Namaste {name}! I'm Aryan, your AI mentor for IAS preparation. I've reviewed your psychometric analysis. What would you like to discuss first?...."

    try:
        agent_id = get_or_update_agent(
            headers=headers,
            name="Aryan Mentor",
            avatar_id="2ed7477f-3961-4ce1-b331-5e4530c55a57",
            system_prompt=system_prompt,
            greeting=greeting
        )

        # Return the static agent link (Dynamic calls require Growth plan)
        return {
            "agent_id": agent_id,
            "call_id": "static-session",
            "beyCallLink": f"https://bey.chat/{agent_id}"
        }

    except Exception as e:
        print(f"Error in init_session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to handle Bey Agent: {str(e)}")

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

    name = user_name.split(' ')[0] if user_name else 'Candidate'

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

    greeting = f"Welcome {name}. I am the Chairman of this board. We shall begin your mock interview now. Please take a seat and relax. Are you ready to begin?...."

    try:
        agent_id = get_or_update_agent(
            headers=headers,
            name="UPSC Interviewer",
            avatar_id="2ed7477f-3961-4ce1-b331-5e4530c55a57",
            system_prompt=system_prompt,
            greeting=greeting
        )

        # Return the static agent link
        return {
            "agent_id": agent_id,
            "call_id": "static-session",
            "beyCallLink": f"https://bey.chat/{agent_id}"
        }

    except Exception as e:
        print(f"Error in init_interview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to handle Bey Agent: {str(e)}")
