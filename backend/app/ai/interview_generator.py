import re

def generate_interview_questions(cand, job, cand_skills, missing_skills, match_score):
    """
    Generates 5 personalized interview questions:
    - Technical
    - Behavioral
    - Project-Based
    - Scenario-Based
    - Skill-Gap Validation
    Returns a list of dicts with keys: category, question, ideal_answer, difficulty
    """
    primary_skill = cand_skills[0] if cand_skills else "software engineering"
    secondary_skill = cand_skills[1] if len(cand_skills) > 1 else "system design"
    
    # 1. Technical Question
    tech_question = f"In the context of the {job.title} role, how do you handle state management, cache invalidation, and data consistency patterns when building applications using {primary_skill} and {secondary_skill}?"
    tech_ideal = f"Look for specific strategies: using Redis or Memcached with cache-aside/write-through patterns, managing race conditions, and language-specific details of {primary_skill}."

    # 2. Behavioral Question
    if cand.experience_years >= 6:
        behavioral_question = f"As an engineer with {cand.experience_years} years of experience, describe a situation where you had to lead a critical migration of microservices or data schemas under tight deadlines with technical uncertainty. How did you organize the team and mitigate risk?"
        behavioral_ideal = "Expect discussion on risk modeling, task sizing, parallel deployments, rollback strategies, and stakeholder communication."
    else:
        behavioral_question = f"With {cand.experience_years} years of professional tenure, tell me about a time you made a significant technical mistake during a production release. What was the failure, how did you troubleshoot it, and what safeguards did you put in place afterward?"
        behavioral_ideal = "Look for ownership, step-by-step diagnostic strategy (logging, tracing, metrics), and post-mortem actions."

    # 3. Project-Based Question
    summary_lower = cand.summary.lower() if cand.summary else ""
    if "nlp" in summary_lower or "language" in summary_lower or "transformer" in summary_lower or "model" in summary_lower:
        project_question = "Walk through the architecture of a natural language processing or machine learning model you designed. How did you perform data preprocessing, evaluate validation metrics, and transition the model to a production pipeline?"
        project_ideal = "Mentions of feature engineering, PyTorch/TensorFlow constructs, validation splits, API latency optimization, and versioning."
    elif "payment" in summary_lower or "billing" in summary_lower or "stripe" in summary_lower or "transaction" in summary_lower:
        project_question = "Explain how you designed the ledger or transaction consistency layer in your billing/payment systems. How did you guarantee idempotency and handle partial processing failures?"
        project_ideal = "Idempotency keys, database transactions (ACID), message queues, retry mechanisms with exponential backoff."
    elif "kubernetes" in summary_lower or "docker" in summary_lower or "infrastructure" in summary_lower or "cloud" in summary_lower or "terraform" in summary_lower:
        project_question = "Explain how you set up container orchestration and Infrastructure as Code pipelines for microservices. How did you configure security scanning, zero-downtime rolling deployments, and container resources limits?"
        project_ideal = "Terraform state locks, Kubernetes ingress, network policies, readiness/liveness probes, and container requests/limits."
    else:
        project_question = f"Walk through the technical architecture of a complex engineering project you built. What were the bottleneck constraints, how did you choose the tech stack, and how did you measure performance?"
        project_ideal = "System design diagrams, bottleneck analysis, performance telemetry (latency, CPU, memory), and architectural tradeoffs."

    # 4. Scenario-Based Question
    job_desc = job.description.lower() if job.description else ""
    if "data" in job_desc or "nlp" in job_desc or "semantic" in job_desc:
        scenario_question = "Your production semantic search engine starts displaying irrelevant candidate recommendations under peak traffic, and latency spikes. Describe your diagnosing strategy and optimization path."
        scenario_ideal = "Check vector index latency, check database query patterns, evaluate embedding model CPU constraints, and implement caching."
    elif "infra" in job_desc or "ops" in job_desc or "kubernetes" in job_desc or "ci/cd" in job_desc:
        scenario_question = "A critical deployment pipeline is failing intermittently because of container registry timeouts and database lock contention. How do you isolate the failures and secure the release path?"
        scenario_ideal = "Registry mirroring/caching, tuning DB connection pools, lock timeout configuration, and isolation of build pipelines."
    else:
        scenario_question = "The application frontend experiences a sudden memory leak, causing the server nodes to restart under load. Walk me through how you profile the frontend bundle, trace memory consumption, and isolate the leak."
        scenario_ideal = "Use heap profiling tools (like Chrome DevTools), identify uncleaned event listeners/timers, analyze memory graphs, and isolate the node components."

    # 5. Skill-Gap Validation
    if missing_skills:
        primary_missing = missing_skills[0].title()
        skill_gap_question = f"We notice that the {job.title} position lists {primary_missing} as a required skill, which isn't explicitly shown on your resume. How would you approach learning {primary_missing} for a production system, and how have you previously adapted to new frameworks on short notice?"
        skill_gap_ideal = f"Focus on candidate learning adaptability: structured training, building sandboxed proof-of-concepts, reading core design specifications, and applying it under code review."
    else:
        skill_gap_question = f"Since your skills align perfectly with the target profile, how do you keep up with recent updates and security standards in {primary_skill} and its ecosystem?"
        skill_gap_ideal = "Following official developer channels, reading RFCs, contributing to open source, and executing structural audits of third-party modules."

    return [
        {"category": "Technical", "question": tech_question, "ideal_answer": tech_ideal, "difficulty": "Advanced"},
        {"category": "Behavioral", "question": behavioral_question, "ideal_answer": behavioral_ideal, "difficulty": "Advanced" if cand.experience_years >= 6 else "Intermediate"},
        {"category": "Project-Based", "question": project_question, "ideal_answer": project_ideal, "difficulty": "Advanced"},
        {"category": "Scenario-Based", "question": scenario_question, "ideal_answer": scenario_ideal, "difficulty": "Advanced"},
        {"category": "Skill-Gap Validation", "question": skill_gap_question, "ideal_answer": skill_gap_ideal, "difficulty": "Intermediate"}
    ]
