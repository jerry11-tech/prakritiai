"""
Centralized Role-Based Access Control (RBAC) & Audit Logging Service for PrakritiAI.

Implements:
  - 3-Level Security Hierarchy:
      ADMIN  (Level 3) -> Full System Access
      EXPERT (Level 2) -> Domain-Specific Access (Vata/Pitta/Kapha)
      USER   (Level 1) -> Own-Data Access Only
  - Brute force protection (account lockout after 5 failed attempts)
  - Audit logging of all sensitive operations
  - Resource ownership & specialization verification
  - Strict prevention of privilege escalation
"""

import os
import secrets
import hashlib
import string
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import jwt
from fastapi import Depends, HTTPException, Header, Request

from db.database import get_connection

# Security Constants
JWT_SECRET = os.environ.get("PRAKRITIAI_JWT_SECRET")
if not JWT_SECRET:
    JWT_SECRET = "prakritiai-dev-secret-key-rbac-v1"
    print("[SECURITY WARNING] PRAKRITIAI_JWT_SECRET environment variable is missing! Using default dev secret.")

JWT_ALGORITHM = "HS256"
ADMIN_SESSION_HOURS = 4
USER_SESSION_HOURS = 24
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
PBKDF2_ITERATIONS = 210_000
SALT_CHARS = string.ascii_letters + string.digits


# ---------------------------------------------------------------------------
# Password & Token Helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    salt = "".join(secrets.choice(SALT_CHARS) for _ in range(16))
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ITERATIONS)
    return f"{PBKDF2_ITERATIONS}${salt}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        iterations, salt, hex_digest = stored_hash.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iterations))
        return secrets.compare_digest(dk.hex(), hex_digest)
    except Exception:
        return False


def create_jwt_token(user_id: int, role: str, email: str, specialization: Optional[str] = None) -> str:
    expires_in_hours = ADMIN_SESSION_HOURS if role == "ADMIN" else USER_SESSION_HOURS
    payload = {
        "sub": str(user_id),
        "role": role.upper(),
        "email": email.strip().lower(),
        "specialization": specialization,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=expires_in_hours),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")


# ---------------------------------------------------------------------------
# Centralized Audit Logger
# ---------------------------------------------------------------------------
def log_audit_event(
    action: str,
    resource: str,
    status: str,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    user_role: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
):
    """Writes an immutable record to the audit_logs table."""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO audit_logs 
                   (user_id, user_email, user_role, action, resource, resource_id, ip_address, status, details, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    user_id,
                    user_email,
                    user_role,
                    action,
                    resource,
                    str(resource_id) if resource_id else None,
                    ip_address or "127.0.0.1",
                    status,
                    details,
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                ),
            )
            conn.commit()
    except Exception as e:
        print(f"[Audit Log Error] Failed to log event: {e}")


# ---------------------------------------------------------------------------
# Account Lockout & Brute Force Management
# ---------------------------------------------------------------------------
def handle_failed_login(email: str, ip_address: str = "127.0.0.1"):
    with get_connection() as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT id, failed_attempts FROM users WHERE email = ?", (email,)).fetchone()
        if user:
            new_attempts = user["failed_attempts"] + 1
            locked_until = None
            if new_attempts >= MAX_FAILED_ATTEMPTS:
                lock_time = datetime.now() + timedelta(minutes=LOCKOUT_MINUTES)
                locked_until = lock_time.strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute(
                "UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?",
                (new_attempts, locked_until, user["id"]),
            )
            conn.commit()
            log_audit_event(
                action="LOGIN_FAILED",
                resource="AUTH",
                status="DENIED",
                user_id=user["id"],
                user_email=email,
                details=f"Failed attempt {new_attempts}/{MAX_FAILED_ATTEMPTS}. Locked until {locked_until}",
                ip_address=ip_address,
            )


def reset_failed_login(user_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?",
            (user_id,),
        )
        conn.commit()


def check_account_lockout(user_row: sqlite3.Row):
    if user_row["locked_until"]:
        lock_time = datetime.strptime(user_row["locked_until"], "%Y-%m-%d %H:%M:%S")
        if datetime.now() < lock_time:
            remaining = int((lock_time - datetime.now()).total_seconds() / 60)
            raise HTTPException(
                status_code=429,
                detail=f"Account locked due to multiple failed login attempts. Try again in {remaining + 1} minutes.",
            )


# ---------------------------------------------------------------------------
# Seed Default Accounts (Admin & Pre-approved Experts)
# ---------------------------------------------------------------------------
def seed_default_admin():
    admin_email = "admin@prakritiai.org"
    with get_connection() as conn:
        cursor = conn.cursor()
        existing = cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,)).fetchone()
        if not existing:
            cursor.execute(
                """INSERT INTO users (name, email, password_hash, role, is_active, created_at)
                   VALUES (?, ?, ?, 'ADMIN', 1, ?)""",
                ("System Administrator", admin_email, hash_password("admin123"), datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            )
            conn.commit()
            print(f"[RBAC] Seeded default Admin account: {admin_email}")
        else:
            cursor.execute(
                "UPDATE users SET password_hash = ?, role = 'ADMIN', is_active = 1 WHERE email = ?",
                (hash_password("admin123"), admin_email),
            )
            conn.commit()

    # Seed Default Approved Experts
    default_experts = [
        ("Dr. Ananya Sharma", "vata.expert@ayurveda.org", "Vata", "BAMS, MD (Ayurveda) - Vata Specialist"),
        ("Dr. Rajesh Kulkarni", "pitta.expert@ayurveda.org", "Pitta", "BAMS, PhD (Ayurveda) - Pitta Specialist"),
        ("Dr. Sunita Patel", "kapha.expert@ayurveda.org", "Kapha", "BAMS, MD (Ayurveda) - Kapha Specialist"),
    ]

    for name, email, spec, details in default_experts:
        with get_connection() as conn:
            cursor = conn.cursor()
            u_row = cursor.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if not u_row:
                cursor.execute(
                    """INSERT INTO users (name, email, password_hash, role, is_active, created_at)
                       VALUES (?, ?, ?, 'EXPERT', 1, ?)""",
                    (name, email, hash_password("expert123"), datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                )
                user_id = cursor.lastrowid
            else:
                user_id = u_row["id"]
                cursor.execute(
                    "UPDATE users SET password_hash = ?, role = 'EXPERT', is_active = 1 WHERE id = ?",
                    (hash_password("expert123"), user_id),
                )

            e_row = cursor.execute("SELECT id FROM experts WHERE email = ?", (email,)).fetchone()
            if not e_row:
                cursor.execute(
                    """INSERT INTO experts (user_id, name, email, password_hash, specialization, professional_details, approval_status, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?)""",
                    (user_id, name, email, hash_password("expert123"), spec, details, datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                )
            else:
                cursor.execute(
                    """UPDATE experts 
                       SET user_id = ?, password_hash = ?, specialization = ?, approval_status = 'APPROVED'
                       WHERE id = ?""",
                    (user_id, hash_password("expert123"), spec, e_row["id"]),
                )
            conn.commit()


# Run seeding on import
seed_default_admin()


# ---------------------------------------------------------------------------
# Core RBAC Fastapi Authorization Dependencies
# ---------------------------------------------------------------------------
def get_current_user_account(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Authenticates the Bearer token and returns active user account."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required. Missing Bearer token.")

    token = authorization.replace("Bearer ", "", 1).strip()
    claims = decode_jwt_token(token)

    user_id = int(claims.get("sub"))
    with get_connection() as conn:
        cursor = conn.cursor()
        user = cursor.execute(
            "SELECT id, name, email, role, is_active, failed_attempts, locked_until FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="User account no longer exists.")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account has been suspended or deactivated.")

    # Check if expert account linked
    specialization = None
    if user["role"] == "EXPERT":
        with get_connection() as conn:
            cursor = conn.cursor()
            exp = cursor.execute(
                "SELECT specialization, approval_status FROM experts WHERE user_id = ? OR email = ?",
                (user["id"], user["email"]),
            ).fetchone()
            if exp:
                if exp["approval_status"] != "APPROVED":
                    raise HTTPException(status_code=403, detail="Expert account registration pending admin approval.")
                specialization = exp["specialization"]

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "specialization": specialization,
    }


def get_optional_user_account(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns active user dict if valid Bearer token present, else Guest user dict."""
    if not authorization or not authorization.startswith("Bearer "):
        return {"id": None, "name": "Guest Participant", "email": "guest@prakritiai.org", "role": "USER", "specialization": None}
    try:
        token = authorization.replace("Bearer ", "", 1).strip()
        claims = decode_jwt_token(token)
        user_id = int(claims.get("sub"))
        with get_connection() as conn:
            cursor = conn.cursor()
            user = cursor.execute("SELECT id, name, email, role, is_active FROM users WHERE id = ?", (user_id,)).fetchone()
        if user and user["is_active"]:
            return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "specialization": None}
    except Exception:
        pass
    return {"id": None, "name": "Guest Participant", "email": "guest@prakritiai.org", "role": "USER", "specialization": None}


def require_role(allowed_roles: List[str]):
    """Returns a dependency function that enforces allowed roles."""
    def dependency(current_user: Dict[str, Any] = Depends(get_current_user_account)):
        user_role = current_user["role"].upper()
        allowed_upper = [r.upper() for r in allowed_roles]
        if user_role not in allowed_upper:
            log_audit_event(
                action="UNAUTHORIZED_ACCESS_ATTEMPT",
                resource="RBAC_GUARD",
                status="DENIED",
                user_id=current_user["id"],
                user_email=current_user["email"],
                user_role=current_user["role"],
                details=f"Required roles: {allowed_roles}, got: {user_role}",
            )
            raise HTTPException(
                status_code=403,
                detail=f"Access forbidden. Requires one of roles: {', '.join(allowed_roles)}.",
            )
        return current_user

    return dependency


# Role-specific dependency instances
require_admin = require_role(["ADMIN"])
require_expert = require_role(["EXPERT", "ADMIN"])
require_user = require_role(["USER", "EXPERT", "ADMIN"])


def verify_expert_specialization(expert: Dict[str, Any], dosha_or_test_id: str):
    """
    Backend-enforced domain authorization.
    Verifies that expert's registered specialization matches requested dosha domain.
    ADMIN bypasses domain restriction.
    """
    if expert["role"] == "ADMIN":
        return True

    expert_spec = (expert.get("specialization") or "").strip().capitalize()
    target = dosha_or_test_id.strip().capitalize()

    # If target is a test ID, fetch its dominant dosha
    if not target in ("Vata", "Pitta", "Kapha"):
        with get_connection() as conn:
            cursor = conn.cursor()
            t_row = cursor.execute("SELECT dominant_dosha FROM prakriti_tests WHERE id = ?", (dosha_or_test_id,)).fetchone()
            if t_row and t_row["dominant_dosha"]:
                target = t_row["dominant_dosha"].strip().capitalize()

    if target in ("Vata", "Pitta", "Kapha") and expert_spec != target:
        log_audit_event(
            action="SPECIALIZATION_ACCESS_DENIED",
            resource="EXPERT_DOMAIN",
            status="DENIED",
            user_id=expert["id"],
            user_email=expert["email"],
            user_role=expert["role"],
            resource_id=dosha_or_test_id,
            details=f"Expert specialization '{expert_spec}' tried accessing domain '{target}'",
        )
        raise HTTPException(
            status_code=403,
            detail=f"Domain access denied. Your specialization is '{expert_spec}', but this resource belongs to '{target}'.",
        )
    return True


def verify_resource_ownership(resource_owner_id: int, current_user: Dict[str, Any]):
    """
    Backend-enforced resource ownership check.
    Ensures USER can only access their own data. ADMIN bypasses ownership check.
    """
    if current_user["role"] == "ADMIN":
        return True

    if int(current_user["id"]) != int(resource_owner_id):
        log_audit_event(
            action="IDOR_ACCESS_DENIED",
            resource="USER_DATA",
            status="DENIED",
            user_id=current_user["id"],
            user_email=current_user["email"],
            user_role=current_user["role"],
            resource_id=str(resource_owner_id),
            details=f"User ID {current_user['id']} attempted to access data owned by User ID {resource_owner_id}",
        )
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only view or modify your own resources.",
        )
    return True
