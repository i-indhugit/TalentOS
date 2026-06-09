import sys
sys.path.append('.')
from app.database.session import SessionLocal
from app.database.models import InterviewQuestion, Candidate, Job

db = SessionLocal()
try:
    cands = db.query(Candidate).all()
    print(f"Total Candidates: {len(cands)}")
    for c in cands:
        questions = db.query(InterviewQuestion).filter(InterviewQuestion.candidate_id == c.id).all()
        print(f"Candidate: {c.name} (ID: {c.id}, Job ID: {c.job_id}) | Questions in DB: {len(questions)}")
        for q in questions[:2]:
            print(f"  - Type: '{q.question_type}' | Question: '{q.question_text[:40]}...'")
finally:
    db.close()
