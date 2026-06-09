from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import Job, User
from app.schemas import JobCreate, JobOut
from app.api.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("", response_model=List[JobOut])
def read_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Job).all()

@router.post("", response_model=JobOut)
def create_job(job_in: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_job = Job(
        title=job_in.title,
        description=job_in.description,
        department=job_in.department,
        location=job_in.location,
        experience_years=job_in.experience_years,
        education_req=job_in.education_req,
        target_skills=job_in.target_skills,
        status="active"
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/{job_id}", response_model=JobOut)
def read_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
