from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models import CopilotChat, User
from app.schemas import ChatMessage, ChatInput
from app.api.auth import get_current_user
from app.ai.copilot import handle_copilot_query

router = APIRouter(prefix="/copilot", tags=["copilot"])

@router.get("/history", response_model=List[ChatMessage])
def get_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CopilotChat).order_by(CopilotChat.created_at.asc()).all()

@router.post("/message", response_model=ChatMessage)
def post_chat_message(chat_in: ChatInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Save user message
    user_msg = CopilotChat(sender="user", message=chat_in.message)
    db.add(user_msg)
    db.commit()
    
    # 2. Get AI response
    response_text = handle_copilot_query(db, chat_in.message)
    
    # 3. Save AI response
    copilot_msg = CopilotChat(sender="copilot", message=response_text)
    db.add(copilot_msg)
    db.commit()
    db.refresh(copilot_msg)
    
    return copilot_msg

@router.post("/clear")
def clear_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(CopilotChat).delete()
    db.commit()
    # Re-add welcome message
    welcome = CopilotChat(sender="copilot", message="Hello! I am your TalentOS Recruiter Copilot. Ask me questions about candidates, compare profiles, generate interview questions, or examine skill gaps. Let's find your next hire!")
    db.add(welcome)
    db.commit()
    return {"message": "Chat history cleared successfully"}
