from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserOnboard(BaseModel):
    company_name: str
    industry: str
    recruitment_volume: str
    primary_roles: List[str]
    goals: List[str]

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    onboarding_completed: bool
    company_name: Optional[str]
    industry: Optional[str]
    recruitment_volume: Optional[str]
    primary_roles: Optional[str]
    goals: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- JOB SCHEMAS ---
class JobCreate(BaseModel):
    title: str
    description: str
    department: Optional[str] = None
    location: Optional[str] = None
    experience_years: int = 0
    education_req: Optional[str] = None
    target_skills: Optional[str] = None # comma separated

class JobOut(BaseModel):
    id: int
    title: str
    description: str
    department: Optional[str]
    status: str
    location: Optional[str]
    experience_years: int
    education_req: Optional[str]
    target_skills: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- CANDIDATE & RESUME SCHEMAS ---
class SkillOut(BaseModel):
    skill_name: str
    is_matched: bool

    class Config:
        from_attributes = True

class CandidateOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    status: str
    location: Optional[str]
    current_title: Optional[str]
    experience_years: int
    education: Optional[str]
    summary: Optional[str]
    job_id: Optional[int] = None
    resume_path: Optional[str] = None
    resume_hash: Optional[str] = None
    dna_technical: float
    dna_leadership: float
    dna_learning: float
    dna_communication: float
    dna_innovation: float
    risk_level: str
    risk_explanations: Optional[str]
    ai_insights: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_uploaded_at: Optional[datetime] = None
    is_duplicate: Optional[bool] = False

    class Config:
        from_attributes = True

class RankingOut(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    overall_score: float
    skill_score: float
    experience_score: float
    education_score: float
    projects_score: float
    shortlist_explanation: Optional[str]
    candidate: CandidateOut
    job: JobOut
    matched_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    additional_skills: Optional[List[str]] = []

    class Config:
        from_attributes = True

class InterviewQuestionOut(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    question_type: str
    question_text: str
    ideal_answer: Optional[str] = None
    difficulty: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- COPILOT SCHEMAS ---
class ChatMessage(BaseModel):
    sender: str # user / copilot
    message: str
    created_at: Optional[datetime] = None

class ChatInput(BaseModel):
    message: str

# --- SETTINGS SCHEMAS ---
class SettingUpdate(BaseModel):
    key: str
    value: str
