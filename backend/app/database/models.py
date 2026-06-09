import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

# Association table for Candidate <-> Skill (many-to-many or explicitly structured)
class CandidateSkill(Base):
    __tablename__ = "candidate_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String, nullable=False)
    is_matched = Column(Boolean, default=True) # matched or missing compared to job
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Onboarding fields
    onboarding_completed = Column(Boolean, default=False)
    company_name = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    recruitment_volume = Column(String, nullable=True)
    primary_roles = Column(String, nullable=True) # comma separated
    goals = Column(String, nullable=True) # comma separated
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String, nullable=True)
    status = Column(String, default="active") # active, draft, closed
    location = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)
    education_req = Column(String, nullable=True)
    
    # Target skills for matching (comma separated)
    target_skills = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rankings = relationship("Ranking", back_populates="job", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default="Applied") # Applied, Shortlisted, Interviewing, Offered, Rejected
    location = Column(String, nullable=True)
    current_title = Column(String, nullable=True)
    experience_years = Column(Integer, default=0)
    education = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    
    # Linked Job Context & Resume path (Step 5 requirements)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    resume_path = Column(String, nullable=True)
    resume_hash = Column(String, unique=True, nullable=True)
    
    # Candidate DNA Metrics (0.0 to 100.0)
    dna_technical = Column(Float, default=70.0)
    dna_leadership = Column(Float, default=70.0)
    dna_learning = Column(Float, default=70.0)
    dna_communication = Column(Float, default=70.0)
    dna_innovation = Column(Float, default=70.0)
    
    # Risk Analysis & Insights
    risk_level = Column(String, default="Low") # Low, Medium, High
    risk_explanations = Column(Text, nullable=True) # JSON or comma-sep text
    ai_insights = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    resume = relationship("Resume", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    rankings = relationship("Ranking", back_populates="candidate", cascade="all, delete-orphan")
    interview_questions = relationship("InterviewQuestion", back_populates="candidate", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), unique=True, nullable=False)
    filename = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(Text, nullable=True) # full parsed structure
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="resume")

class Ranking(Base):
    __tablename__ = "rankings"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    
    overall_score = Column(Float, default=0.0)
    skill_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    projects_score = Column(Float, default=0.0)
    
    shortlist_explanation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="rankings")
    job = relationship("Job", back_populates="rankings")

class CopilotChat(Base):
    __tablename__ = "copilot_chats"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, default="default")
    sender = Column(String, nullable=False) # user or copilot
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InterviewPlan(Base):
    __tablename__ = "interview_plans"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    plan_json = Column(Text, nullable=True) # Full plan JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    question_type = Column(String, nullable=False) # Technical, Behavioral, Project-Based, Scenario-Based, Skill-Gap Validation
    question_text = Column(Text, nullable=False)
    ideal_answer = Column(Text, nullable=True)
    difficulty = Column(String, default="Advanced")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interview_questions")
    job = relationship("Job")

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True)
    metric_key = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    job = relationship("Job")
