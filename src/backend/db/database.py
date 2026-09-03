"""
Database layer for PrakritiAI Research & Verification System.
Uses SQLite for persistent storage.
"""

import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

DB_PATH = os.path.join(os.path.dirname(__file__), "prakriti.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Creates tables if they do not exist."""
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Participants
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS participants (
                participant_id TEXT PRIMARY KEY,
                name TEXT DEFAULT 'Anonymous',
                age_group TEXT,
                gender TEXT,
                city TEXT,
                diabetes TEXT,
                blood_pressure TEXT,
                created_at TEXT,
                user_verified INTEGER DEFAULT 0,
                verification_status TEXT DEFAULT 'PENDING',
                verification_date TEXT
            )
        """)

        # 2. Questionnaire Responses (normalized key-value per participant)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS questionnaire_responses (
                participant_id TEXT,
                feature_key TEXT,
                feature_value TEXT,
                dosha_category TEXT,
                updated_at TEXT,
                PRIMARY KEY (participant_id, feature_key),
                FOREIGN KEY (participant_id) REFERENCES participants (participant_id)
            )
        """)

        # 3. Expert Assessments (independent blind evaluations)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS expert_assessments (
                assessment_id TEXT PRIMARY KEY,
                participant_id TEXT,
                expert_id TEXT,
                expert_name TEXT,
                primary_prakriti TEXT,
                secondary_prakriti TEXT,
                confidence REAL,
                assessment_method TEXT,
                notes TEXT,
                assessment_date TEXT,
                FOREIGN KEY (participant_id) REFERENCES participants (participant_id)
            )
        """)

        # 4. Consensus Prakriti Labels
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prakriti_labels (
                participant_id TEXT PRIMARY KEY,
                consensus_prakriti TEXT,
                label_status TEXT DEFAULT 'UNLABELED',
                expert_count INTEGER DEFAULT 0,
                agreed_count INTEGER DEFAULT 0,
                updated_at TEXT,
                FOREIGN KEY (participant_id) REFERENCES participants (participant_id)
            )
        """)

        # 5. Change History (Complete Audit Log)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS change_history (
                change_id TEXT PRIMARY KEY,
                participant_id TEXT,
                changed_at TEXT,
                changed_by TEXT,
                user_role TEXT,
                field_name TEXT,
                previous_value TEXT,
                new_value TEXT,
                change_type TEXT,
                reason TEXT,
                verification_status TEXT,
                FOREIGN KEY (participant_id) REFERENCES participants (participant_id)
            )
        """)

        # 6. Verification Log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS verification_log (
                verification_id TEXT PRIMARY KEY,
                participant_id TEXT,
                verification_date TEXT,
                status TEXT,
                verified_by TEXT,
                number_of_answers INTEGER,
                answers_changed_before_verification INTEGER,
                verification_method TEXT,
                FOREIGN KEY (participant_id) REFERENCES participants (participant_id)
            )
        """)

        # 7. Excel Sync Log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS excel_sync_log (
                sync_id TEXT PRIMARY KEY,
                sync_time TEXT,
                status TEXT,
                message TEXT,
                records_synced INTEGER
            )
        """)

        # 8. Application users (supports 3 roles: ADMIN, EXPERT, USER)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'USER',
                is_active INTEGER NOT NULL DEFAULT 1,
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                locked_until TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        """)

        # Add missing columns if users table already existed without them
        user_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(users)").fetchall()]
        if "role" not in user_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER'")
        if "is_active" not in user_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1")
        if "failed_attempts" not in user_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0")
        if "locked_until" not in user_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN locked_until TEXT")
        if "updated_at" not in user_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN updated_at TEXT")

        # 9. Experts (specialized Ayurvedic practitioners linked to user)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS experts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                specialization TEXT NOT NULL,
                professional_details TEXT,
                approval_status TEXT DEFAULT 'PENDING',
                approved_by INTEGER,
                approved_at TEXT,
                created_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        expert_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(experts)").fetchall()]
        if "user_id" not in expert_cols:
            cursor.execute("ALTER TABLE experts ADD COLUMN user_id INTEGER")
        if "approved_by" not in expert_cols:
            cursor.execute("ALTER TABLE experts ADD COLUMN approved_by INTEGER")
        if "approved_at" not in expert_cols:
            cursor.execute("ALTER TABLE experts ADD COLUMN approved_at TEXT")

        # 10. System Audit Logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                user_email TEXT,
                user_role TEXT,
                action TEXT NOT NULL,
                resource TEXT NOT NULL,
                resource_id TEXT,
                ip_address TEXT,
                status TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL
            )
        """)

        # 10. Prakriti tests (analysis results for end-users)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prakriti_tests (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                image_url TEXT,
                image_reference TEXT,
                vata_score REAL,
                pitta_score REAL,
                kapha_score REAL,
                dominant_dosha TEXT,
                ai_confidence REAL,
                facial_analysis_status TEXT DEFAULT 'NOT_PROVIDED',
                facial_observations TEXT,
                created_at TEXT,
                completed_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        # 11. Question answers per test
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS question_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id TEXT,
                question_id TEXT,
                question_text TEXT,
                answer TEXT,
                FOREIGN KEY (test_id) REFERENCES prakriti_tests (id)
            )
        """)

        # 12. Expert reviews / verifications
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS expert_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id TEXT,
                expert_id INTEGER,
                expert_specialization TEXT,
                ai_result TEXT,
                ai_confidence REAL,
                status TEXT DEFAULT 'PENDING',
                expert_decision TEXT,
                expert_notes TEXT,
                verified_at TEXT,
                created_at TEXT,
                FOREIGN KEY (test_id) REFERENCES prakriti_tests (id),
                FOREIGN KEY (expert_id) REFERENCES experts (id)
            )
        """)

        # Unique review per (test, specialization) so upserts are predictable
        cursor.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_expert_reviews_unique
            ON expert_reviews (test_id, expert_specialization)
        """)

        conn.commit()


# Initialize database schemas
init_db()
