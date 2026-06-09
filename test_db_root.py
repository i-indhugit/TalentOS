import sys
sys.path.append('backend')
from app.database.session import SessionLocal
from app.database.models import Candidate, InterviewQuestion, Job

db = SessionLocal()
try:
    cands = db.query(Candidate).all()
    print(f"Total Candidates in DB: {len(cands)}")
    for c in cands:
        questions = db.query(InterviewQuestion).filter(InterviewQuestion.candidate_id == c.id).all()
        print(f"ID: {c.id} | Name: {c.name} | Job ID: {c.job_id} | Questions: {len(questions)}")
finally:
    db.close()
