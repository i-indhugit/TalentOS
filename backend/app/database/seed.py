import json
import datetime
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine, Base
from app.database.models import User, Job, Candidate, Resume, CandidateSkill, Ranking, CopilotChat, InterviewPlan, InterviewQuestion, Analytics
from app.core.security import get_password_hash

def seed_db():
    print("Re-creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("Seeding default administrator...")
        hashed_pw = get_password_hash("password123")
        admin = User(
            email="admin@talentos.ai",
            hashed_password=hashed_pw,
            full_name="Alex Mercer",
            onboarding_completed=True,
            company_name="Vortex AI",
            industry="Software & AI Solutions",
            recruitment_volume="10-50 per year",
            primary_roles="Software Engineer, Data Scientist, DevOps",
            goals="Accelerate screening, structure interview questions, map skill gaps"
        )
        db.add(admin)
        db.commit()

        print("Seeding jobs...")
        job_fullstack = Job(
            title="Senior Full Stack Engineer",
            description="We are seeking an experienced Full Stack Engineer to lead our frontend and backend development. You will build user interfaces in React/TypeScript and write performant backend APIs in FastAPI/Python. Experience with PostgreSQL, Docker, and AWS is a major plus.",
            department="Engineering",
            status="active",
            location="San Francisco, CA (Hybrid)",
            experience_years=5,
            education_req="Bachelor's in Computer Science or equivalent",
            target_skills="Python,React,TypeScript,FastAPI,PostgreSQL,Docker,AWS,Git"
        )
        
        job_datascientist = Job(
            title="Senior Data Scientist",
            description="Join our AI core team to design and build semantic search and ranking models. You will train deep learning architectures, perform NLP on unstructured records, and deploy models to production. Proficiency in PyTorch, Pandas, Scikit-learn, and SQL is required.",
            department="Data Science & AI",
            status="active",
            location="New York, NY (Remote)",
            experience_years=4,
            education_req="Master's or PhD in Quantitative Field",
            target_skills="Python,SQL,PyTorch,NLP,Scikit-learn,TensorFlow,Spark,Pandas"
        )
        
        job_devops = Job(
            title="DevOps Lead",
            description="We are looking for a DevOps leader to manage our cloud infrastructure, CI/CD pipelines, and Kubernetes orchestration. You will drive Infrastructure as Code with Terraform and implement scaling configurations in AWS.",
            department="Operations",
            status="active",
            location="Austin, TX (On-site)",
            experience_years=6,
            education_req="Bachelor's in CS or System Engineering",
            target_skills="AWS,Terraform,Docker,Kubernetes,CI/CD,Bash,Linux,Ansible"
        )
        
        db.add_all([job_fullstack, job_datascientist, job_devops])
        db.commit()

        print("Seeding candidates...")
        import hashlib
        def make_hash(name):
            return hashlib.sha256(name.encode()).hexdigest()

        # 1. Sarah Jenkins (Full Stack - Top Match)
        c1 = Candidate(
            name="Sarah Jenkins",
            email="sarah.jenkins@gmail.com",
            phone="+1 (512) 839-2910",
            status="Shortlisted",
            location="San Francisco, CA",
            current_title="Senior Software Engineer",
            experience_years=6,
            education="B.S. in Computer Science, Stanford University",
            summary="Passionate full-stack developer with 6+ years of building web services and scalable APIs. Proficient in React, Python (FastAPI/Django), and deploying containers via Docker on AWS. Strong champion of clean code, automated tests, and mentoring junior engineers.",
            dna_technical=95.0,
            dna_leadership=88.0,
            dna_learning=92.0,
            dna_communication=90.0,
            dna_innovation=89.0,
            risk_level="Low",
            risk_explanations="No major risks identified. Candidate has a highly balanced technical and team leadership capability.",
            ai_insights="Sarah represents an elite software engineer profile. Exceptional frontend/backend balance with top-tier university credentials and tech-sector tenure at Netflix and early startups.",
            resume_hash=make_hash("Sarah Jenkins")
        )
        
        # 2. John Doe (Data Scientist - Top Match)
        c2 = Candidate(
            name="John Doe",
            email="john.doe@fastmail.com",
            phone="+1 (415) 304-2098",
            status="Interviewing",
            location="Boston, MA",
            current_title="Senior AI Researcher",
            experience_years=5,
            education="M.S. in Data Science, MIT",
            summary="Data scientist specializing in natural language processing and transformer architectures. Heavy experience building retrieval-augmented generation pipelines, vector indexers, and production PyTorch systems. Former ML Lead at Meta.",
            dna_technical=96.0,
            dna_leadership=74.0,
            dna_learning=94.0,
            dna_communication=82.0,
            dna_innovation=95.0,
            risk_level="Low",
            risk_explanations="Slightly individual-contributor focused; leadership scores are slightly lower but ideal for highly specialized technical roles.",
            ai_insights="Outstanding ML capabilities. Strong alignment for deep technical problems, NLP pipelines, and search architectures. Former Meta tenure validates production ML engineering capability.",
            resume_hash=make_hash("John Doe")
        )
        
        # 3. David Chen (DevOps - Top Match)
        c3 = Candidate(
            name="David Chen",
            email="dchen.ops@outlook.com",
            phone="+1 (206) 773-1923",
            status="Shortlisted",
            location="Seattle, WA",
            current_title="Infrastructure Engineer",
            experience_years=6,
            education="B.S. in Computer Engineering, University of Washington",
            summary="Kubernetes enthusiast with knowledge of infrastructure as code. Managed migrations of 200+ microservices from VM clusters to Amazon EKS using Terraform. Focus on automated CI/CD security scanning and Docker configuration.",
            dna_technical=92.0,
            dna_leadership=80.0,
            dna_learning=89.0,
            dna_communication=84.0,
            dna_innovation=78.0,
            risk_level="Low",
            risk_explanations="No significant risks. Solid infrastructure profile.",
            ai_insights="Strong Cloud Native developer with concrete Terraform and Kubernetes track record. Excellent infrastructure automation focus, would provide immediate stability to release loops.",
            resume_hash=make_hash("David Chen")
        )

        # 4. Elena Rostova (Full Stack - Medium Match)
        c4 = Candidate(
            name="Elena Rostova",
            email="elena.r@devmail.net",
            phone="+1 (718) 554-1290",
            status="Applied",
            location="Brooklyn, NY",
            current_title="Software Developer",
            experience_years=3,
            education="B.A. in Computer Science, Hunter College",
            summary="Full stack engineer focusing on React applications and Python backend API scripting. Passionate about responsive UI, accessibility (a11y), and state management libraries. Proficient in Git, PostgreSQL, and basic Docker.",
            dna_technical=78.0,
            dna_leadership=76.0,
            dna_learning=95.0,
            dna_communication=92.0,
            dna_innovation=85.0,
            risk_level="Medium",
            risk_explanations="Missing AWS production deployment experience; shorter tenure (3 years) with FastAPI.",
            ai_insights="Elena is a fast-growth frontend specialist. Very high learnability index (95). Lacks enterprise-scale AWS architecture, but has very clean React and TypeScript fundamentals.",
            resume_hash=make_hash("Elena Rostova")
        )
        
        # 5. Marcus Aurelius (Full Stack - Top Match 2)
        c5 = Candidate(
            name="Marcus Aurelius",
            email="marcus.aurelius@philosophy.co",
            phone="+1 (917) 404-3329",
            status="Applied",
            location="San Francisco, CA",
            current_title="Staff Engineer",
            experience_years=8,
            education="B.S. & M.S. in Computer Science, UC Berkeley",
            summary="8+ years engineering experience. Built scalable payment interfaces and distributed billing systems in TypeScript and Python. Spearheaded microservice transitions at Stripe. Expert in API design, PostgreSQL query tuning, and Docker orchestration.",
            dna_technical=96.0,
            dna_leadership=94.0,
            dna_learning=91.0,
            dna_communication=95.0,
            dna_innovation=92.0,
            risk_level="Low",
            risk_explanations="None. Exceptional technical and leadership credentials.",
            ai_insights="Marcus has a stellar profile. Solid tenure at top tech companies. Highly qualified for staff or lead roles, presenting strong engineering principles and exceptional system design capability.",
            resume_hash=make_hash("Marcus Aurelius")
        )
        
        # 6. Amina Yusuf (Full Stack - Weak Match)
        c6 = Candidate(
            name="Amina Yusuf",
            email="amina.yusuf@gmail.com",
            phone="+1 (469) 211-9872",
            status="Applied",
            location="Dallas, TX",
            current_title="Junior Web Developer",
            experience_years=1,
            education="Software Engineering Bootcamp, Flatiron School",
            summary="Junior web developer skilled in Javascript, React, CSS3, and HTML5. Built personal projects in Node.js and SQLite. Eager to join a fast-paced team to transition into backend development using Python.",
            dna_technical=62.0,
            dna_leadership=65.0,
            dna_learning=88.0,
            dna_communication=85.0,
            dna_innovation=75.0,
            risk_level="High",
            risk_explanations="Lacks Python/FastAPI production backend experience; limited professional work history (bootcamp background); missing database scaling or cloud native credentials.",
            ai_insights="Amina is a junior candidate who needs strong mentorship. Excellent attitude and communication, but too junior for a senior engineer posting. Keep in database for future junior positions.",
            resume_hash=make_hash("Amina Yusuf")
        )
        
        # 7. Rajesh Kumar (Data Scientist - Medium Match)
        c7 = Candidate(
            name="Rajesh Kumar",
            email="rajesh.kumar@techcorp.in",
            phone="+1 (650) 441-2900",
            status="Applied",
            location="Sunnyvale, CA",
            current_title="Data Analyst",
            experience_years=3,
            education="B.Tech in Information Technology, IIT Madras",
            summary="Data Analyst with 3 years of experience writing SQL queries, building Tableau analytics dashboards, and training basic Scikit-learn classification models. Fluent in Python, Pandas, and data wrangling pipelines.",
            dna_technical=80.0,
            dna_leadership=70.0,
            dna_learning=88.0,
            dna_communication=78.0,
            dna_innovation=72.0,
            risk_level="Medium",
            risk_explanations="Lacks experience with deep learning frameworks (PyTorch/TensorFlow) and complex NLP embeddings; experience leans analyst rather than production.",
            ai_insights="Rajesh has excellent foundational analytics capabilities. Strong SQL and Pandas skills, but needs bridge training in Deep Learning and NLP architectures to fully succeed as a Senior Data Scientist.",
            resume_hash=make_hash("Rajesh Kumar")
        )

        # 8. Sophie Dubois (DevOps - High Match)
        c8 = Candidate(
            name="Sophie Dubois",
            email="sdubois@cloudnet.io",
            phone="+1 (312) 581-0092",
            status="Interviewing",
            location="Chicago, IL",
            current_title="Lead DevOps Engineer",
            experience_years=7,
            education="B.S. in Computer Science, McGill University",
            summary="DevOps specialist with 7 years configuring Kubernetes clusters and cloud infrastructure in AWS. Expert in CI/CD pipeline optimization, Docker containerization, and writing automated deployment tests in Bash.",
            dna_technical=91.0,
            dna_leadership=85.0,
            dna_learning=86.0,
            dna_communication=88.0,
            dna_innovation=81.0,
            risk_level="Low",
            risk_explanations="No major risks. Solid platform engineering skills.",
            ai_insights="Sophie is a veteran cloud-native engineer. Deep CI/CD automation background and multi-environment AWS orchestration experience makes her a premium candidate for the DevOps Lead position.",
            resume_hash=make_hash("Sophie Dubois")
        )

        # 9. Liam O'Connor (Full Stack & DevOps - Medium Match)
        c9 = Candidate(
            name="Liam O'Connor",
            email="liam.oconnor@devops.org",
            phone="+1 (617) 880-4921",
            status="Applied",
            location="Boston, MA",
            current_title="Systems Engineer",
            experience_years=4,
            education="B.S. in Network Systems, Boston University",
            summary="Systems engineer focusing on Linux system administration, Docker setups, and script development in Python and Bash. Familiar with React frontend web builds and configuring Nginx endpoints.",
            dna_technical=81.0,
            dna_leadership=73.0,
            dna_learning=85.0,
            dna_communication=80.0,
            dna_innovation=74.0,
            risk_level="Medium",
            risk_explanations="Lacks infrastructure management (Terraform/Kubernetes); experience leans network administrator.",
            ai_insights="Liam has stable Python scripting and systems administration skills. He represents a strong developer but lacks the CI/CD automation and orchestration required for advanced operations.",
            resume_hash=make_hash("Liam O'Connor")
        )

        # 10. Priya Patel (Data Scientist - High Match)
        c10 = Candidate(
            name="Priya Patel",
            email="priya.patel@datascience.com",
            phone="+1 (408) 789-5561",
            status="Applied",
            location="San Jose, CA",
            current_title="Data Scientist",
            experience_years=4,
            education="M.S. in Machine Learning, Carnegie Mellon University",
            summary="Machine Learning engineer with CMU Master's. Developed deep learning models for NLP classification and recommendation algorithms using PyTorch and Hugging Face. Skilled in SQL query optimization and Spark data processing.",
            dna_technical=94.0,
            dna_leadership=78.0,
            dna_learning=96.0,
            dna_communication=86.0,
            dna_innovation=92.0,
            risk_level="Low",
            risk_explanations="None. Exceptionally strong machine learning foundations.",
            ai_insights="Priya has CMU ML training. CMU credentials combined with NLP/Hugging Face expertise make her a perfect candidate for the Senior Data Scientist role.",
            resume_hash=make_hash("Priya Patel")
        )
        
        db.add_all([c1, c2, c3, c4, c5, c6, c7, c8, c9, c10])
        db.commit()

        # Seed Resumes with raw text for AI model queries
        r1 = Resume(candidate_id=c1.id, filename="Sarah_Jenkins_Resume.pdf", raw_text=c1.summary + " Skills: Python, React, TypeScript, FastAPI, PostgreSQL, Docker, AWS, Git.")
        r2 = Resume(candidate_id=c2.id, filename="John_Doe_Resume.pdf", raw_text=c2.summary + " Skills: Python, SQL, PyTorch, NLP, Scikit-learn, TensorFlow, Spark, Pandas.")
        r3 = Resume(candidate_id=c3.id, filename="David_Chen_Resume.pdf", raw_text=c3.summary + " Skills: AWS, Terraform, Docker, Kubernetes, CI/CD, Bash, Linux, Ansible.")
        r4 = Resume(candidate_id=c4.id, filename="Elena_Rostova_Resume.pdf", raw_text=c4.summary + " Skills: Python, React, SQL, HTML, CSS.")
        r5 = Resume(candidate_id=c5.id, filename="Marcus_Aurelius_Resume.pdf", raw_text=c5.summary + " Skills: Python, TypeScript, React, Docker, PostgreSQL, AWS, Git.")
        r6 = Resume(candidate_id=c6.id, filename="Amina_Yusuf_Resume.pdf", raw_text=c6.summary + " Skills: React, CSS, HTML, JavaScript.")
        r7 = Resume(candidate_id=c7.id, filename="Rajesh_Kumar_Resume.pdf", raw_text=c7.summary + " Skills: Python, SQL, Pandas, Scikit-learn, Spark.")
        r8 = Resume(candidate_id=c8.id, filename="Sophie_Dubois_Resume.pdf", raw_text=c8.summary + " Skills: AWS, CI/CD, Linux, Kubernetes, Ansible, Terraform.")
        r9 = Resume(candidate_id=c9.id, filename="Liam_OConnor_Resume.pdf", raw_text=c9.summary + " Skills: Python, Bash, Linux, Docker, React, Nginx.")
        r10 = Resume(candidate_id=c10.id, filename="Priya_Patel_Resume.pdf", raw_text=c10.summary + " Skills: Python, SQL, PyTorch, NLP, Scikit-learn, Spark.")
        
        db.add_all([r1, r2, r3, r4, r5, r6, r7, r8, r9, r10])
        db.commit()

        # Seed candidate skills database mapping
        skills_c1 = ["Python", "React", "TypeScript", "FastAPI", "PostgreSQL", "Docker", "AWS", "Git"]
        skills_c2 = ["Python", "SQL", "PyTorch", "NLP", "Scikit-learn", "TensorFlow", "Spark", "Pandas"]
        skills_c3 = ["AWS", "Terraform", "Docker", "Kubernetes", "CI/CD", "Bash", "Linux", "Ansible"]
        skills_c4 = ["Python", "React", "SQL", "HTML", "CSS"]
        skills_c5 = ["Python", "TypeScript", "React", "Docker", "PostgreSQL", "AWS", "Git"]
        skills_c6 = ["React", "CSS", "HTML", "JavaScript"]
        skills_c7 = ["Python", "SQL", "Pandas", "Scikit-learn", "Spark"]
        skills_c8 = ["AWS", "CI/CD", "Linux", "Kubernetes", "Ansible", "Terraform"]
        skills_c9 = ["Python", "Bash", "Linux", "Docker", "React", "Nginx"]
        skills_c10 = ["Python", "SQL", "PyTorch", "NLP", "Scikit-learn", "Spark"]
        
        def seed_skills(candidate_id, skill_list):
            for s in skill_list:
                db.add(CandidateSkill(candidate_id=candidate_id, skill_name=s, is_matched=True))
                
        seed_skills(c1.id, skills_c1)
        seed_skills(c2.id, skills_c2)
        seed_skills(c3.id, skills_c3)
        seed_skills(c4.id, skills_c4)
        seed_skills(c5.id, skills_c5)
        seed_skills(c6.id, skills_c6)
        seed_skills(c7.id, skills_c7)
        seed_skills(c8.id, skills_c8)
        seed_skills(c9.id, skills_c9)
        seed_skills(c10.id, skills_c10)
        db.commit()

        print("Seeding rankings...")
        # Overall weights: Skills = 50%, Experience = 25%, Education = 15%, Projects = 10%
        # Ranking against Full Stack Job (c1, c4, c5, c6, c9)
        rankings_fs = [
            Ranking(candidate_id=c1.id, job_id=job_fullstack.id, overall_score=94.5, skill_score=95.0, experience_score=92.0, education_score=95.0, projects_score=96.0, shortlist_explanation="Exceptional full stack match. Demonstrates top-tier performance in Python, React, FastAPI, and Docker deployments, backed by Stanford education."),
            Ranking(candidate_id=c5.id, job_id=job_fullstack.id, overall_score=93.8, skill_score=92.0, experience_score=96.0, education_score=94.0, projects_score=95.0, shortlist_explanation="Elite engineer with Stripe history. Very strong database query optimization and API layout skills."),
            Ranking(candidate_id=c4.id, job_id=job_fullstack.id, overall_score=78.2, skill_score=75.0, experience_score=80.0, education_score=82.0, projects_score=85.0, shortlist_explanation="Solid React developer but lacks AWS deployment and high-throughput database structure."),
            Ranking(candidate_id=c9.id, job_id=job_fullstack.id, overall_score=68.5, skill_score=65.0, experience_score=75.0, education_score=70.0, projects_score=68.0, shortlist_explanation="Systems administrator with React capabilities. Lacks FastAPI and typescript backend API experience."),
            Ranking(candidate_id=c6.id, job_id=job_fullstack.id, overall_score=48.0, skill_score=45.0, experience_score=40.0, education_score=60.0, projects_score=65.0, shortlist_explanation="Bootcamp graduate with React skills. Not qualified for senior role due to missing backend API skills.")
        ]
        
        # Ranking against Data Scientist Job (c2, c7, c10)
        rankings_ds = [
            Ranking(candidate_id=c2.id, job_id=job_datascientist.id, overall_score=95.2, skill_score=96.0, experience_score=94.0, education_score=95.0, projects_score=96.0, shortlist_explanation="Top candidate. Former Meta ML researcher with DL, PyTorch, and LLM development background."),
            Ranking(candidate_id=c10.id, job_id=job_datascientist.id, overall_score=93.5, skill_score=94.0, experience_score=92.0, education_score=96.0, projects_score=92.0, shortlist_explanation="Carnegie Mellon graduate with NLP credentials and Spark pipelines. Highly qualified for model research."),
            Ranking(candidate_id=c7.id, job_id=job_datascientist.id, overall_score=72.4, skill_score=70.0, experience_score=78.0, education_score=75.0, projects_score=70.0, shortlist_explanation="Competent analyst but lacking deep learning neural networks or NLP embedding modeling.")
        ]
        
        # Ranking against DevOps Job (c3, c8, c9)
        rankings_do = [
            Ranking(candidate_id=c8.id, job_id=job_devops.id, overall_score=91.4, skill_score=92.0, experience_score=90.0, education_score=92.0, projects_score=90.0, shortlist_explanation="Cloud infrastructure manager. CI/CD scaling and security testing, combined with cloud native Kubernetes knowledge."),
            Ranking(candidate_id=c3.id, job_id=job_devops.id, overall_score=89.2, skill_score=88.0, experience_score=92.0, education_score=88.0, projects_score=89.0, shortlist_explanation="Strong automation profiles with concrete experience in migrating clusters to Kubernetes using Terraform. Highly aligned."),
            Ranking(candidate_id=c9.id, job_id=job_devops.id, overall_score=70.5, skill_score=72.0, experience_score=70.0, education_score=68.0, projects_score=65.0, shortlist_explanation="Systems administrator, but lacks IaC (Terraform) and container orchestration (Kubernetes) at cloud scale.")
        ]
        
        db.add_all(rankings_fs + rankings_ds + rankings_do)
        db.commit()

        # Link candidates to their seeded job contexts (Strict Job context enforcement)
        c1.job_id = job_fullstack.id
        c5.job_id = job_fullstack.id
        c4.job_id = job_fullstack.id
        c6.job_id = job_fullstack.id
        
        c2.job_id = job_datascientist.id
        c10.job_id = job_datascientist.id
        c7.job_id = job_datascientist.id
        
        c8.job_id = job_devops.id
        c3.job_id = job_devops.id
        c9.job_id = job_devops.id
        db.commit()

        print("Seeding database interview questions...")
        from app.ai.interview_generator import generate_interview_questions
        
        candidate_jobs_mapping = [
            (c1, job_fullstack, skills_c1, 94.5),
            (c5, job_fullstack, skills_c5, 93.8),
            (c4, job_fullstack, skills_c4, 78.2),
            (c9, job_fullstack, skills_c9, 68.5),
            (c6, job_fullstack, skills_c6, 48.0),
            
            (c2, job_datascientist, skills_c2, 95.2),
            (c10, job_datascientist, skills_c10, 93.5),
            (c7, job_datascientist, skills_c7, 72.4),
            
            (c8, job_devops, skills_c8, 91.4),
            (c3, job_devops, skills_c3, 89.2),
            (c9, job_devops, skills_c9, 70.5)
        ]
        
        for cand, job, skills, score in candidate_jobs_mapping:
            job_skills = [s.strip().lower() for s in job.target_skills.split(",") if s.strip()] if job.target_skills else []
            cand_skills_lower = [s.lower() for s in skills]
            missing = [s.title() for s in job_skills if s not in cand_skills_lower]
            
            questions = generate_interview_questions(cand, job, skills, missing, score)
            for q in questions:
                db.add(InterviewQuestion(
                    candidate_id=cand.id,
                    job_id=job.id,
                    question_type=q["category"],
                    question_text=q["question"],
                    ideal_answer=q["ideal_answer"],
                    difficulty=q["difficulty"]
                ))
        db.commit()

        print("Seeding Recruiter Copilot messages...")
        chats = [
            CopilotChat(sender="copilot", message="Hello! I am your TalentOS Recruiter Copilot. Ask me questions about candidates, compare profiles, generate interview questions, or examine skill gaps. Let's find your next hire!"),
            CopilotChat(sender="user", message="Who is the best candidate for the Senior Full Stack Engineer role?"),
            CopilotChat(sender="copilot", message="Based on our AI matching pipeline, **Sarah Jenkins** is the top match for the **Senior Full Stack Engineer** role with a match score of **94.5%**.\n\nHere is a quick summary:\n- **Strengths**: 6 years of experience, worked at Netflix, strong React + FastAPI skills, and a B.S. in CS from Stanford.\n- **Skill Alignment**: Has 100% of target core skills (Python, React, TypeScript, FastAPI, Docker, AWS).\n- **Risk**: Low risk profile.\n\nWould you like me to generate tailored technical interview questions for her or compare her with the second-highest match, Marcus Aurelius?")
        ]
        db.add_all(chats)
        db.commit()

        print("Seeding Interview Plans...")
        # Tailored interview plan for Sarah Jenkins
        plan_c1 = {
            "strategy": "Validate deep full stack capabilities and engineering leadership in a high-scale microservices framework.",
            "focus_areas": [
                {"area": "FastAPI & Python Concurrency", "priority": "High"},
                {"area": "React Rendering Performance & Custom Hooks", "priority": "Medium"},
                {"area": "System Design for Distributed Processing", "priority": "High"}
            ],
            "strengths_to_validate": ["Microservices architecture", "API design and optimization", "Team mentorship"],
            "weaknesses_to_probe": ["Cloud cost optimization", "NoSQL systems experience"],
            "technical_questions": [
                {"question": "Explain how FastAPI handles asynchronous requests using Python's asyncio, and when you would use standard 'def' versus 'async def' in endpoint definitions.", "difficulty": "Advanced", "ideal_answer": "async def should be used for I/O bound tasks using non-blocking libraries; def is run in an external thread pool by FastAPI for blocking execution."},
                {"question": "How would you handle database connection pooling in a serverless AWS lambda framework versus a persistent Docker container setup?", "difficulty": "Advanced", "ideal_answer": "Serverless needs proxy managers (like RDS Proxy) or short connection times; Docker handles pooling in SQLAlchemy SessionLocal directly."}
            ],
            "behavioral_questions": [
                {"question": "Describe a time when you disagreed with a product manager on a technical tradeoff. How did you resolve it?", "difficulty": "Intermediate", "ideal_answer": "Look for metrics, user-impact focus, and alignment on business goals."}
            ]
        }
        
        ip1 = InterviewPlan(
            candidate_id=c1.id,
            job_id=job_fullstack.id,
            plan_json=json.dumps(plan_c1)
        )
        db.add(ip1)
        db.commit()

        print("Database successfully seeded with venture-backed, high-fidelity demo workspace!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
