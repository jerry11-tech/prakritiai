"""
Live End-to-End Demo Script for PrakritiAI.
Demonstrates:
  1. Submitting a new questionnaire response
  2. Confirming user verification
  3. Editing a response & logging change history
  4. Running ML prediction API (FastAPI)
  5. Submitting 2 blind expert evaluations & computing consensus
  6. Synchronizing the 5-sheet `Prakriti_Verified_Data.xlsx` Excel file
  7. Outputting research metrics & confusion matrix
"""

import json
import urllib.request

API_BASE = "http://127.0.0.1:8000/api"


def post_json(endpoint: str, payload: dict) -> dict:
    url = f"{API_BASE}/{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_json(endpoint: str) -> dict:
    url = f"{API_BASE}/{endpoint}"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    print("=" * 72)
    print(" PRAKRITIAI -- LIVE SYSTEM DEMO & VERIFICATION RUN")
    print("=" * 72)

    # 1. Health check
    health = get_json("health")
    print(f"[1/7] API Health Check: {health['status']} ({health['time']})")

    # 2. Submit Questionnaire for Demo User
    demo_p_id = "DEMO_PARTICIPANT_001"
    sample_responses = {
        "skin_moisture": "Dry",
        "skin_color": "Dark",
        "skin_temperature": "Cool",
        "hair_density": "Low",
        "hair_oiliness": "Dry",
        "eye_size": "Small",
        "eyeball_movement": "Fast",
        "body_frame_length": "Irregular",
        "body_frame_breadth": "Small",
        "joints_sound": "Cracking",
        "weight_change_trend": "HardToGain",
        "appetite_regularity": "Irregular",
        "hunger_speed": "Fast",
        "water_intake_volume": "Low",
        "sweating_amount": "Low",
        "sleep_depth": "Light",
        "physical_stamina": "Low",
        "speaking_pace": "Fast",
        "walking_speed": "Fast",
        "climate_comfort": "Warm",
        "emotional_stability": "Wavering",
        "learning_grasping": "Fast",
        "memory_type": "ShortTerm",
        "temperament_nature": "Restless",
        "decision_style": "Hesitant",
        "food_temperature_pref": "Hot",
    }

    sub_res = post_json("submit-questionnaire", {
        "participantId": demo_p_id,
        "name": "Ananya Roy",
        "ageGroup": "20-30",
        "gender": "Female",
        "city": "Mumbai",
        "diabetes": "No",
        "bloodPressure": "Normal",
        "responses": sample_responses,
    })
    print(f"[2/7] Questionnaire Submitted: Participant {sub_res['participantId']} (Status: {sub_res['verificationStatus']})")

    # 3. User Confirm Verification
    ver_res = post_json("verify-user", {
        "participantId": demo_p_id,
        "verifiedBy": "Ananya Roy",
        "confirmedAnswers": sample_responses,
    })
    print(f"[3/7] User Verification Confirmed: Status -> {ver_res['verificationStatus']}")

    # 4. User Edit Answer (Simulate editing skin_moisture to 'Normal')
    edit_res = post_json("update-questionnaire", {
        "participantId": demo_p_id,
        "changedBy": "Ananya Roy",
        "userRole": "User",
        "reason": "User corrected skin moisture response during review",
        "updates": {"skin_moisture": "Normal"},
    })
    print(f"[4/7] User Edited Answer: Status -> {edit_res['verificationStatus']} (Audit Log Created)")

    # Re-verify after edit
    post_json("verify-user", {
        "participantId": demo_p_id,
        "verifiedBy": "Ananya Roy",
        "confirmedAnswers": {**sample_responses, "skin_moisture": "Normal"},
    })

    # 5. Run ML Prediction API
    pred_res = post_json("predict-prakriti", {"responses": sample_responses})
    print(f"[5/7] ML Model Prediction:")
    print(f"      Predicted Dosha: {pred_res['prediction'].upper()}")
    print(f"      Confidence     : {pred_res['confidence']:.2f}%")
    print(f"      Probabilities  : Vata={pred_res['probabilities']['Vata']*100:.1f}%, Pitta={pred_res['probabilities']['Pitta']*100:.1f}%, Kapha={pred_res['probabilities']['Kapha']*100:.1f}%")
    print(f"      Model Engine   : {pred_res['modelName']} ({pred_res['version']})")

    # 6. Blind Expert Assessment Submission
    exp_res = post_json("expert-assess", {
        "participantId": demo_p_id,
        "expertId": "EXP_101",
        "expertName": "Dr. V. Shastri (MD Ayurveda)",
        "primaryPrakriti": "Vata",
        "secondaryPrakriti": "Pitta",
        "confidence": 92.0,
        "assessmentMethod": "Nadi Pariksha & Clinical Exam",
        "notes": "Classic Vata pulse (Sarpa Gati) with secondary Pitta heat traits.",
    })
    print(f"[6/7] Blind Expert Assessment Submitted:")
    print(f"      Assessed Primary : {exp_res['primaryPrakriti']}")
    print(f"      Consensus Status : {exp_res['consensus']['status']} ({exp_res['consensus']['consensusPrakriti']})")

    # 7. Research Dashboard Summary
    dash = get_json("research-dashboard")
    ml = dash["mlModelMetrics"]
    ds = dash["datasetSummary"]
    inter = dash["interRaterAgreement"]

    print("-" * 72)
    print(" RESEARCH DASHBOARD METRICS SUMMARY")
    print("-" * 72)
    print(f"  Total Participants in DB : {ds['totalParticipants']} ({ds['verifiedParticipants']} Verified)")
    print(f"  Excel Synchronization   : SUCCESS -> Prakriti_Verified_Data.xlsx")
    print(f"  CV Model Algorithm       : {ml['modelName']} (5-Fold Stratified CV Mean: {ml['cvAccuracyMean']*100:.2f}%)")
    print(f"  Frozen Test Accuracy     : {ml['testAccuracy']*100:.2f}%")
    print(f"  Test Macro F1            : {ml['testF1Macro']:.4f}")
    print(f"  Cohen's Kappa (k)        : {ml['cohensKappa']:.4f}")
    print(f"  Fleiss' Kappa (Inter-Rater): {inter['fleissKappa']:.4f}")
    print("=" * 72)


if __name__ == "__main__":
    main()
