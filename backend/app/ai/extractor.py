import re
import json

# Standard skills list to look for in resumes
KNOWN_SKILLS = [
    "Python", "React", "TypeScript", "FastAPI", "PostgreSQL", "Docker", "AWS", "Git",
    "SQL", "PyTorch", "NLP", "Scikit-learn", "TensorFlow", "Spark", "Pandas",
    "Terraform", "Kubernetes", "CI/CD", "Bash", "Linux", "Ansible", "JavaScript",
    "HTML", "CSS", "Nginx", "Java", "C++", "Rust", "Go", "GCP", "Azure", "NoSQL"
]

def extract_contact_info(text: str):
    email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    phone_pattern = r'(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}'
    
    email_match = re.search(email_pattern, text)
    phone_match = re.search(phone_pattern, text)
    
    email = email_match.group(0) if email_match else None
    phone = phone_match.group(0) if phone_match else None
    
    return email, phone

def extract_name(text: str, filename: str) -> str:
    # Fallback to cleaning up filename if name cannot be found in first line
    first_line = text.split('\n')[0].strip()
    if len(first_line) > 2 and len(first_line) < 40 and not any(char.isdigit() for char in first_line):
        return first_line
        
    # Clean filename (e.g. Sarah_Jenkins_Resume.pdf -> Sarah Jenkins)
    clean_name = filename.replace("_", " ").replace("-", " ")
    clean_name = re.sub(r'(?i)\b(resume|cv|uploaded|file)\b', '', clean_name)
    clean_name = re.sub(r'\.[a-zA-Z0-9]+$', '', clean_name).strip()
    
    if len(clean_name) > 0:
        return clean_name.title()
    return "Unknown Candidate"

def analyze_resume_text(text: str, filename: str) -> dict:
    """
    Parses raw resume text and computes structured intelligence metrics:
    - Contact Info (Name, Email, Phone)
    - Extracted Skills
    - Experience Years (heuristics)
    - DNA Score metrics
    - Risk Profiles
    - AI Insights
    """
    email, phone = extract_contact_info(text)
    name = extract_name(text, filename)
    
    # Extract skills
    extracted_skills = []
    text_lower = text.lower()
    for skill in KNOWN_SKILLS:
        # Match word boundaries for short terms like Go, Git, AWS
        if len(skill) <= 3:
            pattern = rf"\b{re.escape(skill.lower())}\b"
        else:
            pattern = re.escape(skill.lower())
            
        if re.search(pattern, text_lower):
            extracted_skills.append(skill)
            
    # Estimate experience years based on 'year' mentions or duration patterns
    experience_years = 2 # default fallback
    year_matches = re.findall(r'(\d+)\+?\s*(?:year|yr)s?\b(?:\s*of\s*experience)?', text_lower)
    if year_matches:
        try:
            experience_years = max(int(y) for y in year_matches)
        except ValueError:
            pass
            
    # Core DNA Metrics computations (heuristics on keywords)
    tech_score = 65.0 + min(len(extracted_skills) * 4.0, 30.0)
    
    lead_keywords = ["lead", "manager", "mentor", "scrum", "agile", "directed", "managed", "head", "architect"]
    lead_count = sum(1 for kw in lead_keywords if kw in text_lower)
    lead_score = 60.0 + min(lead_count * 8.0, 35.0)
    
    learn_keywords = ["degree", "course", "certified", "learn", "bootcamp", "phd", "university", "bs", "ms", "graduated"]
    learn_count = sum(1 for kw in learn_keywords if kw in text_lower)
    learn_score = 65.0 + min(learn_count * 6.0, 30.0)
    
    comm_keywords = ["communicated", "team", "client", "customer", "presented", "wrote", "collaborated", "support"]
    comm_count = sum(1 for kw in comm_keywords if kw in text_lower)
    comm_score = 60.0 + min(comm_count * 7.0, 35.0)
    
    innov_keywords = ["research", "patented", "designed", "created", "ml", "nlp", "pioneered", "implemented", "launched"]
    innov_count = sum(1 for kw in innov_keywords if kw in text_lower)
    innov_score = 60.0 + min(innov_count * 7.0, 35.0)

    # Risk assessment
    risks = []
    if len(extracted_skills) < 4:
        risks.append("Limited keyword-verified technical skills inventory.")
    if experience_years < 3:
        risks.append("Shorter professional experience history.")
    if "cloud" not in text_lower and not any(aws_term in text_lower for aws_term in ["aws", "azure", "gcp"]):
        risks.append("Lacks explicit production cloud deployment indicators.")
    if not any(db_term in text_lower for db_term in ["sql", "postgres", "mysql", "nosql", "database"]):
        risks.append("Weak database management visibility.")
        
    risk_level = "Low"
    if len(risks) >= 3:
        risk_level = "High"
    elif len(risks) >= 1:
        risk_level = "Medium"
        
    risk_explanations = "; ".join(risks) if risks else "No critical risk profiles detected during analysis."
    
    # AI insights compilation
    insights = ""
    if risk_level == "Low":
        insights = f"{name} presents a robust and well-rounded profile with strong technical skills ({', '.join(extracted_skills[:4])}) and stable experience background."
    elif risk_level == "Medium":
        insights = f"{name} shows solid promise particularly in core development, but lacks extensive exposure to cloud architectures or advanced deployment frameworks."
    else:
        insights = f"{name} is a high-growth junior candidate. Requires structured technical mentoring and validation of foundational API deployment concepts."
        
    return {
        "name": name,
        "email": email or f"{name.lower().replace(' ', '.')}@example.com",
        "phone": phone or "+1 (555) 019-2831",
        "skills": extracted_skills,
        "experience_years": experience_years,
        "dna_technical": round(tech_score, 1),
        "dna_leadership": round(lead_score, 1),
        "dna_learning": round(learn_score, 1),
        "dna_communication": round(comm_score, 1),
        "dna_innovation": round(innov_score, 1),
        "risk_level": risk_level,
        "risk_explanations": risk_explanations,
        "ai_insights": insights
    }
