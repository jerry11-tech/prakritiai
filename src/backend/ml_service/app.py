"""
FastAPI Backend Application for PrakritiAI.

Implements strict 3-Level Role-Based Access Control (RBAC):
  - Level 3: ADMIN  (/api/admin/*)
  - Level 2: EXPERT (/api/expert/*)
  - Level 1: USER   (/api/user/* & /api/prakriti/*)
"""

import os
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import Depends, FastAPI, HTTPException, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from db.database import get_connection, init_db
from ml_service.pipeline import predict_prakriti_ml, train_and_evaluate_models
from services.rbac_service import (
    get_current_user_account,
    get_optional_user_account,
    require_admin,
    require_expert,
    require_user,
    verify_expert_specialization,
    verify_resource_ownership,
    log_audit_event,
)
from services.auth_service import (
    register_user,
    register_expert,
    login_user,
    login_expert,
    list_all_experts,
    list_all_users,
    approve_expert,
    reject_expert,
    assign_expert_specialization,
    toggle_user_active_status,
)
from services.excel_sync import EXCEL_FILE_PATH, sync_excel_file
from services.emergency_backup import execute_3tier_emergency_backup
from services.expert_service import get_inter_rater_stats, submit_expert_assessment
from services.expert_review_service import (
    generate_verified_pdf,
    get_expert_dashboard,
    get_expert_test_detail,
    get_verified_data,
    list_expert_tests,
    submit_expert_decision,
)
from services.prakriti_service import (
    UPLOAD_DIR,
    analyze_prakriti,
    get_user_test,
    list_user_tests,
)

init_db()

app = FastAPI(
    title="PrakritiAI 3-Role RBAC Security Architecture",
    description="Full-stack Ayurvedic ML System with Strict Backend RBAC Enforcement (Admin, Expert, User)",
    version="3.0.0",
)

# Production CORS Origins
raw_cors = os.environ.get("PRAKRITIAI_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:8000")
cors_origins = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security Response Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------------------------------------------------------------------------
# Dynamic Settings In-Memory Store
# ---------------------------------------------------------------------------
SYSTEM_SETTINGS = {
    "mfa_required_for_admin": True,
    "admin_session_lifetime_hours": 4,
    "user_session_lifetime_hours": 24,
    "max_login_attempts": 5,
    "lockout_duration_minutes": 15,
    "auto_excel_sync_enabled": True,
}


# ---------------------------------------------------------------------------
# Pydantic Request Models
# ---------------------------------------------------------------------------
class RegisterUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "USER"  # Any non-USER values will be rejected/forced to USER


class RegisterExpertRequest(BaseModel):
    name: str
    email: str
    password: str
    specialization: str
    professional_details: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class AnalyzeRequest(BaseModel):
    answers: Dict[str, str]
    image_base64: Optional[str] = None
    image_reference: Optional[str] = None


class ExpertDecisionRequest(BaseModel):
    notes: Optional[str] = ""


class AssignSpecializationRequest(BaseModel):
    specialization: str


class ToggleUserStatusRequest(BaseModel):
    is_active: bool


# ---------------------------------------------------------------------------
# Public Health Check
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {"status": "HEALTHY", "rbac_enabled": True, "time": datetime.now().isoformat()}


# ===========================================================================
# 1. PUBLIC & AUTHENTICATION ENDPOINTS
# ===========================================================================
@app.post("/api/auth/register")
def auth_register(payload: RegisterUserRequest):
    return register_user(payload.name, payload.email, payload.password, payload.role or "USER")


@app.post("/api/auth/login")
def auth_login(payload: LoginRequest, request: Request):
    return login_user(payload.email, payload.password, request.client.host if request.client else "127.0.0.1")


@app.post("/api/expert/register")
def expert_register(payload: RegisterExpertRequest):
    return register_expert(
        payload.name,
        payload.email,
        payload.password,
        payload.specialization,
        payload.professional_details,
    )


@app.post("/api/expert/login")
def expert_login(payload: LoginRequest, request: Request):
    return login_expert(payload.email, payload.password, request.client.host if request.client else "127.0.0.1")


@app.get("/api/auth/me")
def auth_me(current_user: Dict[str, Any] = Depends(get_current_user_account)):
    return {"user": current_user}


# ===========================================================================
# 2. LEVEL 1 — USER ENDPOINTS (Own-Data Access Only)
# ===========================================================================
@app.post("/api/prakriti/analyze")
def prakriti_analyze(
    payload: AnalyzeRequest,
    current_user: Dict[str, Any] = Depends(get_optional_user_account),
):
    try:
        res = analyze_prakriti(
            answers=payload.answers,
            image_base64=payload.image_base64,
            image_reference=payload.image_reference,
            user_id=current_user["id"],
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    res["disclaimer"] = "This is an AI-based research analysis and is not a medical diagnosis."
    return res


@app.get("/api/prakriti/my-tests")
def prakriti_my_tests(current_user: Dict[str, Any] = Depends(require_user)):
    return {"tests": list_user_tests(current_user["id"])}


@app.get("/api/prakriti/tests/{test_id}")
def prakriti_test_detail(
    test_id: str,
    current_user: Dict[str, Any] = Depends(get_optional_user_account),
):
    with get_connection() as conn:
        cursor = conn.cursor()
        test_row = cursor.execute("SELECT user_id FROM prakriti_tests WHERE id = ?", (test_id,)).fetchone()

    if not test_row:
        raise HTTPException(status_code=404, detail="Test record not found.")

    # Ownership check: User can only view their own test (Admin can view all)
    if test_row["user_id"] is not None:
        if not current_user.get("id"):
            raise HTTPException(status_code=401, detail="Authentication required to view this private test record.")
        verify_resource_ownership(test_row["user_id"], current_user)

    try:
        return get_user_test(test_id, current_user.get("id") or 0)
    except PermissionError:
        raise HTTPException(status_code=403, detail="Access denied. You do not own this test record.")


@app.delete("/api/user/account")
def user_delete_account(current_user: Dict[str, Any] = Depends(require_user)):
    if current_user["role"] == "ADMIN":
        raise HTTPException(status_code=400, detail="Administrator account cannot be self-deleted.")

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM prakriti_tests WHERE user_id = ?", (current_user["id"],))
        cursor.execute("DELETE FROM users WHERE id = ?", (current_user["id"],))
        cursor.execute("DELETE FROM experts WHERE user_id = ?", (current_user["id"],))
        conn.commit()

    log_audit_event("USER_SELF_DELETED", "USER", "SUCCESS", current_user["id"], current_user["email"], current_user["role"])
    return {"status": "SUCCESS", "message": "Your user account and data have been permanently deleted."}


# ===========================================================================
# 3. LEVEL 2 — EXPERT ENDPOINTS (Domain-Specific Access)
# ===========================================================================
@app.get("/api/expert/me")
def expert_me(expert: Dict[str, Any] = Depends(require_expert)):
    return {"expert": expert}


@app.get("/api/expert/dashboard")
def expert_dashboard(expert: Dict[str, Any] = Depends(require_expert)):
    return get_expert_dashboard(expert)


@app.get("/api/expert/tests")
def expert_tests(
    status: Optional[str] = None,
    expert: Dict[str, Any] = Depends(require_expert),
):
    return {"tests": list_expert_tests(expert, status)}


@app.get("/api/expert/tests/{test_id}")
def expert_test_detail(
    test_id: str,
    expert: Dict[str, Any] = Depends(require_expert),
):
    verify_expert_specialization(expert, test_id)
    try:
        return get_expert_test_detail(expert, test_id)
    except PermissionError:
        raise HTTPException(status_code=403, detail=f"Access denied. Resource does not match your specialization ({expert.get('specialization')}).")


@app.post("/api/expert/tests/{test_id}/verify")
def expert_verify(
    test_id: str,
    payload: ExpertDecisionRequest,
    expert: Dict[str, Any] = Depends(require_expert),
):
    verify_expert_specialization(expert, test_id)
    res = submit_expert_decision(expert, test_id, "CORRECT", payload.notes)
    log_audit_event("EXPERT_VERIFIED_TEST", "EXPERT", "SUCCESS", expert["id"], expert["email"], expert["role"], resource_id=test_id)
    return res


@app.post("/api/expert/tests/{test_id}/reject")
def expert_reject(
    test_id: str,
    payload: ExpertDecisionRequest,
    expert: Dict[str, Any] = Depends(require_expert),
):
    verify_expert_specialization(expert, test_id)
    res = submit_expert_decision(expert, test_id, "INCORRECT", payload.notes)
    log_audit_event("EXPERT_REJECTED_TEST", "EXPERT", "SUCCESS", expert["id"], expert["email"], expert["role"], resource_id=test_id)
    return res


@app.get("/api/expert/verified-data")
def expert_verified_data(expert: Dict[str, Any] = Depends(require_expert)):
    return get_verified_data(expert)


@app.get("/api/expert/reports/pdf")
def expert_pdf_report(expert: Dict[str, Any] = Depends(require_expert)):
    pdf_bytes = generate_verified_pdf(expert)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="prakritiai_{expert.get("specialization", "full")}_verified_report.pdf"'},
    )


# ===========================================================================
# 4. LEVEL 3 — ADMIN ENDPOINTS (Full System Management)
# ===========================================================================
@app.get("/api/admin/users")
def admin_list_users(admin: Dict[str, Any] = Depends(require_admin)):
    return {"users": list_all_users()}


@app.post("/api/admin/users/{user_id}/toggle-status")
def admin_toggle_user_status(
    user_id: int,
    payload: ToggleUserStatusRequest,
    admin: Dict[str, Any] = Depends(require_admin),
):
    return toggle_user_active_status(user_id, payload.is_active, admin["id"])


@app.get("/api/admin/experts")
def admin_list_experts(admin: Dict[str, Any] = Depends(require_admin)):
    return {"experts": list_all_experts()}


@app.post("/api/admin/experts/{expert_id}/approve")
def admin_approve_expert(
    expert_id: int,
    admin: Dict[str, Any] = Depends(require_admin),
):
    return approve_expert(expert_id, admin["id"])


@app.post("/api/admin/experts/{expert_id}/reject")
def admin_reject_expert(
    expert_id: int,
    admin: Dict[str, Any] = Depends(require_admin),
):
    return reject_expert(expert_id, admin["id"])


@app.post("/api/admin/experts/{expert_id}/assign-specialization")
def admin_assign_specialization(
    expert_id: int,
    payload: AssignSpecializationRequest,
    admin: Dict[str, Any] = Depends(require_admin),
):
    return assign_expert_specialization(expert_id, payload.specialization, admin["id"])


@app.get("/api/admin/results")
def admin_system_results(admin: Dict[str, Any] = Depends(require_admin)):
    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            """SELECT pt.id, pt.user_id, u.email as user_email, pt.dominant_dosha, 
                      pt.vata_score, pt.pitta_score, pt.kapha_score, pt.ai_confidence, 
                      pt.facial_analysis_status, pt.created_at
               FROM prakriti_tests pt
               LEFT JOIN users u ON u.id = pt.user_id
               ORDER BY pt.created_at DESC"""
        ).fetchall()
    return {
        "totalResults": len(rows),
        "results": [
            {
                "id": r["id"],
                "userId": r["user_id"],
                "userEmail": r["user_email"] or "Anonymous",
                "dominantDosha": r["dominant_dosha"],
                "vataScore": round(r["vata_score"], 1),
                "pittaScore": round(r["pitta_score"], 1),
                "kaphaScore": round(r["kapha_score"], 1),
                "aiConfidence": round(r["ai_confidence"], 1),
                "facialStatus": r["facial_analysis_status"],
                "createdAt": r["created_at"],
            }
            for r in rows
        ],
    }


@app.get("/api/admin/audit-logs")
def admin_audit_logs(
    limit: int = 100,
    admin: Dict[str, Any] = Depends(require_admin),
):
    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            """SELECT id, user_id, user_email, user_role, action, resource, 
                      resource_id, ip_address, status, details, timestamp
               FROM audit_logs
               ORDER BY id DESC LIMIT ?""",
            (limit,),
        ).fetchall()

    return {
        "total": len(rows),
        "logs": [
            {
                "id": r["id"],
                "userId": r["user_id"],
                "userEmail": r["user_email"],
                "userRole": r["user_role"],
                "action": r["action"],
                "resource": r["resource"],
                "resourceId": r["resource_id"],
                "ipAddress": r["ip_address"],
                "status": r["status"],
                "details": r["details"],
                "timestamp": r["timestamp"],
            }
            for r in rows
        ],
    }


@app.get("/api/admin/settings")
def admin_get_settings(admin: Dict[str, Any] = Depends(require_admin)):
    return {"settings": SYSTEM_SETTINGS}


@app.post("/api/admin/settings")
def admin_update_settings(
    updates: Dict[str, Any],
    admin: Dict[str, Any] = Depends(require_admin),
):
    for k, v in updates.items():
        if k in SYSTEM_SETTINGS:
            SYSTEM_SETTINGS[k] = v
    log_audit_event("SETTINGS_UPDATED", "ADMIN", "SUCCESS", admin["id"], admin["email"], admin["role"], details=str(updates))
    return {"status": "SUCCESS", "settings": SYSTEM_SETTINGS}


# ---------------------------------------------------------------------------
# Research Dashboard & Excel Sync (Admin Access)
# ---------------------------------------------------------------------------
@app.get("/api/research-dashboard")
def get_research_dashboard(admin: Dict[str, Any] = Depends(require_admin)):
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    metrics_path = os.path.join(models_dir, "metrics_v1.json")

    if not os.path.exists(metrics_path):
        train_and_evaluate_models()

    import json
    with open(metrics_path, "r", encoding="utf-8") as f:
        ml_metrics = json.load(f)

    with get_connection() as conn:
        cursor = conn.cursor()
        total_parts = cursor.execute("SELECT COUNT(*) FROM participants").fetchone()[0]
        verified_parts = cursor.execute("SELECT COUNT(*) FROM participants WHERE verification_status = 'VERIFIED'").fetchone()[0]
        pending_parts = cursor.execute("SELECT COUNT(*) FROM participants WHERE verification_status = 'PENDING'").fetchone()[0]
        reverify_parts = cursor.execute("SELECT COUNT(*) FROM participants WHERE verification_status = 'NEEDS_REVERIFICATION'").fetchone()[0]
        total_changes = cursor.execute("SELECT COUNT(*) FROM change_history").fetchone()[0]

        labels = cursor.execute("""
            SELECT consensus_prakriti, COUNT(*) as cnt
            FROM prakriti_labels WHERE consensus_prakriti IS NOT NULL
            GROUP BY consensus_prakriti
        """).fetchall()

        dosha_counts = {"Vata": 0, "Pitta": 0, "Kapha": 0}
        for l in labels:
            if l["consensus_prakriti"] in dosha_counts:
                dosha_counts[l["consensus_prakriti"]] = l["cnt"]

        disagreements = cursor.execute("SELECT COUNT(*) FROM prakriti_labels WHERE label_status = 'DISAGREEMENT'").fetchone()[0]

    inter_rater = get_inter_rater_stats()

    return {
        "datasetSummary": {
            "totalParticipants": total_parts,
            "verifiedParticipants": verified_parts,
            "pendingVerification": pending_parts,
            "needsReverification": reverify_parts,
            "totalChanges": total_changes,
            "vataCount": dosha_counts["Vata"],
            "pittaCount": dosha_counts["Pitta"],
            "kaphaCount": dosha_counts["Kapha"],
            "disagreementCount": disagreements,
        },
        "interRaterAgreement": inter_rater,
        "mlModelMetrics": ml_metrics,
        "excelSyncStatus": {
            "excelPath": EXCEL_FILE_PATH,
            "fileExists": os.path.exists(EXCEL_FILE_PATH),
        },
    }


@app.post("/api/sync-excel")
def trigger_sync_excel(admin: Dict[str, Any] = Depends(require_admin)):
    return sync_excel_file()


@app.post("/api/admin/emergency-backup")
def trigger_emergency_backup(admin: Dict[str, Any] = Depends(require_admin)):
    """Executes Smart 3-Tier Emergency Backup (Database, Excel Mirror, JSON Audit Dump)."""
    backup_res = execute_3tier_emergency_backup()
    log_audit_event(
        user_id=admin["user_id"],
        email=admin["email"],
        role=admin["role"],
        action="EMERGENCY_BACKUP",
        resource="system",
        details=json.dumps(backup_res),
    )
    return backup_res


@app.get("/api/download-excel")
def download_excel(current_user: Dict[str, Any] = Depends(require_expert)):
    if not os.path.exists(EXCEL_FILE_PATH):
        sync_excel_file()
    return FileResponse(
        EXCEL_FILE_PATH,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="Prakriti_Verified_Data.xlsx",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_service.app:app", host="0.0.0.0", port=8000, reload=True)
