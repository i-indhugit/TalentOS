import re
import math
from collections import Counter

def tokenize(text: str):
    """Tokenizes string to lowercase words."""
    return re.findall(r'\w+', text.lower())

def compute_pure_tfidf_similarity(text1: str, text2: str) -> float:
    """
    Computes TF-IDF Cosine Similarity between two strings in pure Python.
    No numpy or scikit-learn required.
    """
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)
    
    if not tokens1 or not tokens2:
        return 0.0
        
    # Term frequencies
    tf1 = Counter(tokens1)
    tf2 = Counter(tokens2)
    
    # Unique vocabulary
    vocab = set(tf1.keys()) | set(tf2.keys())
    
    # Document frequency (DF)
    df = {}
    for word in vocab:
        df[word] = 0
        if word in tf1:
            df[word] += 1
        if word in tf2:
            df[word] += 1
            
    # TF-IDF vector calculation
    # Since we have only 2 documents:
    # IDF = ln(1 + total_docs / df)
    def calculate_vector(tf_counter):
        vector = {}
        for word, count in tf_counter.items():
            # Term Frequency normalized or simple count
            tf_val = count / sum(tf_counter.values())
            idf_val = math.log(1 + 2.0 / df[word])
            vector[word] = tf_val * idf_val
        return vector

    vec1 = calculate_vector(tf1)
    vec2 = calculate_vector(tf2)
    
    # Dot product
    dot_product = 0.0
    for word, val1 in vec1.items():
        if word in vec2:
            dot_product += val1 * vec2[word]
            
    # Magnitude
    mag1 = math.sqrt(sum(v**2 for v in vec1.values()))
    mag2 = math.sqrt(sum(v**2 for v in vec2.values()))
    
    if mag1 == 0.0 or mag2 == 0.0:
        return 0.0
        
    similarity = dot_product / (mag1 * mag2)
    return similarity

def calculate_match_scores(candidate_profile: dict, job_profile: dict, resume_text: str) -> dict:
    """
    Calculates sub-scores and overall weighted score for ranking:
    - Skill Score (50%)
    - Experience Score (25%)
    - Education Score (15%)
    - Projects/Semantic Score (10%)
    """
    # 1. Skill Score (50%)
    job_skills_str = job_profile.get("target_skills", "")
    job_skills = [s.strip().lower() for s in job_skills_str.split(",") if s.strip()]
    candidate_skills = [s.strip().lower() for s in candidate_profile.get("skills", [])]
    
    matched_skills = []
    missing_skills = []
    
    if job_skills:
        for js in job_skills:
            if any(js in cs or cs in js for cs in candidate_skills):
                matched_skills.append(js)
            else:
                missing_skills.append(js)
        
        skill_score = (len(matched_skills) / len(job_skills)) * 100.0
    else:
        skill_score = 80.0
        
    # 2. Experience Score (25%)
    cand_years = candidate_profile.get("experience_years", 0)
    job_years = job_profile.get("experience_years", 0)
    
    if job_years <= 0:
        exp_score = 100.0
    elif cand_years >= job_years:
        exp_score = min(100.0, 90.0 + (cand_years - job_years) * 2.0)
    else:
        exp_score = (cand_years / job_years) * 90.0
        
    # 3. Education Score (15%)
    cand_edu = str(candidate_profile.get("education", "")).lower()
    job_edu = str(job_profile.get("education_req", "")).lower()
    
    edu_score = 70.0 # base score
    
    # Check degree matches
    edu_degrees = {
        "phd": 100.0,
        "doctorate": 100.0,
        "master": 90.0,
        "ms": 90.0,
        "mba": 85.0,
        "bachelor": 80.0,
        "bs": 80.0,
        "ba": 80.0,
        "bootcamp": 70.0
    }
    
    for deg, pts in edu_degrees.items():
        if deg in cand_edu:
            edu_score = max(edu_score, pts)
            break
            
    academic_brands = ["stanford", "mit", "harvard", "berkeley", "cmu", "carnegie", "oxford", "cambridge", "iit"]
    if any(brand in cand_edu for brand in academic_brands):
        edu_score = min(100.0, edu_score + 10.0)
        
    # 4. Semantic similarity score (10%)
    job_desc = job_profile.get("description", "")
    sim_coef = compute_pure_tfidf_similarity(resume_text, job_desc)
    
    # Scale from 0..1 to 0..100 and apply a small base shift for vocabulary differences
    semantic_score = min(100.0, sim_coef * 100.0 + 30.0)
    if not resume_text.strip() or not job_desc.strip():
        semantic_score = 50.0
    
    # Compute weighted sum
    overall_score = (
        (skill_score * 0.50) +
        (exp_score * 0.25) +
        (edu_score * 0.15) +
        (semantic_score * 0.10)
    )
    
    top_matched_skills = [s.title() for s in matched_skills[:3]]
    explanation = f"Calculated match score of {overall_score:.1f}% based on matching {len(matched_skills)} core skills ({', '.join(top_matched_skills)}), "
    if cand_years >= job_years:
        explanation += f"fully meeting the {job_years}-year experience threshold with {cand_years} years."
    else:
        explanation += f"offering {cand_years} years of experience towards the desired {job_years} years."
        
    return {
        "overall_score": round(overall_score, 1),
        "skill_score": round(skill_score, 1),
        "experience_score": round(exp_score, 1),
        "education_score": round(edu_score, 1),
        "projects_score": round(semantic_score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "shortlist_explanation": explanation
    }
