import sys
import os
sys.path.append('.')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Candidate, InterviewQuestion, Job

# Direct absolute connection to the SQLite database
db_path = "sqlite:///c:/Users/INDU/Desktop/TalentOS/talentos.db"
engine = create_engine(db_path)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
try:
    cands = db.query(Candidate).all()
    print(f"Total Candidates: {len(cands)}")
    for c in cands:
        questions = db.query(InterviewQuestion).filter(InterviewQuestion.candidate_id == c.id).all()
        print(f"ID: {c.id} | Name: {c.name} | Job ID: {c.job_id} | Questions: {len(questions)}")
        for q in questions[:2]:
            print(f"  - Category: '{q.category}' | Question: '{q.question[:60]}...'")
finally:
    db.close()
