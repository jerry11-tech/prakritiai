"""
Purge all dummy / test data from PrakritiAI database, uploaded files, and Excel sheet.
Keans standard system seed accounts (Admin and pre-seeded Vata, Pitta, Kapha experts).
"""

import os
import sys
import sqlite3
import glob

BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "src", "backend"))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from db.database import get_connection
from services.rbac_service import seed_default_admin
from services.excel_sync import sync_excel_file

def purge_all_dummy_data():
    print("=" * 70)
    print("[PURGE] PURGING ALL DUMMY AND TEST DATA FROM PRAKRITIAI PLATFORM")
    print("=" * 70)

    db_path = os.path.join(BACKEND_ROOT, "db", "prakriti.db")
    if not os.path.exists(db_path):
        print("Database file not found.")
        return

    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Clear participant survey & questionnaire test data
        cursor.execute("DELETE FROM participants")
        cursor.execute("DELETE FROM questionnaire_responses")
        cursor.execute("DELETE FROM expert_assessments")
        cursor.execute("DELETE FROM prakriti_labels")
        cursor.execute("DELETE FROM change_history")
        cursor.execute("DELETE FROM verification_log")
        cursor.execute("DELETE FROM excel_sync_log")

        # 2. Clear user test analysis results
        cursor.execute("DELETE FROM prakriti_tests")
        cursor.execute("DELETE FROM question_answers")
        cursor.execute("DELETE FROM expert_reviews")

        # 3. Clear audit logs
        cursor.execute("DELETE FROM audit_logs")

        # 4. Clean non-seed users and experts
        seed_emails = (
            "admin@prakritiai.org",
            "vata.expert@ayurveda.org",
            "pitta.expert@ayurveda.org",
            "kapha.expert@ayurveda.org",
        )

        cursor.execute(
            f"DELETE FROM experts WHERE email NOT IN ({','.join(['?']*len(seed_emails))})",
            seed_emails,
        )

        cursor.execute(
            f"DELETE FROM users WHERE email NOT IN ({','.join(['?']*len(seed_emails))})",
            seed_emails,
        )

        conn.commit()
        print("[PASS] Database tables purged successfully.")

    # 5. Re-seed default admin and experts to ensure clean state
    seed_default_admin()
    print("[PASS] Default system seed accounts verified (Admin + 3 Experts).")

    # 6. Delete uploaded temporary images from uploads/
    uploads_dir = os.path.join(BACKEND_ROOT, "uploads")
    if os.path.exists(uploads_dir):
        files = glob.glob(os.path.join(uploads_dir, "*"))
        for f in files:
            try:
                os.remove(f)
            except Exception as e:
                print(f"Could not delete {f}: {e}")
        print(f"[PASS] Uploads directory cleaned ({len(files)} files removed).")

    # 7. Re-sync Excel file to clean state
    excel_res = sync_excel_file()
    print(f"[PASS] Excel file synchronized: {excel_res.get('message', 'Cleaned')}")

    print("=" * 70)
    print("SUCCESS: ALL DUMMY DATA PURGED SUCCESSFULLY! PLATFORM IS CLEAN.")
    print("=" * 70)

if __name__ == "__main__":
    purge_all_dummy_data()
