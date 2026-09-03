"""
Prakriti Analysis Service.

KEY VALIDATION RULE:
  Facial observations are ONLY produced when a real image was uploaded and
  successfully validated. If no image is present, facial_analysis_status is
  set to NOT_PROVIDED and NO facial observations are generated — the analysis
  is purely questionnaire/ML-driven and never simulates facial evidence.
"""

import base64
import io as _io
import os
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from PIL import Image

from ml_service.facial_cv import extract_facial_cv_features, get_default_cv_features
from ml_service.pipeline import predict_prakriti_ml
from db.database import get_connection

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

VALID_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB Max File Size Limit


def _validate_and_save_image(raw_bytes: bytes, image_reference: str) -> str:
    """Validates that the upload is a real image and persists it. Raises on failure."""
    if not raw_bytes:
        raise ValueError("Facial analysis requires a photo.")

    if len(raw_bytes) > MAX_UPLOAD_BYTES:
        raise ValueError("Image file size exceeds maximum limit of 5MB.")

    try:
        img = Image.open(_io.BytesIO(raw_bytes))
        img.verify()
    except Exception:
        raise ValueError("Please upload a valid facial image.")

    img = Image.open(_io.BytesIO(raw_bytes)).convert("RGB")

    if min(img.size) < 64:
        raise ValueError("Image is too small. Please upload a clear facial photo.")

    ext = ".jpg"
    if image_reference:
        _, ext = os.path.splitext(image_reference)
    if ext.lower() not in VALID_IMAGE_EXTS:
        ext = ".jpg"

    img = img.resize((256, 256))
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    img.save(filepath, quality=88)

    return filename


def analyze_prakriti(
    answers: Dict[str, str],
    image_base64: Optional[str] = None,
    image_reference: Optional[str] = None,
    user_id: Optional[int] = None,
) -> Dict[str, Any]:
    facial_analysis_status = "NOT_PROVIDED"
    facial_observations: List[Dict[str, str]] = []
    stored_filename: Optional[str] = None
    image_url: Optional[str] = None
    cv_features = get_default_cv_features("No photo provided.")

    if image_base64:
        try:
            raw = base64.b64decode(image_base64.split(",")[-1])
            stored_filename = _validate_and_save_image(raw, image_reference or "")
            image_url = f"/uploads/{stored_filename}"

            cv_features = extract_facial_cv_features(raw)

            if cv_features["is_valid"]:
                facial_observations = [
                    {"category": "Eye Aspect Ratio (EAR)", "observation": f"{cv_features['ear']} ({cv_features['eye_size_cat']} eyes)"},
                    {"category": "Nose Aspect Ratio (NAR)", "observation": f"{cv_features['nar']} ({cv_features['nose_type_cat']} profile)"},
                    {"category": "Mouth Aspect Ratio (MAR)", "observation": f"{cv_features['mar']} ({cv_features['lip_type_cat']} lips)"},
                    {"category": "Skin Luminance", "observation": f"{cv_features['luminance']} ({cv_features['skin_color_cat']})"},
                    {"category": "Face Shape Geometry", "observation": cv_features["face_shape"]},
                ]
                facial_analysis_status = "COMPLETED"
        except ValueError as e:
            raise ValueError(str(e))

    # Run ML prediction with 3-Model Benchmark Architecture (Questionnaire + Vision + Fusion)
    ml_result = predict_prakriti_ml(answers, cv_features)

    dominant = ml_result["prediction"]
    category = ml_result.get("constitutionCategory", "Ekadoshaja (Single)")
    probs = ml_result["probabilities"]

    vata_score = probs.get("Vata", 0.0) * 100
    pitta_score = probs.get("Pitta", 0.0) * 100
    kapha_score = probs.get("Kapha", 0.0) * 100
    ai_confidence = ml_result.get("confidence", max(probs.values(), default=0) * 100)

    test_id = f"T{int(datetime.now().timestamp() * 1000)}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Save to SQLite DB
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO prakriti_tests
               (id, user_id, image_url, image_reference, vata_score, pitta_score, kapha_score,
                dominant_dosha, ai_confidence, facial_analysis_status, facial_observations, created_at, completed_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                test_id, user_id, image_url, stored_filename,
                vata_score, pitta_score, kapha_score,
                dominant, ai_confidence, facial_analysis_status,
                ", ".join(f"{o['category']}: {o['observation']}" for o in facial_observations) if facial_observations else None,
                now_str, now_str,
            ),
        )

        for q_id, answer in answers.items():
            cursor.execute(
                """INSERT INTO question_answers (test_id, question_id, question_text, answer)
                   VALUES (?, ?, ?, ?)""",
                (test_id, q_id, q_id, answer),
            )

        # Pending review for expert dashboard (specialization mapped to primary dosha name e.g. Vata)
        spec_mapped = "Vata" if "Vata" in dominant else ("Pitta" if "Pitta" in dominant else "Kapha")
        cursor.execute(
            """INSERT INTO expert_reviews (test_id, expert_specialization, ai_result, ai_confidence, status, created_at)
               VALUES (?, ?, ?, ?, 'PENDING', ?)""",
            (test_id, spec_mapped, dominant, ai_confidence, now_str),
        )

        conn.commit()

    return {
        "test_id": test_id,
        "dominant_dosha": dominant,
        "constitution_category": category,
        "secondary_dosha": ml_result.get("secondaryDosha"),
        "scores": {"Vata": round(vata_score, 1), "Pitta": round(pitta_score, 1), "Kapha": round(kapha_score, 1)},
        "ai_confidence": round(ai_confidence, 1),
        "facial_analysis_status": facial_analysis_status,
        "facial_observations": facial_observations,
        "cv_metrics": cv_features,
        "image_url": image_url,
        "model": ml_result.get("modelName", "StackingEnsemble"),
        # 3-Model Benchmark Architecture
        "questionnaire_prediction": ml_result.get("questionnairePrediction"),
        "vision_prediction": ml_result.get("visionPrediction"),
        "fusion_prediction": ml_result.get("fusionPrediction"),
        "multimodal_agreement": ml_result.get("multimodalAgreement", True),
        "low_agreement_warning": ml_result.get("lowAgreementWarning"),
        "explanation_features": ml_result.get("explanationFeatures", []),
        "requires_image_message": (
            None
            if facial_analysis_status == "COMPLETED"
            else "Upload a facial photo to enable computer vision aspect ratio analysis."
        ),
    }


def get_user_test(test_id: str, user_id: int) -> Dict[str, Any]:
    """Returns a single test owned by the given user."""
    with get_connection() as conn:
        cursor = conn.cursor()
        row = cursor.execute(
            "SELECT * FROM prakriti_tests WHERE id = ? AND (user_id = ? OR user_id IS NULL)",
            (test_id, user_id),
        ).fetchone()
        if not row:
            raise PermissionError("Test not found.")

    facial_obs = []
    if row["facial_observations"]:
        for item in row["facial_observations"].split(", "):
            if ": " in item:
                k, v = item.split(": ", 1)
                facial_obs.append({"category": k, "observation": v})

    return {
        "test_id": row["id"],
        "image_url": row["image_url"],
        "scores": {"Vata": round(row["vata_score"], 1), "Pitta": round(row["pitta_score"], 1), "Kapha": round(row["kapha_score"], 1)},
        "dominant_dosha": row["dominant_dosha"],
        "ai_confidence": row["ai_confidence"],
        "facial_analysis_status": row["facial_analysis_status"],
        "facial_observations": facial_obs,
        "created_at": row["created_at"],
    }


def list_user_tests(user_id: int) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            "SELECT * FROM prakriti_tests WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
    return [
        {
            "test_id": r["id"],
            "dominant_dosha": r["dominant_dosha"],
            "vata_score": r["vata_score"],
            "pitta_score": r["pitta_score"],
            "kapha_score": r["kapha_score"],
            "ai_confidence": r["ai_confidence"],
            "facial_analysis_status": r["facial_analysis_status"],
            "created_at": r["created_at"],
        }
        for r in rows
    ]
