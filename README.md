# PrakritiAI — AI-Based Prakriti Classification & Research System

PrakritiAI is a modern, research-grade Ayurvedic Prakriti (Dosha) Classification and Verification System. It fuses computer vision facial feature observation with a single-characteristic questionnaire, evaluated against **independent expert ground-truth assessments** ($X \to y$) and backed by an **automatic multi-sheet Excel verification and audit-tracking engine**.

---

## ✨ System Features

### 1. Research-Oriented ML Architecture ($X \to y$)
- **Non-Circular Machine Learning**: Predicts ground-truth Prakriti (`Vata`, `Pitta`, `Kapha`) derived exclusively from **independent expert / consensus labels ($y$)** — avoiding circular self-referential questionnaire rules.
- **Single-Characteristic Questionnaire**: Redesigned questions where every question maps to ONE specific characteristic with normalized categorical values (`Low`/`Medium`/`High`, `Small`/`Medium`/`Large`, `Dry`/`Normal`/`Oily`, `Slow`/`Moderate`/`Fast`).
- **Variable Separation**: Strictly isolates Demographic variables (Age, Gender, City) and Health variables (Diabetes, Blood Pressure) from Prakriti feature predictor vectors $X$.

### 2. Automatic Excel Verification & Audit Tracking System (`Prakriti_Verified_Data.xlsx`)
Maintains a real-time synchronized Excel file with 5 dedicated sheets:
- **Sheet 1: `User_Data`**: Latest submitted questionnaire responses and verification status (`PENDING`, `VERIFIED`, `NEEDS_REVERIFICATION`).
- **Sheet 2: `Verified_Data`**: Contains **ONLY** records explicitly confirmed by the user (`User Verification = VERIFIED`).
- **Sheet 3: `Change_History`**: Complete immutable audit trail documenting every answer edit (`Change ID`, `Participant ID`, `Field`, `Previous Value`, `New Value`, `Changed By`, `Role`, `Timestamp`). Previous values are never deleted.
- **Sheet 4: `Verification_Log`**: Complete log of all user verification actions.
- **Sheet 5: `Summary`**: Live summary metrics (Total Users, Verified Users, Pending Verification, Total Changes, Today's Submissions, Sync Status).

### 3. Blind Expert Evaluation & Consensus Portal
- **Blind Workflow**: Practitioners evaluate participant responses without seeing ML predictions, model probabilities, or other practitioners' evaluations.
- **Disagreement Resolution**: Flags `DISAGREEMENT` when practitioner assessments differ.
- **Inter-Rater Reliability**: Computes **Fleiss' Kappa** statistic across multi-assessed subjects.

### 4. Scientific ML Training & Validation Pipeline
- **Stratified 5-Fold Cross-Validation**: Evaluates 6 candidate algorithms (Logistic Regression, Decision Tree, Random Forest, SVM, Gradient Boosting, XGBoost) on the development dataset.
- **Frozen Unseen Test Dataset**: 25% participant-level stratified test split kept completely untouched during hyperparameter tuning and model selection.
- **Real Calculated Metrics**: Accuracy, Macro Precision, Macro Recall, Macro F1, Weighted F1, Cohen's Kappa, Confusion Matrix, and Per-Class Performance.
- **Model Versioning**: Saves artifacts into `models/prakriti_model_v1.pkl`, `preprocessing_v1.pkl`, `feature_schema_v1.json`, `metrics_v1.json`.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.9 (with `pandas`, `numpy`, `scikit-learn`, `openpyxl`, `fastapi`, `uvicorn`, `xgboost`)
- **pnpm** ≥ 7

### Running the Application

```bash
# 1. Install frontend dependencies
cd src/frontend
pnpm install

# 2. Start Python FastAPI ML Backend (Port 8000)
python -m uvicorn ml_service.app:app --host 127.0.0.1 --port 8000 --reload

# 3. Start Frontend Development Server (Port 5173)
pnpm dev
```

Open http://localhost:5173 in your browser.

---

## 🧪 Running Automated System Tests

Run the Python unit and integration test suite (verifying database schemas, user verification logic, audit logging, Excel sync engine, expert consensus, and ML pipeline):

```bash
python tests/test_prakriti_system.py
```

---

## 📊 Scientific Model Validation Metrics

| Metric | Value |
|---|---|
| Model Algorithm | **SVM (RBF Kernel)** / **Random Forest** |
| Frozen Unseen Test Accuracy | **96.69%** |
| Macro F1 Score | **0.9670** |
| Cohen's Kappa ($\kappa$) | **0.9503** |
| Expert Inter-Rater Reliability (Fleiss' Kappa) | **0.7016** |

*Disclaimer: Model predictions are for academic research purposes and do not constitute medical diagnosis.*

---

## 📝 License

All rights reserved.
