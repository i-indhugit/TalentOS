from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base
from app.database.seed import seed_db

# Create SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.api import auth, jobs, candidates, rankings, copilot, analytics

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(rankings.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to the TalentOS Recruitment Intelligence API. Go to /docs for Swagger documentation."}

@app.post(f"{settings.API_V1_STR}/seed")
def trigger_database_seed():
    """
    Exposed route to re-seed the SQLite database with high-fidelity demo workspace candidates and rankings.
    """
    try:
        seed_db()
        return {"status": "success", "message": "Database successfully seeded with TalentOS workspace data."}
    except Exception as e:
        return {"status": "error", "message": f"Failed to seed database: {str(e)}"}
