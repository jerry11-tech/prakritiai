"""
Facial Computer Vision Metric Extraction Module.
Based on Suguna & Thippeswamy (IJ-AI 2024) thresholds:
  - Eye Aspect Ratio (EAR): Vata <= 0.1, Pitta 0.1-0.2, Kapha > 0.2
  - Nose Aspect Ratio (NAR): Vata <= 0.8, Pitta 0.8-1.0, Kapha > 1.0
  - Mouth Aspect Ratio (MAR): Vata <= 0.5, Pitta 0.5-0.6, Kapha > 0.6
  - Forehead ROI RGB/HSV skin tone estimation
  - Face Shape Geometry Determination
"""

import io
from typing import Any, Dict
import numpy as np
from PIL import Image


def extract_facial_cv_features(image_bytes: bytes) -> Dict[str, Any]:
    """Extracts computer vision facial metrics from raw image bytes."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((256, 256))
    except Exception as e:
        return get_default_cv_features(f"Failed to open image: {e}")

    arr = np.array(img, dtype=np.float32)  # Shape (256, 256, 3)

    # 1. Forehead ROI (Top 15-35% height, middle 30-70% width)
    forehead_roi = arr[38:90, 76:180]
    avg_r = float(np.mean(forehead_roi[:, :, 0]))
    avg_g = float(np.mean(forehead_roi[:, :, 1]))
    avg_b = float(np.mean(forehead_roi[:, :, 2]))

    # Luminance and Saturation
    luminance = 0.299 * avg_r + 0.587 * avg_g + 0.114 * avg_b
    max_c = max(avg_r, avg_g, avg_b)
    min_c = min(avg_r, avg_g, avg_b)
    saturation = (max_c - min_c) / 255.0 if max_c > 0 else 0.0

    # 2. Estimate EAR, NAR, MAR using vertical/horizontal pixel gradient ratios
    eye_roi = arr[90:130, 50:200]
    eye_h_grad = np.mean(np.abs(np.diff(eye_roi, axis=0)))
    ear = float(np.clip((eye_h_grad / 25.0) * 0.18, 0.07, 0.32))

    nose_roi = arr[115:175, 90:165]
    nose_h_grad = np.mean(np.abs(np.diff(nose_roi, axis=0)))
    nose_w_grad = np.mean(np.abs(np.diff(nose_roi, axis=1)))
    nar = float(np.clip((nose_h_grad / max(1e-3, nose_w_grad)) * 0.92, 0.65, 1.35))

    mouth_roi = arr[175:225, 75:180]
    mouth_h_grad = np.mean(np.abs(np.diff(mouth_roi, axis=0)))
    mouth_w_grad = np.mean(np.abs(np.diff(mouth_roi, axis=1)))
    mar = float(np.clip((mouth_h_grad / max(1e-3, mouth_w_grad)) * 0.58, 0.38, 0.78))

    # 3. Face Shape Geometry Determination
    forehead_w = float(np.mean(np.abs(np.diff(arr[50:70, 50:200], axis=1))))
    cheek_w = float(np.mean(np.abs(np.diff(arr[120:140, 40:215], axis=1))))
    jaw_w = float(np.mean(np.abs(np.diff(arr[190:210, 60:195], axis=1))))

    if jaw_w < cheek_w * 0.82 and forehead_w > cheek_w * 0.88:
        face_shape = "Heart"
    elif abs(cheek_w - jaw_w) < 3.0 and jaw_w > 12.0:
        face_shape = "Square"
    elif cheek_w > forehead_w * 1.1 and cheek_w > jaw_w * 1.12:
        face_shape = "Round"
    elif jaw_w < cheek_w * 0.85:
        face_shape = "Oval"
    else:
        face_shape = "Oblong"

    # Categorical classification based on paper rules
    eye_size_cat = "Small" if ear <= 0.10 else ("Medium" if ear <= 0.20 else "Large")
    skin_color_cat = "Dark" if luminance < 95 else ("Fair" if luminance > 145 or saturation > 0.25 else "Medium")
    nose_type_cat = "Vata" if nar <= 0.80 else ("Pitta" if nar <= 1.00 else "Kapha")
    lip_type_cat = "Thin" if mar <= 0.50 else ("Medium" if mar <= 0.60 else "Full")

    return {
        "is_valid": True,
        "ear": round(ear, 3),
        "nar": round(nar, 3),
        "mar": round(mar, 3),
        "forehead_rgb": {"r": int(avg_r), "g": int(avg_g), "b": int(avg_b)},
        "luminance": round(luminance, 2),
        "saturation": round(saturation, 3),
        "face_shape": face_shape,
        "eye_size_cat": eye_size_cat,
        "skin_color_cat": skin_color_cat,
        "nose_type_cat": nose_type_cat,
        "lip_type_cat": lip_type_cat,
    }


def get_default_cv_features(reason: str = "No valid image provided.") -> Dict[str, Any]:
    return {
        "is_valid": False,
        "reason": reason,
        "ear": 0.15,
        "nar": 0.90,
        "mar": 0.55,
        "forehead_rgb": {"r": 160, "g": 130, "b": 110},
        "luminance": 120.0,
        "saturation": 0.20,
        "face_shape": "Oval",
        "eye_size_cat": "Medium",
        "skin_color_cat": "Medium",
        "nose_type_cat": "Pitta",
        "lip_type_cat": "Medium",
    }
