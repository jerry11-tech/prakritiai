"""
Expert Review & Verified Dataset Service.

SECURITY: Specialization filtering is enforced at the SQL level using the
authenticated expert's specialization record — the frontend never supplies it.
Only verification_status = 'VERIFIED' records enter the verified dataset / PDF.
"""

import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from fpdf import FPDF

from db.database import get_connection

VALID_SPECIALIZATIONS = ("Vata", "Pitta", "Kapha")


def _review_row_for_test(cursor, test_id: str, specialization: str):
    return cursor.execute(
        """SELECT * FROM expert_reviews WHERE test_id = ? AND expert_specialization = ?""",
        (test_id, specialization),
    ).fetchone()


def get_expert_dashboard(expert: Dict[str, Any]) -> Dict[str, Any]:
    spec = expert["specialization"]
    with get_connection() as conn:
        cursor = conn.cursor()
        total = cursor.execute(
            "SELECT COUNT(*) FROM prakriti_tests WHERE dominant_dosha = ?", (spec,)
        ).fetchone()[0]
        pending = cursor.execute(
            """SELECT COUNT(*) FROM expert_reviews WHERE expert_specialization = ? AND status = 'PENDING'""",
            (spec,),
        ).fetchone()[0]
        verified = cursor.execute(
            """SELECT COUNT(*) FROM expert_reviews WHERE expert_specialization = ? AND status = 'VERIFIED'""",
            (spec,),
        ).fetchone()[0]
        incorrect = cursor.execute(
            """SELECT COUNT(*) FROM expert_reviews WHERE expert_specialization = ? AND status = 'INCORRECT'""",
            (spec,),
        ).fetchone()[0]

    return {
        "expert": expert,
        "stats": {
            "totalTests": total,
            "pending": pending,
            "verified": verified,
            "incorrect": incorrect,
        },
    }


def list_expert_tests(expert: Dict[str, Any], status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns ONLY tests for this expert's specialization (SQL-level filter)."""
    spec = expert["specialization"]
    statuses = {"ALL", "PENDING", "VERIFIED", "INCORRECT"}
    status = (status or "ALL").upper()
    if status not in statuses:
        status = "ALL"

    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            """SELECT t.*, r.status AS review_status, r.expert_decision, r.verified_at, r.expert_notes
               FROM prakriti_tests t
               LEFT JOIN expert_reviews r ON r.test_id = t.id
               WHERE t.dominant_dosha = ?
               ORDER BY t.created_at DESC""",
            (spec,),
        ).fetchall()

    results = []
    for row in rows:
        review_status = row["review_status"] or "PENDING"
        if status != "ALL" and review_status != status:
            continue
        results.append({
            "test_id": row["id"],
            "dominant_dosha": row["dominant_dosha"],
            "scores": {
                "Vata": round(row["vata_score"], 1),
                "Pitta": round(row["pitta_score"], 1),
                "Kapha": round(row["kapha_score"], 1),
            },
            "ai_confidence": row["ai_confidence"],
            "status": review_status,
            "expert_decision": row["expert_decision"],
            "verified_at": row["verified_at"],
            "facial_analysis_status": row["facial_analysis_status"],
            "created_at": row["created_at"],
        })

    return results


def get_expert_test_detail(expert: Dict[str, Any], test_id: str) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        row = cursor.execute(
            """SELECT * FROM prakriti_tests WHERE id = ? AND dominant_dosha = ?""",
            (test_id, expert["specialization"]),
        ).fetchone()
        if not row:
            raise PermissionError("Result not found in your specialization.")
        answers = cursor.execute(
            "SELECT question_id, question_text, answer FROM question_answers WHERE test_id = ?",
            (test_id,),
        ).fetchall()
        review = cursor.execute(
            "SELECT * FROM expert_reviews WHERE test_id = ? AND expert_specialization = ?",
            (test_id, expert["specialization"]),
        ).fetchone()

    facial_obs = []
    if row["facial_observations"]:
        for item in row["facial_observations"].split(", "):
            if ": " in item:
                k, v = item.split(": ", 1)
                facial_obs.append({"category": k, "observation": v})

    return {
        "test_id": row["id"],
        "image_url": row["image_url"],
        "scores": {
            "Vata": round(row["vata_score"], 1),
            "Pitta": round(row["pitta_score"], 1),
            "Kapha": round(row["kapha_score"], 1),
        },
        "dominant_dosha": row["dominant_dosha"],
        "ai_confidence": row["ai_confidence"],
        "facial_analysis_status": row["facial_analysis_status"],
        "facial_observations": facial_obs,
        "answers": [{"question_id": a["question_id"], "question_text": a["question_text"], "answer": a["answer"]} for a in answers],
        "review": {
            "status": (review["status"] if review else "PENDING"),
            "expert_decision": (review["expert_decision"] if review else None),
            "expert_notes": (review["expert_notes"] if review else None),
            "verified_at": (review["verified_at"] if review else None),
        },
    }


def submit_expert_decision(expert: Dict[str, Any], test_id: str, decision: str, notes: str = "") -> Dict[str, Any]:
    decision = decision.upper()
    if decision not in ("CORRECT", "INCORRECT"):
        raise ValueError("Decision must be CORRECT or INCORRECT.")

    status = "VERIFIED" if decision == "CORRECT" else "INCORRECT"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with get_connection() as conn:
        cursor = conn.cursor()
        # Authorization: test must belong to expert's specialization
        row = cursor.execute(
            "SELECT * FROM prakriti_tests WHERE id = ? AND dominant_dosha = ?",
            (test_id, expert["specialization"]),
        ).fetchone()
        if not row:
            raise PermissionError("Result not found in your specialization.")

        existing = cursor.execute(
            "SELECT id FROM expert_reviews WHERE test_id = ? AND expert_specialization = ?",
            (test_id, expert["specialization"]),
        ).fetchone()

        if existing:
            cursor.execute(
                """UPDATE expert_reviews
                   SET expert_id = ?, status = ?, expert_decision = ?, expert_notes = ?, verified_at = ?
                   WHERE test_id = ? AND expert_specialization = ?""",
                (expert["id"], status, decision, notes, now_str, test_id, expert["specialization"]),
            )
        else:
            cursor.execute(
                """INSERT INTO expert_reviews
                   (test_id, expert_id, expert_specialization, ai_result, ai_confidence, status, expert_decision, expert_notes, verified_at, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (test_id, expert["id"], expert["specialization"], row["dominant_dosha"], row["ai_confidence"],
                 status, decision, notes, now_str, now_str),
            )

        conn.commit()
        review = cursor.execute(
            "SELECT * FROM expert_reviews WHERE test_id = ? AND expert_specialization = ?",
            (test_id, expert["specialization"]),
        ).fetchone()

    return {
        "test_id": test_id,
        "status": review["status"],
        "expert_decision": review["expert_decision"],
        "expert_id": review["expert_id"],
        "verified_at": review["verified_at"],
    }


def get_verified_data(expert: Dict[str, Any]) -> Dict[str, Any]:
    spec = expert["specialization"]
    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            """SELECT t.*, r.expert_decision, r.verified_at
               FROM expert_reviews r
               JOIN prakriti_tests t ON t.id = r.test_id
               WHERE r.expert_specialization = ? AND r.status = 'VERIFIED'
               ORDER BY r.verified_at DESC""",
            (spec,),
        ).fetchall()
        total_reviewed = cursor.execute(
            "SELECT COUNT(*) FROM expert_reviews WHERE expert_specialization = ?", (spec,)
        ).fetchone()[0]
        verified_count = cursor.execute(
            "SELECT COUNT(*) FROM expert_reviews WHERE expert_specialization = ? AND status = 'VERIFIED'", (spec,)
        ).fetchone()[0]
        incorrect_count = cursor.execute(
            "SELECT COUNT(*) FROM expert_reviews WHERE expert_specialization = ? AND status = 'INCORRECT'", (spec,)
        ).fetchone()[0]

    verified = [
        {
            "test_id": r["id"],
            "scores": {"Vata": round(r["vata_score"], 1), "Pitta": round(r["pitta_score"], 1), "Kapha": round(r["kapha_score"], 1)},
            "dominant_dosha": r["dominant_dosha"],
            "ai_confidence": r["ai_confidence"],
            "verified_at": r["verified_at"],
        }
        for r in rows
    ]

    rate = (verified_count / total_reviewed) * 100 if total_reviewed else 0.0

    return {
        "specialization": spec,
        "expert": expert["name"],
        "stats": {"totalReviewed": total_reviewed, "verified": verified_count, "incorrect": incorrect_count, "verificationRate": round(rate, 1)},
        "verified": verified,
    }


def generate_verified_pdf(expert: Dict[str, Any]) -> bytes:
    data = get_verified_data(expert)
    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # Header
    pdf.set_fill_color(16, 42, 32)
    pdf.rect(0, 0, 210, 34, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_xy(14, 8)
    pdf.cell(0, 10, "PRAKRITIAI  |  VERIFIED DATA REPORT", ln=1)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_xy(14, 19)
    pdf.cell(0, 6, f"Expert: {data['expert']}   |   Specialization: {data['specialization']}   |   Date: {datetime.now().strftime('%Y-%m-%d')}", ln=1)

    pdf.set_text_color(20, 20, 20)
    pdf.ln(14)

    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, "SUMMARY", ln=1)
    pdf.set_font("Helvetica", "", 10)
    pdf.ln(2)
    rows = [
        ("Total Reviewed", str(data["stats"]["totalReviewed"])),
        ("Verified", str(data["stats"]["verified"])),
        ("Incorrect", str(data["stats"]["incorrect"])),
        ("Verification Rate", f"{data['stats']['verificationRate']}%"),
    ]
    for label, value in rows:
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(60, 7, label, border=0)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 7, value, ln=1)

    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, "VERIFIED RESULTS", ln=1)
    pdf.ln(2)

    for entry in data["verified"]:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 7, f"Test #{entry['test_id']}", ln=1)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 6, f"  Vata: {entry['scores']['Vata']}%   Pitta: {entry['scores']['Pitta']}%   Kapha: {entry['scores']['Kapha']}%", ln=1)
        pdf.cell(0, 6, f"  AI Confidence: {entry['ai_confidence']}%   |   Expert Status: VERIFIED   |   {entry['verified_at']}", ln=1)
        pdf.ln(3)

    pdf.ln(6)
    pdf.set_draw_color(200, 200, 200)
    pdf.line(14, pdf.get_y(), 196, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "I", 8)
    pdf.cell(0, 5, "Generated by PrakritiAI - only expert-verified results are included.", ln=1)

    out = pdf.output(dest="S")
    if isinstance(out, str):
        return out.encode("latin1")
    return bytes(out)