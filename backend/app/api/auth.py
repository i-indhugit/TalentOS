from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database.session import get_db
from app.database.models import User
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.schemas import UserCreate, UserLogin, Token, UserOut, UserOnboard

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        print("[AUTH DEBUG] Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    email_clean = user_in.email.lower().strip()
    password_clean = user_in.password.strip()
    
    db_user = db.query(User).filter(User.email == email_clean).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(password_clean)
    print(f"[AUTH DEBUG] Registering user: {email_clean}. Hashed password generated.")
    user = User(
        email=email_clean,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        onboarding_completed=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    email_clean = user_in.email.lower().strip()
    password_clean = user_in.password.strip()
    
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        print(f"[AUTH DEBUG] User Found check failed: {email_clean} not in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    print(f"[AUTH DEBUG] User Found: {email_clean}")
    
    if not user.is_active:
        print(f"[AUTH DEBUG] Account check failed: {email_clean} is disabled")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled",
        )
        
    if not verify_password(password_clean, user.hashed_password):
        print(f"[AUTH DEBUG] Password check failed for: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )
        
    print(f"[AUTH DEBUG] Password Valid for user: {email_clean}")
    
    access_token = create_access_token(subject=user.email)
    print(f"[AUTH DEBUG] JWT Created for user: {email_clean}")
    print(f"[AUTH DEBUG] Login Success for user: {email_clean}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/onboard", response_model=UserOut)
def onboard_user(onboard_in: UserOnboard, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.company_name = onboard_in.company_name
    current_user.industry = onboard_in.industry
    current_user.recruitment_volume = onboard_in.recruitment_volume
    current_user.primary_roles = ",".join(onboard_in.primary_roles)
    current_user.goals = ",".join(onboard_in.goals)
    current_user.onboarding_completed = True
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
