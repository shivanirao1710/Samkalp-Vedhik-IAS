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

class MentorInfo(BaseModel):
    id: str
    name: str
    role: str
    description: str
    avatar_id: str
    image: str
    specialty: str

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

# Single Source of Truth for Mentor Metadata
MENTOR_DATA = {
    "2ed7477f-3961-4ce1-b331-5e4530c55a57": {
        "id": "chairman",
        "name": "The Chairman",
        "role": "Board Head",
        "description": "Senior retired bureaucrat focusing on administrative aptitude, ethics, and leadership.",
        "specialty": "Ethics & Governance",
        "image": "/src/images/aryan.png",
        "focus": "overall administrative aptitude, personality, and ethics",
        "bio": "Senior retired bureaucrat with decades of experience in governance."
    },
    "2bc759ab-a7e5-4b91-941d-9e42450d6546": {
        "id": "mehta",
        "name": "Dr. Mehta",
        "role": "Economics Expert",
        "description": "Specialist in Indian Economy and global trade dynamics. Known for her sharp fiscal analysis.",
        "specialty": "Economy & Trade",
        "image": "/src/images/mehta.png",
        "focus": "Indian Economy, fiscal policies, and global trade",
        "bio": "Renowned Economics expert known for her sharp fiscal analysis."
    },
    "1c7a7291-ee28-4800-8f34-acfbfc2d07c0": {
        "id": "reddy",
        "name": "Prof. Reddy",
        "role": "History & Culture",
        "description": "Expert in Indian heritage, social issues, and constitutional history.",
        "specialty": "History & Society",
        "image": "/src/images/reddy.png",
        "focus": "Indian heritage, social issues, and constitutional history",
        "bio": "Distinguished historian and culture specialist."
    },
    "b5bebaf9-ae80-4e43-b97f-4506136ed926": {
        "id": "verma",
        "name": "Ms. Verma",
        "role": "Science & Tech",
        "description": "Focuses on digitalization, AI ethics, environment, and climate change.",
        "specialty": "S&T, Environment",
        "image": "/src/images/verma.png",
        "focus": "digitalization, AI ethics, environment, and climate change",
        "bio": "Science & Tech visionary focusing on modern challenges."
    },
    "6a2c8805-d15d-4b57-b98d-699c05a4d624": {
        "id": "khanna",
        "name": "Col. Khanna",
        "role": "Security & IR",
        "description": "Focuses on internal security, border management, and international relations.",
        "specialty": "Security & IR",
        "image": "/src/images/khanna.png",
        "focus": "internal security, border management, and international relations",
        "bio": "Defense expert with a deep understanding of global geopolitics."
    }
}

@router.get("/mentors")
async def get_mentors():
    """Returns a list of all AI mentors/panelists."""
    return [
        {
            "id": data["id"],
            "name": data["name"],
            "role": data["role"],
            "description": data["description"],
            "avatar_id": avatar_id,
            "image": data["image"],
            "specialty": data["specialty"]
        } for avatar_id, data in MENTOR_DATA.items()
    ]

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
async def init_interview(user_name: str = "Candidate", avatar_id: str = None):
    load_dotenv()
    bey_key = os.getenv("BEY_API_KEY")
    if not bey_key:
        raise HTTPException(status_code=500, detail="BEY_API_KEY is not configured in .env")

    headers = {
        "x-api-key": bey_key,
        "Content-Type": "application/json"
    }

    name = user_name.split(' ')[0] if user_name else 'Candidate'

    # Fallback to Chairman if ID is missing or unknown
    primary_avatar_id = avatar_id or "2ed7477f-3961-4ce1-b331-5e4530c55a57"
    expert = MENTOR_DATA.get(primary_avatar_id, MENTOR_DATA["2ed7477f-3961-4ce1-b331-5e4530c55a57"])

    system_prompt = f"""You are {expert['name']}, a UPSC (Union Public Service Commission) Interview Board member conducting a mock personality test for {name}.
Your focus area is {expert['focus']}. You are a {expert['bio']}.

INTERVIEW PROTOCOL:
- CONVERSATIONAL: This is a 1-on-1 real-time voice interview. Keep your questions and responses concise (1-3 sentences).
- ATMOSPHERE: Maintain a formal, high-gravity atmosphere consistent with the real UPSC interview.
- CHARACTER: Be sharp, logical, and assess the candidate's character and aptitude, not just facts.
- ROLE: Stick strictly to your persona as {expert['name']}.
"""

    greeting = f"Welcome {name}. I am {expert['name']}. Today, I will be conducting your mock interview with a focus on {expert['focus']}. I have reviewed your profile and we shall begin now. Please be seated and feel comfortable. Are you ready?...."

    try:
        # Using provided avatar_id or falling back to Aryan as Chairman
        primary_avatar_id = avatar_id or "2ed7477f-3961-4ce1-b331-5e4530c55a57"
        
        agent_id = get_or_update_agent(
            headers=headers,
            name="UPSC 5-Member Panel",
            avatar_id=primary_avatar_id,
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
