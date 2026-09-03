"""
Smart 3-Tier Emergency Backup Engine for PrakritiAI.

Provides 3 redundant, independent backup mechanisms:
  1. Database Snapshot Backup: Timestamped SQLite copy in `backups/db/`
  2. Excel Workbook Mirror Backup: Timestamped copy of `Prakriti_Verified_Data.xlsx` in `backups/excel/`
  3. JSON Audit & State Dump Backup: Full immutable JSON dump of all records, change history & audit logs in `backups/json/`
"""

import json
import os
import shutil
import sqlite3
from datetime import datetime
from typing import Any, Dict

from db.database import DB_PATH, get_connection
from services.excel_sync import EXCEL_FILE_PATH, sync_excel_file

BACKUPS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backups"))
DB_BACKUP_DIR = os.path.join(BACKUPS_DIR, "db")
EXCEL_BACKUP_DIR = os.path.join(BACKUPS_DIR, "excel")
JSON_BACKUP_DIR = os.path.join(BACKUPS_DIR, "json")

os.makedirs(DB_BACKUP_DIR, exist_ok=True)
os.makedirs(EXCEL_BACKUP_DIR, exist_ok=True)
os.makedirs(JSON_BACKUP_DIR, exist_ok=True)


def execute_3tier_emergency_backup() -> Dict[str, Any]:
    """Triggers all 3 emergency backup mechanisms and returns status metrics."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    results = {
        "timestamp": time_str,
        "backup1_db_snapshot": None,
        "backup2_excel_mirror": None,
        "backup3_json_audit_dump": None,
        "status": "SUCCESS",
    }

    # --------------------------------------------------------------------------
    # Tier 1: Database Snapshot Backup (.db)
    # --------------------------------------------------------------------------
    try:
        db_dest_filename = f"prakriti_db_backup_{timestamp}.db"
        db_dest_path = os.path.join(DB_BACKUP_DIR, db_dest_filename)

        with get_connection() as src_conn:
            dest_conn = sqlite3.connect(db_dest_path)
            src_conn.backup(dest_conn)
            dest_conn.close()

        db_size_kb = round(os.path.getsize(db_dest_path) / 1024, 2)
        results["backup1_db_snapshot"] = {
            "status": "SUCCESS",
            "file": db_dest_filename,
            "path": db_dest_path,
            "size_kb": db_size_kb,
        }
    except Exception as e:
        results["backup1_db_snapshot"] = {"status": "FAILED", "error": str(e)}
        results["status"] = "PARTIAL_SUCCESS"

    # --------------------------------------------------------------------------
    # Tier 2: Excel 5-Sheet Mirror Backup (.xlsx)
    # --------------------------------------------------------------------------
    try:
        # Force a fresh Excel sync first
        sync_excel_file()

        excel_dest_filename = f"Prakriti_Verified_Data_{timestamp}.xlsx"
        excel_dest_path = os.path.join(EXCEL_BACKUP_DIR, excel_dest_filename)

        shutil.copy2(EXCEL_FILE_PATH, excel_dest_path)
        excel_size_kb = round(os.path.getsize(excel_dest_path) / 1024, 2)

        results["backup2_excel_mirror"] = {
            "status": "SUCCESS",
            "file": excel_dest_filename,
            "path": excel_dest_path,
            "size_kb": excel_size_kb,
        }
    except Exception as e:
        results["backup2_excel_mirror"] = {"status": "FAILED", "error": str(e)}
        results["status"] = "PARTIAL_SUCCESS"

    # --------------------------------------------------------------------------
    # Tier 3: JSON Audit & State Dump Backup (.json)
    # --------------------------------------------------------------------------
    try:
        json_dest_filename = f"prakriti_audit_dump_{timestamp}.json"
        json_dest_path = os.path.join(JSON_BACKUP_DIR, json_dest_filename)

        dump_data: Dict[str, Any] = {
            "dump_timestamp": time_str,
            "system": "PrakritiAI Emergency Audit Dump",
            "participants": [],
            "questionnaire_responses": [],
            "expert_assessments": [],
            "prakriti_labels": [],
            "prakriti_tests": [],
            "change_history": [],
            "verification_log": [],
        }

        with get_connection() as conn:
            cursor = conn.cursor()

            for table in [
                "participants",
                "questionnaire_responses",
                "expert_assessments",
                "prakriti_labels",
                "prakriti_tests",
                "change_history",
                "verification_log",
            ]:
                try:
                    rows = cursor.execute(f"SELECT * FROM {table}").fetchall()
                    dump_data[table] = [dict(r) for r in rows]
                except Exception:
                    pass

        with open(json_dest_path, "w", encoding="utf-8") as f:
            json.dump(dump_data, f, indent=2, default=str)

        json_size_kb = round(os.path.getsize(json_dest_path) / 1024, 2)
        results["backup3_json_audit_dump"] = {
            "status": "SUCCESS",
            "file": json_dest_filename,
            "path": json_dest_path,
            "size_kb": json_size_kb,
            "total_records_dumped": sum(len(v) for k, v in dump_data.items() if isinstance(v, list)),
        }
    except Exception as e:
        results["backup3_json_audit_dump"] = {"status": "FAILED", "error": str(e)}
        results["status"] = "PARTIAL_SUCCESS"

    return results
