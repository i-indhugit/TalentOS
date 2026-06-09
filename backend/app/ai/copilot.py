import re
import json
from sqlalchemy.orm import Session
from app.database.models import Candidate, Job, Ranking, CandidateSkill, InterviewQuestion

def handle_copilot_query(db: Session, user_message: str) -> str:
    """
    Interprets user prompt to return structured answers based on database records.
    """
    msg = user_message.lower()
    
    # 1. COMPARE CANDIDATES
    compare_match = re.search(r'compare\s+([\w\s]+?)\s+and\s+([\w\s]+)', msg)
    if compare_match:
        name1 = compare_match.group(1).strip()
        name2 = compare_match.group(2).strip()
        
        c1 = db.query(Candidate).filter(Candidate.name.ilike(f"%{name1}%")).first()
        c2 = db.query(Candidate).filter(Candidate.name.ilike(f"%{name2}%")).first()
        
        if c1 and c2:
            r1 = db.query(Ranking).filter(Ranking.candidate_id == c1.id).order_by(Ranking.overall_score.desc()).first()
            r2 = db.query(Ranking).filter(Ranking.candidate_id == c2.id).order_by(Ranking.overall_score.desc()).first()
            
            score1 = f"{r1.overall_score}%" if r1 else "N/A"
            score2 = f"{r2.overall_score}%" if r2 else "N/A"
            
            return f"""### Candidate Comparison: {c1.name} vs {c2.name}

Here is a side-by-side evaluation of both candidates:

| Metric | {c1.name} | {c2.name} |
| :--- | :--- | :--- |
| **Current Title** | {c1.current_title or 'N/A'} | {c2.current_title or 'N/A'} |
| **Experience** | {c1.experience_years} years | {c2.experience_years} years |
| **Best Match Score** | **{score1}** | **{score2}** |
| **Risk Level** | {c1.risk_level} | {c2.risk_level} |
| **Technical DNA** | {c1.dna_technical}% | {c2.dna_technical}% |
| **Leadership DNA** | {c1.dna_leadership}% | {c2.dna_leadership}% |

**Recruiter Recommendation:**
{c1.name} has a technical core of {c1.dna_technical}%. {"We recommend shortlisting " + c1.name if (r1.overall_score if r1 else 0) > (r2.overall_score if r2 else 0) else "We recommend shortlisting " + c2.name} as they align more closely with our job requirements."""
        else:
            return f"I couldn't locate one or both of the candidates: **{name1}** or **{name2}**. Please verify their spelling."

    # 2. WHICH CANDIDATE MATCHES ROLE
    job_match = re.search(r'(?:candidate|which)\s+(?:matches|for)\s+([\w\s]+?)\s+role', msg)
    if not job_match:
        job_match = re.search(r'for\s+([\w\s]+?)\s+(?:position|job)', msg)
    if job_match:
        job_title = job_match.group(1).strip()
        job = db.query(Job).filter(Job.title.ilike(f"%{job_title}%")).first()
        if job:
            rankings = db.query(Ranking).filter(Ranking.job_id == job.id).order_by(Ranking.overall_score.desc()).limit(5).all()
            if rankings:
                output = f"### Top Candidates Matching the **{job.title}** Position:\n\n"
                for idx, r in enumerate(rankings):
                    c = r.candidate
                    output += f"{idx+1}. **{c.name}** - **{r.overall_score}% Match** (XP: {c.experience_years} years | Title: *{c.current_title or 'Engineer'}*)\n"
                return output
            return f"No candidate rankings calculated for the role **{job.title}** yet."
        return f"I couldn't locate a job opening matching the name **{job_title}**."

    # 3. SCORE THRESHOLD FILTERING (e.g. above 80%)
    score_match = re.search(r'(?:above|greater than|over)\s+(\d+)\s*%', msg)
    if not score_match:
        score_match = re.search(r'(\d+)\s*%\s*(?:or above|and higher|above)', msg)
    if score_match:
        threshold = float(score_match.group(1).strip())
        ranks = db.query(Ranking).filter(Ranking.overall_score >= threshold).order_by(Ranking.overall_score.desc()).all()
        if ranks:
            output = f"### Candidates with Match Scores Above **{threshold}%**:\n\n"
            for r in ranks:
                c = r.candidate
                output += f"* **{c.name}** - **{r.overall_score}%** (Role: *{r.job.title}* | XP: {c.experience_years} yrs)\n"
            return output
        return f"No candidates found with scores above **{threshold}%**."

    # 4. SKILL GAP ANALYSIS
    if "skill gap" in msg or "gaps" in msg:
        cand_name = None
        for cand in db.query(Candidate).all():
            if cand.name.lower() in msg:
                cand_name = cand.name
                break
        if cand_name:
            c = db.query(Candidate).filter(Candidate.name == cand_name).first()
            r = db.query(Ranking).filter(Ranking.candidate_id == c.id).order_by(Ranking.overall_score.desc()).first()
            if r and r.job:
                job_skills = [ts.strip().lower() for ts in r.job.target_skills.split(',') if ts.strip()] if r.job.target_skills else []
                cand_skills = [s.skill_name.lower() for s in db.query(CandidateSkill).filter(CandidateSkill.candidate_id == c.id).all()]
                missing = [s.title() for s in job_skills if s not in cand_skills]
                matched = [s.title() for s in job_skills if s in cand_skills]
                
                return f"""### Skill Gap Analysis: **{c.name}** ({r.job.title})
                
* **Overall Match Score**: **{r.overall_score}%**
* **Matched Skills**: {', '.join(matched) if matched else 'None'}
* **Missing Skills**: {', '.join(missing) if missing else 'None'}

**Recruiter Advice:**
{"Probing the candidate's understanding of " + ', '.join(missing) if missing else "No notable skill gaps detected. Candidate fits core requirements."}"""
        return "Please specify the candidate name. For example: *'What is the skill gap for Rajesh Kumar?'*"

    # 5. BEST CANDIDATE
    if "best candidate" in msg or "highest match" in msg or "who is top" in msg:
        best_rank = db.query(Ranking).order_by(Ranking.overall_score.desc()).first()
        if best_rank:
            cand = best_rank.candidate
            job = best_rank.job
            return f"""The highest matching candidate in the workspace is **{cand.name}** for the **{job.title}** opening.

**Key Metrics:**
* **Overall Match Score**: **{best_rank.overall_score}%**
* **Technical Experience**: {cand.experience_years} years
* **AI Shortlist Explanation**: {best_rank.shortlist_explanation}

Would you like me to prepare an interview plan or review candidate risk indicators?"""
        return "There are no candidate rankings loaded in the system yet. Please upload a resume."

    # 6. SEARCH SKILL OR PROGRAMMERS
    skill_search_match = re.search(r'(?:candidates?|developers?|engineers?)\s+(?:who\s+know|with|knowing|in)\s+([\w\+\#\-\s]+)', msg)
    if not skill_search_match:
        for s in ["python", "react", "kubernetes", "aws", "pytorch", "terraform", "typescript", "fastapi", "sql"]:
            if s in msg:
                skill_search_match = s
                break
                
    if skill_search_match:
        search_skill = skill_search_match if isinstance(skill_search_match, str) else skill_search_match.group(1).strip()
        matching_cands = db.query(Candidate).join(CandidateSkill).filter(CandidateSkill.skill_name.ilike(f"%{search_skill}%")).distinct().all()
        
        if matching_cands:
            output = f"### Candidates with **{search_skill.upper()}** Skill:\n\n"
            for c in matching_cands:
                best_r = db.query(Ranking).filter(Ranking.candidate_id == c.id).order_by(Ranking.overall_score.desc()).first()
                match_str = f"({best_r.overall_score}% Match)" if best_r else ""
                output += f"* **{c.name}** - {c.current_title or 'Engineer'} {match_str} (XP: {c.experience_years} years)\n"
            return output
        return f"No candidates were found with the skill **{search_skill}**."

    # 7. GENERATE INTERVIEW QUESTIONS
    if "interview questions" in msg or "interview plan" in msg or "interview strategy" in msg:
        cand_name = None
        for cand in db.query(Candidate).all():
            if cand.name.lower() in msg:
                cand_name = cand.name
                break
        
        if cand_name:
            c = db.query(Candidate).filter(Candidate.name == cand_name).first()
            db_qs = db.query(InterviewQuestion).filter(InterviewQuestion.candidate_id == c.id).all()
            
            if db_qs:
                output = f"### Tailored Interview Plan for **{c.name}** (Sourced from DB):\n\n"
                for idx, q in enumerate(db_qs):
                    output += f"{idx+1}. **[{q.question_type}]** {q.question_text}\n   - *Expected Signals*: {q.ideal_answer}\n"
                return output
            else:
                return f"No interview questions generated for **{c.name}** yet. Please recalculate rankings or check job context."
        return "Please specify the name of the candidate you'd like me to generate questions for. For example: *'Generate interview questions for Sarah Jenkins'*."

    # 8. DEFAULT FALLBACK
    return """I can assist you with several recruitment intelligence tasks:
1. **Who is the best candidate?** (Finds top candidate by match score)
2. **Which candidate matches Data Scientist role?** (Lists alignment by position title)
3. **Show candidates above 80%** (Filters candidates matching score bounds)
4. **What is the skill gap for Sarah Jenkins?** (Contrasts skills directly against job targets)
5. **Compare [Sarah] and [John]** (Gives a side-by-side tabular comparison)
6. **Show Python developers** (Searches candidates by technical skill)
7. **Generate interview questions for [Sarah Jenkins]** (Builds custom tech/behavioral plan)

How can I help you support your hiring workflow today?"""
