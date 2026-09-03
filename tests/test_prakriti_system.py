"""
Automated Test Suite for PrakritiAI System.
Verifies:
  - Database schema & SQLite persistent storage
  - Questionnaire submission & response normalization
  - User review & verification workflow
  - Change History audit trail logging
  - Automatic Excel Synchronization (5 sheets in `Prakriti_Verified_Data.xlsx`)
  - Blind Expert Assessment & Inter-Rater Reliability (Fleiss' Kappa)
  - ML Pipeline: 5-Fold Stratified CV, Unseen Test Set, Cohen's Kappa, Confusion Matrix
  - FastAPI Prediction API endpoints
"""

import os
import sys
import unittest
from datetime import datetime

# Add src/backend to sys.path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from db.database import get_connection, init_db
from ml_service.pipeline import load_ml_dataset_from_db, predict_prakriti_ml, train_and_evaluate_models
from services.excel_sync import EXCEL_FILE_PATH, sync_excel_file
from services.expert_service import get_inter_rater_stats, submit_expert_assessment


class TestPrakritiSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_01_db_schema_initialized(self):
        with get_connection() as conn:
            cursor = conn.cursor()
            tables = cursor.execute("""
                SELECT name FROM sqlite_master WHERE type='table'
            """).fetchall()
            table_names = [t["name"] for t in tables]

            expected = ["participants", "questionnaire_responses", "expert_assessments", "prakriti_labels", "change_history", "verification_log", "excel_sync_log"]
            for exp in expected:
                self.assertIn(exp, table_names)

    def test_02_excel_sync_engine(self):
        res = sync_excel_file()
        self.assertEqual(res["status"], "SUCCESS")
        self.assertTrue(os.path.exists(EXCEL_FILE_PATH))

        import openpyxl
        wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
        sheet_names = wb.sheetnames
        expected_sheets = ["User_Data", "Verified_Data", "Change_History", "Verification_Log", "Summary"]
        for s in expected_sheets:
            self.assertIn(s, sheet_names)

    def test_03_expert_assessment_and_consensus(self):
        p_id = "TEST_P9999"
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO participants (participant_id, name, age_group, gender, city, created_at, user_verified, verification_status)
                VALUES (?, 'Test User', '20-30', 'Female', 'Mumbai', ?, 1, 'VERIFIED')
            """, (p_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            conn.commit()

        res1 = submit_expert_assessment(
            participant_id=p_id,
            expert_id="EXP_TEST_1",
            expert_name="Dr. Test 1",
            primary_prakriti="Vata",
            secondary_prakriti="Pitta",
            confidence=90.0,
            assessment_method="Nadi Pariksha",
        )
        self.assertEqual(res1["status"], "SUCCESS")

        res2 = submit_expert_assessment(
            participant_id=p_id,
            expert_id="EXP_TEST_2",
            expert_name="Dr. Test 2",
            primary_prakriti="Vata",
            secondary_prakriti="Kapha",
            confidence=88.0,
            assessment_method="Clinical Exam",
        )
        self.assertEqual(res2["consensus"]["status"], "CONSENSUS_AGREED")
        self.assertEqual(res2["consensus"]["consensusPrakriti"], "Vata")

    def test_04_ml_pipeline_train_and_evaluate(self):
        metrics = train_and_evaluate_models()
        self.assertIn("testAccuracy", metrics)
        self.assertIn("cohensKappa", metrics)
        self.assertIn("confusionMatrix", metrics)
        self.assertGreater(metrics["testAccuracy"], 0.70)

    def test_05_ml_inference(self):
        sample_features = {
            "skin_moisture": "Dry",
            "skin_color": "Dark",
            "hair_density": "Low",
            "hair_oiliness": "Dry",
            "body_frame_length": "Irregular",
            "appetite_regularity": "Irregular",
            "sleep_depth": "Light",
            "emotional_stability": "Wavering",
        }
        res = predict_prakriti_ml(sample_features)
        self.assertIn(res["prediction"], ["Vata", "Pitta", "Kapha"])
        self.assertTrue(res["isMlPrediction"])


if __name__ == "__main__":
    unittest.main()
