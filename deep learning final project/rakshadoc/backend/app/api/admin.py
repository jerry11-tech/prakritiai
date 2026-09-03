from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_admin
from app.db.models import User, Document, LayoutElement, AuditLog
from app.db.schemas import AdminMetrics, UserResponse

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/metrics", response_model=AdminMetrics)
def get_admin_metrics(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    total_users = db.query(User).count()
    total_documents = db.query(Document).count()
    total_layout_elements = db.query(LayoutElement).count()

    # Category breakdown
    elements = db.query(LayoutElement).all()
    categories_breakdown = {}
    for elem in elements:
        categories_breakdown[elem.category] = categories_breakdown.get(elem.category, 0) + 1

    # Recent Audit activity
    recent_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10).all()
    recent_activity = [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        }
        for log in recent_logs
    ]

    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "total_layout_elements": total_layout_elements,
        "categories_breakdown": categories_breakdown,
        "recent_activity": recent_activity
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()
