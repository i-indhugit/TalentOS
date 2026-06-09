from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models import Ranking, Candidate, Job, User, InterviewQuestion, CandidateSkill
from app.schemas import RankingOut
from app.api.auth import get_current_user
from app.ai.matcher import calculate_match_scores
from app.ai.interview_generator import generate_interview_questions

router = APIRouter(prefix="/rankings", tags=["rankings"])

@router.get("", response_model=List[RankingOut])
def read_rankings(
    job_id: Optional[int] = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(Ranking)
    if job_id:
        query = query.filter(Ranking.job_id == job_id)
    results = query.order_by(Ranking.overall_score.desc()).all()
    
    # Populate matching lists dynamically
    for r in results:
        job_skills = [s.strip().lower() for s in r.job.target_skills.split(",") if s.strip()] if r.job.target_skills else []
        candidate_skills = [s.skill_name.lower() for s in db.query(CandidateSkill).filter(CandidateSkill.candidate_id == r.candidate_id).all()]
        
        matched = [s.title() for s in job_skills if any(s == cs or cs == s for cs in candidate_skills)]
        missing = [s.title() for s in job_skills if s.lower() not in [m.lower() for m in matched]]
        additional = [s.title() for s in candidate_skills if s.lower() not in [m.lower() for m in matched]]
        
        r.matched_skills = matched
        r.missing_skills = missing
        r.additional_skills = additional
        
    return results

@router.get("/shortlist", response_model=List[RankingOut])
def get_ai_shortlist(
    job_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    AI Shortlist Engine: Returns top 5 candidates matching a specific job.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    results = db.query(Ranking).filter(Ranking.job_id == job_id).order_by(Ranking.overall_score.desc()).limit(5).all()
    
    for r in results:
        job_skills = [s.strip().lower() for s in r.job.target_skills.split(",") if s.strip()] if r.job.target_skills else []
        candidate_skills = [s.skill_name.lower() for s in db.query(CandidateSkill).filter(CandidateSkill.candidate_id == r.candidate_id).all()]
        
        matched = [s.title() for s in job_skills if any(s == cs or cs == s for cs in candidate_skills)]
        missing = [s.title() for s in job_skills if s.lower() not in [m.lower() for m in matched]]
        additional = [s.title() for s in candidate_skills if s.lower() not in [m.lower() for m in matched]]
        
        r.matched_skills = matched
        r.missing_skills = missing
        r.additional_skills = additional
        
    return results

@router.post("/status")
def update_candidate_status(
    candidate_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the candidate recruitment workflow status (Applied, Shortlisted, Interviewing, Offered, Rejected).
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    valid_statuses = ["Applied", "Shortlisted", "Interviewing", "Offered", "Rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    candidate.status = status
    db.commit()
    return {"message": "Status updated successfully", "candidate_id": candidate_id, "status": status}

@router.post("/recalculate")
def recalculate_rankings(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recalculates scores of all candidates against a specific job (e.g. after updating description).
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    rankings = db.query(Ranking).filter(Ranking.job_id == job_id).all()
    job_profile = {
        "title": job.title,
        "description": job.description,
        "experience_years": job.experience_years,
        "target_skills": job.target_skills
    }
    
    recalculated_count = 0
    for r in rankings:
        cand = r.candidate
        if not cand.resume:
            continue
            
        resume_text = cand.resume.raw_text
        
        # Correctly query the candidate skills from CandidateSkill table
        candidate_skills = [
            s.skill_name for s in db.query(CandidateSkill).filter(CandidateSkill.candidate_id == cand.id).all()
        ]
        
        cand_profile = {
            "skills": candidate_skills,
            "experience_years": cand.experience_years,
            "education": cand.education
        }
        
        match = calculate_match_scores(cand_profile, job_profile, resume_text)
        r.overall_score = match["overall_score"]
        r.skill_score = match["skill_score"]
        r.experience_score = match["experience_score"]
        r.education_score = match["education_score"]
        r.projects_score = match["projects_score"]
        r.shortlist_explanation = match["shortlist_explanation"]
        
        # Clear and rebuild interview questions in database
        db.query(InterviewQuestion).filter(
            InterviewQuestion.candidate_id == cand.id,
            InterviewQuestion.job_id == job_id
        ).delete()
        
        # Re-generate and add questions
        missing_skills = match.get("missing_skills", [])
        questions = generate_interview_questions(cand, job, candidate_skills, missing_skills, match["overall_score"])
        for q in questions:
            db.add(InterviewQuestion(
                candidate_id=cand.id,
                job_id=job.id,
                question_type=q["category"],
                question_text=q["question"],
                ideal_answer=q["ideal_answer"],
                difficulty=q["difficulty"]
            ))
        
        recalculated_count += 1
        
    db.commit()
    return {"message": f"Successfully recalculated rankings for {recalculated_count} candidates against job {job.title}."}
