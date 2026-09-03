"""
Authentication & Authorization Service for PrakritiAI.

Integrates with RBAC Service for 3-Level Security:
  - ADMIN  (Level 3)
  - EXPERT (Level 2)
  - USER   (Level 1)
"""

import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import Depends, HTTPException, Header, Request

from db.database import get_connection
from services.rbac_service import (
    create_jwt_token,
    decode_jwt_token,
    hash_password,
    verify_password,
    handle_failed_login,
    reset_failed_login,
    check_account_lockout,
    log_audit_event,
    get_current_user_account,
    require_admin,
    require_expert,
    require_user,
    verify_expert_specialization,
    verify_resource_ownership,
)

# Re-export JWT settings
JWT_SECRET = os.environ.get("PRAKRITIAI_JWT_SECRET", "prakritiai-dev-secret-key-rbac-v1")
JWT_ALGORITHM = "HS256"


# ---------------------------------------------------------------------------
# Core Registration Logic
# ---------------------------------------------------------------------------
def register_user(name: str, email: str, password: str, role: str = "USER") -> Dict[str, Any]:
    # Prevent privilege escalation: only ADMIN or USER allowed via public register
    email = email.strip().lower()
    if role and role.upper() != "USER":
        # Force USER role for standard registration
        role = "USER"

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    with get_connection() as conn:
        cursor = conn.cursor()
        exists = cursor.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        cursor.execute(
            """INSERT INTO users (name, email, password_hash, role, is_active, created_at)
               VALUES (?, ?, ?, 'USER', 1, ?)""",
            (name, email, hash_password(password), datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        )
        user_id = cursor.lastrowid
        conn.commit()

    log_audit_event(
        action="USER_REGISTERED",
        resource="AUTH",
        status="SUCCESS",
        user_id=user_id,
        user_email=email,
        user_role="USER",
        details="Standard user registration successful",
    )

    token = create_jwt_token(user_id=user_id, role="USER", email=email)
    return {"token": token, "user": {"id": user_id, "name": name, "email": email, "role": "USER"}}


def register_expert(name: str, email: str, password: str, specialization: str, professional_details: str = "") -> Dict[str, Any]:
    valid_spec = specialization.strip().capitalize()
    if valid_spec not in ("Vata", "Pitta", "Kapha"):
        raise HTTPException(status_code=400, detail="Specialization must be Vata, Pitta or Kapha.")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    email = email.strip().lower()
    with get_connection() as conn:
        cursor = conn.cursor()
        exists_user = cursor.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        exists_expert = cursor.execute("SELECT id FROM experts WHERE email = ?", (email,)).fetchone()
        if exists_user or exists_expert:
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        # Create linked User record (Role: EXPERT)
        cursor.execute(
            """INSERT INTO users (name, email, password_hash, role, is_active, created_at)
               VALUES (?, ?, ?, 'EXPERT', 1, ?)""",
            (name, email, hash_password(password), datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        )
        user_id = cursor.lastrowid

        # Create Expert application record
        cursor.execute(
            """INSERT INTO experts (user_id, name, email, password_hash, specialization, professional_details, approval_status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)""",
            (user_id, name, email, hash_password(password), valid_spec, professional_details, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        )
        expert_id = cursor.lastrowid
        conn.commit()

    log_audit_event(
        action="EXPERT_REGISTERED",
        resource="AUTH",
        status="PENDING_APPROVAL",
        user_id=user_id,
        user_email=email,
        user_role="EXPERT",
        details=f"Expert applied with specialization '{valid_spec}'",
    )

    return {
        "status": "REGISTERED",
        "message": "Registration submitted for administrator review.",
        "specialization": valid_spec,
        "expertId": expert_id,
    }


# ---------------------------------------------------------------------------
# Core Login Logic
# ---------------------------------------------------------------------------
def login_user(email: str, password: str, request_ip: str = "127.0.0.1") -> Dict[str, Any]:
    email = email.strip().lower()
    with get_connection() as conn:
        cursor = conn.cursor()
        row = cursor.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not row:
        handle_failed_login(email, request_ip)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    check_account_lockout(row)

    if not row["is_active"]:
        log_audit_event("LOGIN_FAILED", "AUTH", "SUSPENDED", row["id"], email, row["role"], details="Account suspended", ip_address=request_ip)
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact administrator.")

    if not verify_password(password, row["password_hash"]):
        handle_failed_login(email, request_ip)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    reset_failed_login(row["id"])

    # If user has EXPERT role, retrieve specialization
    specialization = None
    if row["role"] == "EXPERT":
        with get_connection() as conn:
            cursor = conn.cursor()
            exp = cursor.execute("SELECT specialization, approval_status FROM experts WHERE user_id = ? OR email = ?", (row["id"], email)).fetchone()
            if exp:
                if exp["approval_status"] != "APPROVED":
                    raise HTTPException(status_code=403, detail="Your expert registration is awaiting administrator approval.")
                specialization = exp["specialization"]

    token = create_jwt_token(user_id=row["id"], role=row["role"], email=email, specialization=specialization)

    log_audit_event("LOGIN_SUCCESS", "AUTH", "SUCCESS", row["id"], email, row["role"], details="User logged in successfully", ip_address=request_ip)

    return {
        "token": token,
        "user": {
            "id": row["id"],
            "name": row["name"],
            "email": email,
            "role": row["role"],
            "specialization": specialization,
        },
    }


def login_expert(email: str, password: str, request_ip: str = "127.0.0.1") -> Dict[str, Any]:
    email = email.strip().lower()
    with get_connection() as conn:
        cursor = conn.cursor()
        exp = cursor.execute("SELECT * FROM experts WHERE email = ?", (email,)).fetchone()
        user_row = cursor.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not exp or not user_row:
        handle_failed_login(email, request_ip)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    check_account_lockout(user_row)

    if exp["approval_status"] != "APPROVED":
        log_audit_event("LOGIN_FAILED", "AUTH", "UNAPPROVED", user_row["id"], email, "EXPERT", details="Unapproved expert attempted login", ip_address=request_ip)
        raise HTTPException(status_code=403, detail="Your expert registration is awaiting administrator approval.")

    if not verify_password(password, exp["password_hash"]):
        handle_failed_login(email, request_ip)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    reset_failed_login(user_row["id"])

    token = create_jwt_token(user_id=user_row["id"], role="EXPERT", email=email, specialization=exp["specialization"])

    log_audit_event("EXPERT_LOGIN_SUCCESS", "AUTH", "SUCCESS", user_row["id"], email, "EXPERT", details=f"Expert logged in ({exp['specialization']})", ip_address=request_ip)

    return {
        "token": token,
        "user": {
            "id": user_row["id"],
            "expertId": exp["id"],
            "name": exp["name"],
            "email": email,
            "role": "EXPERT",
            "specialization": exp["specialization"],
            "approvalStatus": exp["approval_status"],
        },
    }


# ---------------------------------------------------------------------------
# Auth Dependency Functions for Endpoints
# ---------------------------------------------------------------------------
def get_current_user(authorization: Optional[str] = Header(None)):
    user = get_current_user_account(authorization)
    return user


def get_current_expert(authorization: Optional[str] = Header(None)):
    user = get_current_user_account(authorization)
    if user["role"] not in ("EXPERT", "ADMIN"):
        raise HTTPException(status_code=403, detail="Expert access required.")
    if user["role"] == "EXPERT" and not user.get("specialization"):
        raise HTTPException(status_code=403, detail="Expert account pending approval.")
    return user


# ---------------------------------------------------------------------------
# Admin Management Operations
# ---------------------------------------------------------------------------
def list_all_experts() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            """SELECT e.id, e.user_id, e.name, e.email, e.specialization, e.professional_details, 
                      e.approval_status, e.created_at, u.is_active
               FROM experts e
               LEFT JOIN users u ON u.id = e.user_id OR u.email = e.email
               ORDER BY e.created_at DESC"""
        ).fetchall()
    return [
        {
            "id": r["id"],
            "userId": r["user_id"],
            "name": r["name"],
            "email": r["email"],
            "specialization": r["specialization"],
            "professionalDetails": r["professional_details"],
            "approvalStatus": r["approval_status"],
            "isActive": bool(r["is_active"]) if r["is_active"] is not None else True,
            "createdAt": r["created_at"],
        }
        for r in rows
    ]


def list_all_users() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "email": r["email"],
            "role": r["role"],
            "isActive": bool(r["is_active"]),
            "createdAt": r["created_at"],
        }
        for r in rows
    ]


def approve_expert(expert_id: int, admin_user_id: int = 1) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        row = cursor.execute("SELECT id, user_id, name, email, specialization FROM experts WHERE id = ?", (expert_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Expert not found.")

        cursor.execute("UPDATE experts SET approval_status = 'APPROVED', approved_by = ?, approved_at = ? WHERE id = ?",
                       (admin_user_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), expert_id))

        if row["user_id"]:
            cursor.execute("UPDATE users SET role = 'EXPERT', is_active = 1 WHERE id = ?", (row["user_id"],))
        else:
            cursor.execute("UPDATE users SET role = 'EXPERT', is_active = 1 WHERE email = ?", (row["email"],))

        conn.commit()

    log_audit_event("EXPERT_APPROVED", "ADMIN", "SUCCESS", admin_user_id, resource_id=str(expert_id), details=f"Approved expert '{row['name']}' ({row['specialization']})")
    return {"status": "SUCCESS", "message": f"Expert '{row['name']}' approved for {row['specialization']} specialization.", "expertId": expert_id}


def reject_expert(expert_id: int, admin_user_id: int = 1) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        row = cursor.execute("SELECT id, name, email FROM experts WHERE id = ?", (expert_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Expert not found.")
        cursor.execute("UPDATE experts SET approval_status = 'REJECTED' WHERE id = ?", (expert_id,))
        conn.commit()

    log_audit_event("EXPERT_REJECTED", "ADMIN", "SUCCESS", admin_user_id, resource_id=str(expert_id), details=f"Rejected expert '{row['name']}'")
    return {"status": "SUCCESS", "message": f"Expert '{row['name']}' registration rejected.", "expertId": expert_id}


def assign_expert_specialization(expert_id: int, specialization: str, admin_user_id: int = 1) -> Dict[str, Any]:
    valid_spec = specialization.strip().capitalize()
    if valid_spec not in ("Vata", "Pitta", "Kapha"):
        raise HTTPException(status_code=400, detail="Specialization must be Vata, Pitta or Kapha.")

    with get_connection() as conn:
        cursor = conn.cursor()
        row = cursor.execute("SELECT id, name FROM experts WHERE id = ?", (expert_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Expert not found.")
        cursor.execute("UPDATE experts SET specialization = ? WHERE id = ?", (valid_spec, expert_id))
        conn.commit()

    log_audit_event("EXPERT_SPECIALIZATION_ASSIGNED", "ADMIN", "SUCCESS", admin_user_id, resource_id=str(expert_id), details=f"Assigned specialization {valid_spec} to {row['name']}")
    return {"status": "SUCCESS", "message": f"Assigned {valid_spec} specialization to '{row['name']}'.", "expertId": expert_id}


def toggle_user_active_status(target_user_id: int, is_active: bool, admin_user_id: int = 1) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        target = cursor.execute("SELECT id, email, role FROM users WHERE id = ?", (target_user_id,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User account not found.")

        if target["role"] == "ADMIN" and not is_active:
            raise HTTPException(status_code=400, detail="Cannot deactivate Administrator account.")

        cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (1 if is_active else 0, target_user_id))
        conn.commit()

    action = "USER_ACTIVATED" if is_active else "USER_DEACTIVATED"
    log_audit_event(action, "ADMIN", "SUCCESS", admin_user_id, resource_id=str(target_user_id), details=f"User {target['email']} active={is_active}")
    return {"status": "SUCCESS", "message": f"User {target['email']} active status set to {is_active}."}
