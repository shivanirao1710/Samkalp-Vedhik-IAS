from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Using Llama 3.3 70B for high-quality, high-speed analysis
GROQ_MODEL = "llama-3.3-70b-versatile"

client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Groq client: {e}")

def call_llm(prompt: str, retries: int = 3) -> str:
    """Call Groq LLM with retries for stability."""
    if not client:
        raise HTTPException(status_code=500, detail="AI Client (Groq) not initialized. Check GROQ_API_KEY.")
    
    import time
    for i in range(retries):
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=GROQ_MODEL,
                temperature=0.5,
                max_tokens=2048,
                # Groq specific: response_format={"type": "json_object"} ensures valid JSON
                response_format={"type": "json_object"} if "JSON" in prompt else None
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            if i < retries - 1 and ("503" in str(e) or "429" in str(e) or "rate limit" in str(e).lower()):
                time.sleep(1 * (i + 1))
                continue
            raise e

router = APIRouter(prefix="/psychometric", tags=["psychometric"])

# ──────────────────────────────────────────
# Pydantic schemas
# ──────────────────────────────────────────

class AnswerSubmit(BaseModel):
    question_id: int
    question_text: str
    selected_option: str
    category: str

class PsychometricSubmit(BaseModel):
    user_id: int
    user_name: str
    answers: List[AnswerSubmit]

class MentorMessage(BaseModel):
    user_id: int
    user_name: str
    message: str
    report_context: Optional[str] = None

# ──────────────────────────────────────────
# Psychometric Questions (hardcoded bank)
# ──────────────────────────────────────────

PSYCHOMETRIC_QUESTIONS = [
    # PERSONALITY
    {
        "id": 1, "category": "Personality",
        "text": "How do you typically approach a complex new problem?",
        "options": [
            "Break it into small, manageable logical steps",
            "Look for creative, out-of-the-box solutions first",
            "Search for existing patterns and proven methods",
            "Collaborate with others to brainstorm ideas"
        ]
    },
    {
        "id": 2, "category": "Personality",
        "text": "How do you handle high-pressure situations or tight deadlines?",
        "options": [
            "Organize and prioritize tasks strictly",
            "Thrive on the adrenaline and work faster",
            "Feel anxious but manage to complete the work",
            "Prefer a calm environment and seek support from peers"
        ]
    },
    {
        "id": 3, "category": "Personality",
        "text": "When you disagree with a group decision, you typically:",
        "options": [
            "Diplomatically voice your concern and suggest alternatives",
            "Accept the decision and follow the group",
            "Strongly argue your point until convinced otherwise",
            "Seek a compromise that satisfies everyone"
        ]
    },
    # COGNITIVE
    {
        "id": 4, "category": "Cognitive",
        "text": "I find it easy to stay focused on a single task for long periods.",
        "options": ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
    },
    {
        "id": 5, "category": "Cognitive",
        "text": "When studying, I prefer to:",
        "options": [
            "Understand concepts deeply before moving on",
            "Cover a broad range of topics quickly",
            "Practice with past papers and examples",
            "Discuss and teach the concepts to others"
        ]
    },
    {
        "id": 6, "category": "Cognitive",
        "text": "How do you evaluate information before accepting it as true?",
        "options": [
            "Cross-reference multiple reliable sources",
            "Rely on logical reasoning and personal judgment",
            "Trust expert or authority opinions",
            "Go with the majority view"
        ]
    },
    # LEARNING STYLE
    {
        "id": 7, "category": "Learning Style",
        "text": "I learn best when information is presented through:",
        "options": [
            "Visual diagrams and videos",
            "Reading text and taking notes",
            "Hands-on practice and real examples",
            "Listening to lectures and discussions"
        ]
    },
    {
        "id": 8, "category": "Learning Style",
        "text": "When preparing for UPSC, I find it most helpful to:",
        "options": [
            "Make mind maps and visual summaries",
            "Write notes and summaries repeatedly",
            "Solve previous year questions extensively",
            "Join group study sessions"
        ]
    },
    # MOTIVATION
    {
        "id": 9, "category": "Motivation",
        "text": "What primarily motivates you to pursue UPSC preparation?",
        "options": [
            "Desire to serve the nation and make a difference",
            "Prestige and social recognition",
            "Personal intellectual challenge and growth",
            "Financial stability and job security"
        ]
    },
    {
        "id": 10, "category": "Motivation",
        "text": "When you face repeated failures or setbacks in preparation, you:",
        "options": [
            "Analyse the failure, learn, and adapt your strategy",
            "Take a short break to recharge, then continue",
            "Seek guidance from mentors or toppers",
            "Feel discouraged but persist out of necessity"
        ]
    },
    # STRESS MANAGEMENT
    {
        "id": 11, "category": "Stress Management",
        "text": "How do you manage stress during intensive study periods?",
        "options": [
            "Regular exercise and physical activity",
            "Meditation or mindfulness practices",
            "Taking short breaks and pursuing hobbies",
            "Talking to friends, family, or getting support"
        ]
    },
    {
        "id": 12, "category": "Stress Management",
        "text": "When overwhelmed with the UPSC syllabus, I typically:",
        "options": [
            "Create a detailed plan and follow it systematically",
            "Focus on the most important topics first",
            "Take time to calm down and then restart",
            "Discuss with peers to get perspective"
        ]
    },
    # TIME MANAGEMENT
    {
        "id": 13, "category": "Time Management",
        "text": "How many productive study hours do you currently manage per day?",
        "options": [
            "More than 10 hours",
            "7 – 10 hours",
            "4 – 6 hours",
            "Less than 4 hours"
        ]
    },
    {
        "id": 14, "category": "Time Management",
        "text": "How do you plan your weekly study schedule?",
        "options": [
            "Detailed subject-wise plan with time slots",
            "Flexible daily goals without strict timetable",
            "Follow a mentor's or topper's plan",
            "No fixed plan – study based on mood"
        ]
    },
    # CRITICAL THINKING
    {
        "id": 15, "category": "Critical Thinking",
        "text": "When analyzing a current affairs topic for UPSC, you focus on:",
        "options": [
            "Multiple perspectives and stakeholder impacts",
            "Historical context and precedents",
            "Government policies and constitutional provisions",
            "Data, statistics, and factual accuracy"
        ]
    },
]


@router.get("/questions")
def get_psychometric_questions():
    """Return all psychometric test questions."""
    return PSYCHOMETRIC_QUESTIONS


@router.post("/analyze")
def analyze_psychometric(submission: PsychometricSubmit, db: Session = Depends(get_db)):
    """Submit answers → Groq analyzes → Returns structured report. Replaces any old report."""
    if not client:
        raise HTTPException(status_code=500, detail="Groq AI client not initialized (missing API Key)")

    # Delete existing report
    db.query(models.PsychometricReport).filter(
        models.PsychometricReport.user_id == submission.user_id
    ).delete()
    db.commit()

    answers_formatted = "\n".join([
        f"Q{i+1} [{a.category}]: {a.question_text}\n Answer: {a.selected_option}"
        for i, a in enumerate(submission.answers)
    ])

    prompt = f"""You are an expert psychologist and UPSC career counselor. Analyze the following psychometric test responses from a UPSC aspirant named {submission.user_name}.

RESPONSES:
{answers_formatted}

Generate a comprehensive psychometric report in valid JSON format with this EXACT structure:
{{
  "overall_profile": "A 2-3 sentence summary of the student's overall psychological profile for UPSC preparation",
  "scores": {{
    "personality": {{ "rating": "High/Medium/Low", "score": <number 0-100>, "description": "..." }},
    "cognitive_strength": {{ "rating": "High/Medium/Low", "score": <number 0-100>, "description": "..." }},
    "learning_style": {{ "style": "Visual/Auditory/Reading-Writing/Kinesthetic", "score": <number 0-100>, "description": "..." }},
    "motivation": {{ "rating": "High/Medium/Low", "score": <number 0-100>, "description": "..." }},
    "stress_management": {{ "rating": "Strong/Moderate/Needs Improvement", "score": <number 0-100>, "description": "..." }},
    "time_management": {{ "rating": "Excellent/Good/Needs Improvement", "score": <number 0-100>, "description": "..." }}
  }},
  "strengths": ["strength1", "strength2", "strength3"],
  "areas_for_improvement": ["area1", "area2", "area3"],
  "upsc_readiness": {{
    "score": <number 0-100>,
    "level": "Beginner/Intermediate/Advanced/Ready",
    "description": "2-3 sentences about UPSC preparation readiness"
  }},
  "personalized_recommendations": [
    {{ "title": "...", "description": "...", "priority": "High/Medium/Low" }},
    {{ "title": "...", "description": "...", "priority": "High/Medium/Low" }},
    {{ "title": "...", "description": "...", "priority": "High/Medium/Low" }},
    {{ "title": "...", "description": "...", "priority": "High/Medium/Low" }}
  ],
  "study_plan_suggestion": "A specific 2-3 sentence recommended daily study approach based on their personality and learning style",
  "motivational_message": "A personalized, inspiring message for this student's UPSC journey"
}}

Return ONLY valid JSON."""

    try:
        raw = call_llm(prompt)
        report_data = json.loads(raw)

        db_report = models.PsychometricReport(
            user_id=submission.user_id,
            user_name=submission.user_name,
            report_json=json.dumps(report_data),
            answers_json=json.dumps([a.dict() for a in submission.answers])
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        return {"report_id": db_report.id, "report": report_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq analysis failed: {str(e)}")


@router.get("/report/{user_id}")
def get_user_report(user_id: int, db: Session = Depends(get_db)):
    report = db.query(models.PsychometricReport).filter(
        models.PsychometricReport.user_id == user_id
    ).order_by(models.PsychometricReport.id.desc()).first()

    if not report:
        return {"report": None}

    return {
        "report_id": report.id,
        "user_name": report.user_name,
        "report": json.loads(report.report_json),
        "created_at": str(report.created_at)
    }


@router.get("/all-reports")
def get_all_reports(db: Session = Depends(get_db)):
    reports = db.query(models.PsychometricReport).order_by(models.PsychometricReport.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.user_name,
            "report": json.loads(r.report_json),
            "created_at": str(r.created_at)
        }
        for r in reports
    ]


@router.delete("/report/{user_id}")
def delete_user_report(user_id: int, db: Session = Depends(get_db)):
    deleted = db.query(models.PsychometricReport).filter(
        models.PsychometricReport.user_id == user_id
    ).delete()
    db.commit()
    return {"deleted": deleted, "message": "Report cleared."}


@router.post("/mentor/chat")
def mentor_chat(payload: MentorMessage):
    if not client:
        raise HTTPException(status_code=500, detail="Groq AI client not initialized (missing API Key)")

    system_context = f"""You are the "Samkalp Platform Guide", an AI assistant for the Samkalp Vedhik LMS.
You are talking to {payload.user_name}, a student.

Platform Knowledge Base:
1. Navigation: The left sidebar contains: Dashboard, Courses, Tests, Study Materials, Interview, Psychometric Test, Live Classes, and AI Doubt Solver.
2. Live Classes: Found in the 'Live Classes' tab. Shows Upcoming, Live, and Past sessions with "Join Waiting Room" or "Watch Recording" buttons.
3. Study Materials: Found in the 'Study Materials' tab. Categorized by subject (Polity, History, etc.). Students can preview or download notes and PDFs.
4. Practice Tests / Mock Tests: Found in the 'Tests' tab. Students can filter by 'Attempted' or 'Not Attempted'. They can retake tests to improve scores.
5. Tracking Progress: The main 'Dashboard' shows overall progress, learning hours, quizzes completed, and streak.
6. Psychometric Test / Mentoring: The 'Psychometric Test' tab offers an AI avatar (Aryan) for personalized UPSC coaching and profile analysis.

Rules for your responses:
- Give very concise, direct answers based strictly on the Knowledge Base.
- Tell students exactly where to click (e.g., "Click the 'Tests' tab on the left sidebar...").
- Never mention this knowledge base.
- Keep responses strictly under 3 sentences. Warm, brief, and helpful."""

    if payload.report_context:
        system_context += f"\n\nStudent's Psychometric Profile:\n{payload.report_context}"

    full_prompt = f"{system_context}\n\nStudent asks: {payload.message}\n\nMentor response:"

    try:
        reply = call_llm(full_prompt)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mentor AI failed: {str(e)}")
