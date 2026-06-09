import io
import json
import tempfile
import hashlib
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pypdf import PdfReader
import docx

from app.database.session import get_db
from app.database.models import Candidate, Resume, CandidateSkill, Job, Ranking, User, InterviewQuestion
from app.schemas import CandidateOut, SkillOut
from app.api.auth import get_current_user
from app.ai.extractor import analyze_resume_text
from app.ai.matcher import calculate_match_scores
from app.ai.interview_generator import generate_interview_questions

router = APIRouter(prefix="/candidates", tags=["candidates"])

def parse_file_text(file_bytes: bytes, filename: str) -> str:
    """
    Extracts plain text from PDF, DOCX, or text files.
    """
    filename_lower = filename.lower()
    
    if filename_lower.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        except Exception as e:
            print(f"pypdf extraction failed for {filename}: {e}")
            raise HTTPException(status_code=400, detail="Failed to parse PDF file.")
            
    elif filename_lower.endswith(".docx"):
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp:
                temp.write(file_bytes)
                temp_name = temp.name
            
            doc = docx.Document(temp_name)
            text = "\n".join([p.text for p in doc.paragraphs])
            return text
        except Exception as e:
            print(f"python-docx extraction failed for {filename}: {e}")
            raise HTTPException(status_code=400, detail="Failed to parse Word document.")
            
    else:
        # Fallback to plain text decoding
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=400, detail="Unsupported file format or encoding.")

@router.get("", response_model=List[CandidateOut])
def read_candidates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Candidate).all()

@router.post("/upload", response_model=CandidateOut)
async def upload_resume(
    file: UploadFile = File(...),
    job_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ingests a resume, checks duplicate candidate profiles, updates them if exists, and ranks against selected job context.
    """
    file_bytes = await file.read()
    filename = file.filename
    
    # Generate SHA256 of file bytes
    resume_hash = hashlib.sha256(file_bytes).hexdigest()

    # 1. Parse raw text
    raw_text = parse_file_text(file_bytes, filename)
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Resume text appears to be empty.")
        
    # Enforce job context: must have a job context linked
    if not job_id:
        first_job = db.query(Job).filter(Job.status == "active").first()
        if first_job:
            job_id = first_job.id
        else:
            raise HTTPException(status_code=400, detail="No active jobs in system. Please create a Job context first.")

    # 2. Extract entities and DNA profiles
    extracted = analyze_resume_text(raw_text, filename)
    
    # 3. Check duplicate candidate by: hash, email, phone, or name
    existing_cand = db.query(Candidate).filter(Candidate.resume_hash == resume_hash).first()
    if not existing_cand and extracted.get("email"):
        existing_cand = db.query(Candidate).filter(Candidate.email == extracted["email"]).first()
    if not existing_cand and extracted.get("phone"):
        clean_phone = re.sub(r'\D', '', extracted["phone"])
        if clean_phone:
            for c in db.query(Candidate).all():
                if c.phone and re.sub(r'\D', '', c.phone) == clean_phone:
                    existing_cand = c
                    break
    if not existing_cand and extracted.get("name"):
        existing_cand = db.query(Candidate).filter(func.lower(Candidate.name) == func.lower(extracted["name"].strip())).first()

    is_duplicate = False
    if existing_cand:
        is_duplicate = True
        db_candidate = existing_cand
        # Update existing candidate attributes
        db_candidate.name = extracted["name"]
        db_candidate.email = extracted["email"] or db_candidate.email
        db_candidate.phone = extracted["phone"] or db_candidate.phone
        db_candidate.experience_years = extracted["experience_years"]
        db_candidate.summary = raw_text[:200] + "..."
        db_candidate.job_id = job_id
        db_candidate.resume_path = filename
        db_candidate.resume_hash = resume_hash
        db_candidate.dna_technical = extracted["dna_technical"]
        db_candidate.dna_leadership = extracted["dna_leadership"]
        db_candidate.dna_learning = extracted["dna_learning"]
        db_candidate.dna_communication = extracted["dna_communication"]
        db_candidate.dna_innovation = extracted["dna_innovation"]
        db_candidate.risk_level = extracted["risk_level"]
        db_candidate.risk_explanations = extracted["risk_explanations"]
        db_candidate.ai_insights = extracted["ai_insights"]
        db_candidate.last_uploaded_at = datetime.utcnow()
        db_candidate.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_candidate)
        
        # Clear child associations to recreate
        db.query(CandidateSkill).filter(CandidateSkill.candidate_id == db_candidate.id).delete()
        db.query(Ranking).filter(Ranking.candidate_id == db_candidate.id).delete()
        db.query(InterviewQuestion).filter(InterviewQuestion.candidate_id == db_candidate.id).delete()
        db.commit()
    else:
        # Create Candidate
        db_candidate = Candidate(
            name=extracted["name"],
            email=extracted["email"],
            phone=extracted["phone"],
            status="Applied",
            experience_years=extracted["experience_years"],
            summary=raw_text[:200] + "...",
            job_id=job_id,
            resume_path=filename,
            resume_hash=resume_hash,
            dna_technical=extracted["dna_technical"],
            dna_leadership=extracted["dna_leadership"],
            dna_learning=extracted["dna_learning"],
            dna_communication=extracted["dna_communication"],
            dna_innovation=extracted["dna_innovation"],
            risk_level=extracted["risk_level"],
            risk_explanations=extracted["risk_explanations"],
            ai_insights=extracted["ai_insights"]
        )
        db.add(db_candidate)
        db.commit()
        db.refresh(db_candidate)
    
    # 4. Create or update Resume record
    db_resume = db.query(Resume).filter(Resume.candidate_id == db_candidate.id).first()
    if db_resume:
        db_resume.filename = filename
        db_resume.raw_text = raw_text
        db_resume.parsed_json = json.dumps(extracted)
    else:
        db_resume = Resume(
            candidate_id=db_candidate.id,
            filename=filename,
            raw_text=raw_text,
            parsed_json=json.dumps(extracted)
        )
        db.add(db_resume)
    db.commit()
    
    # 5. Populate Candidate Skills
    for skill in extracted["skills"]:
        db.add(CandidateSkill(candidate_id=db_candidate.id, skill_name=skill, is_matched=True))
    db.commit()
    
    # 6. Auto-calculate rankings against the selected job
    selected_job = db.query(Job).filter(Job.id == job_id).first()
    if selected_job:
        match = calculate_match_scores(
            {"skills": extracted["skills"], "experience_years": db_candidate.experience_years, "education": db_candidate.education},
            {"title": selected_job.title, "description": selected_job.description, "experience_years": selected_job.experience_years, "target_skills": selected_job.target_skills},
            raw_text
        )
        
        db_ranking = Ranking(
            candidate_id=db_candidate.id,
            job_id=selected_job.id,
            overall_score=match["overall_score"],
            skill_score=match["skill_score"],
            experience_score=match["experience_score"],
            education_score=match["education_score"],
            projects_score=match["projects_score"],
            shortlist_explanation=match["shortlist_explanation"]
        )
        db.add(db_ranking)
        
        # 7. Generate and store Interview Questions in DB
        missing_skills = match.get("missing_skills", [])
        questions = generate_interview_questions(
            db_candidate, 
            selected_job, 
            extracted["skills"], 
            missing_skills, 
            match["overall_score"]
        )
        for q in questions:
            db.add(InterviewQuestion(
                candidate_id=db_candidate.id,
                job_id=selected_job.id,
                question_type=q["category"],
                question_text=q["question"],
                ideal_answer=q["ideal_answer"],
                difficulty=q["difficulty"]
            ))
        
    db.commit()
    db.refresh(db_candidate)
    
    db_candidate.is_duplicate = is_duplicate
    return db_candidate


@router.get("/{candidate_id}", response_model=CandidateOut)
def read_candidate(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}

@router.get("/{candidate_id}/skills", response_model=List[SkillOut])
def get_candidate_skills(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Lists skills associated with a candidate.
    """
    skills = db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate_id).all()
    return [{"skill_name": s.skill_name, "is_matched": s.is_matched} for s in skills]

@router.get("/{candidate_id}/resume")
def get_candidate_resume(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetches the candidate's raw resume text.
    """
    resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"filename": resume.filename, "raw_text": resume.raw_text}

@router.get("/{candidate_id}/interview-plan")
def get_candidate_interview_plan(
    candidate_id: int, 
    job_id: Optional[int] = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Fetches dynamic personalized questions generated from skills, experience, and gaps stored in SQLite DB.
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    effective_job_id = job_id or candidate.job_id
    if not effective_job_id:
        first_job = db.query(Job).filter(Job.status == "active").first()
        effective_job_id = first_job.id if first_job else None
        
    if not effective_job_id:
        raise HTTPException(status_code=400, detail="No active Job context mapped for interview generation.")

    db_questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.candidate_id == candidate_id,
        InterviewQuestion.job_id == effective_job_id
    ).all()
    
    if not db_questions:
        job = db.query(Job).filter(Job.id == effective_job_id).first()
        if job:
            resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()
            raw_text = resume.raw_text if resume else ""
            skills = [s.skill_name for s in db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate_id).all()]
            
            match = calculate_match_scores(
                {"skills": skills, "experience_years": candidate.experience_years, "education": candidate.education},
                {"title": job.title, "description": job.description, "experience_years": job.experience_years, "target_skills": job.target_skills},
                raw_text
            )
            
            questions = generate_interview_questions(candidate, job, skills, match.get("missing_skills", []), match["overall_score"])
            db_questions = []
            for q in questions:
                new_q = InterviewQuestion(
                    candidate_id=candidate_id,
                    job_id=job.id,
                    question_type=q["category"],
                    question_text=q["question"],
                    ideal_answer=q["ideal_answer"],
                    difficulty=q["difficulty"]
                )
                db.add(new_q)
                db_questions.append(new_q)
            db.commit()

    strategy = f"Assess core engineering depth, alignment metrics, and retention risks for {candidate.name} matching the {candidate.current_title or 'Engineer'} profile."
    
    focus_areas = [
        {"area": "Architecture & Concurrency Validation", "priority": "High"},
        {"area": "Team Synergy & Leadership Skills", "priority": "Medium"}
    ]
    
    technical_qs = [{"question": q.question_text, "difficulty": q.difficulty, "ideal_answer": q.ideal_answer} for q in db_questions if q.question_type == "Technical"]
    behavioral_qs = [{"question": q.question_text, "difficulty": q.difficulty, "ideal_answer": q.ideal_answer} for q in db_questions if q.question_type == "Behavioral"]
    scenario_qs = [{"question": q.question_text, "difficulty": q.difficulty, "ideal_answer": q.ideal_answer} for q in db_questions if q.question_type == "Scenario-Based"]
    project_qs = [{"question": q.question_text, "difficulty": q.difficulty, "ideal_answer": q.ideal_answer} for q in db_questions if q.question_type == "Project-Based"]
    skill_gap_qs = [{"question": q.question_text, "difficulty": q.difficulty, "ideal_answer": q.ideal_answer} for q in db_questions if q.question_type == "Skill-Gap Validation"]

    return {
        "strategy": strategy,
        "focus_areas": focus_areas,
        "technical_questions": technical_qs,
        "behavioral_questions": behavioral_qs,
        "scenario_questions": scenario_qs,
        "project_questions": project_qs,
        "skill_gap_questions": skill_gap_qs
    }

