# RakshaDoc — Indic Document AI & Braille Accessibility Platform

**RakshaDoc** is an end-to-end research and production-grade Deep Learning framework designed for **Document Layout Parsing, OCR Extraction, and Braille Accessibility** of low-quality, noisy, blurred, skewed, and ink-faded Indic documents.

---

## 🌟 Key Features

### 🧠 Deep Learning & Document AI Engine
- **Quality Enhancement Pipeline:** Automated denoising (`FastNlMeans`), CLAHE contrast enhancement, deskew angle correction, and quality score estimation.
- **Multi-Class Layout Segmentation:** Detects bounding boxes and labels for:
  - `Title`, `Header`, `Footer`, `Paragraph`, `List`
  - `Table`, `Figure / Image`
  - `Signature`, `Official Stamp / Seal`, `Logo`
- **Indic OCR Engine:** Multi-script OCR support for Devanagari/Hindi, Marathi, Tamil, Telugu, and English.

### ♿ Braille & Screen Reader Accessibility (For Blind Users)
- **Grade 1 & Grade 2 Braille Conversion:** Translates extracted text into Unicode Braille patterns ($\text{\u2800} - \text{\u28FF}$) and ASCII Braille.
- **Braille Ready Format (`.BRF`) Export:** Downloadable `.brf` files compatible with Refreshable Braille Displays (Freedom Scientific, Orbit, HumanWare) and Braille embossers.
- **Audio Screen Reader (Text-to-Speech):** Synthesizes natural multi-speaker audio speech reading layout elements in top-to-bottom reading order. Downloadable as `.mp3`.
- **Accessibility UI:** High-contrast color mode toggle, screen reader voice integration, and responsive layout.

### 🔐 User & Admin Portal
- **JWT Authentication & Security:** Role-Based Access Control (`User` and `Admin`).
- **Interactive Workspace:** Drag-and-drop uploader, color-coded canvas overlay with clickable bounding boxes, OCR text inspector, and Braille viewer.
- **Admin Dashboard:** Real-time metrics, user management, layout taxonomy distribution, and audit activity logs.

### 📦 Multi-Format Exporters
- Download Layout JSON (`.json`)
- Download Word Document (`.docx`)
- Download Searchable PDF (`.pdf`)
- Download Braille File (`.brf`)
- Download Speech Audio (`.mp3`)

---

## 🛠️ Architecture & Tech Stack

- **Backend:** FastAPI (Python 3.9+), SQLAlchemy, SQLite, PyTorch, OpenCV, gTTS, python-docx, ReportLab.
- **Frontend:** React, Vite, TailwindCSS, Lucide Icons, Axios.

---

## 🚀 Quick Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
python run.py
```
Backend server starts at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Dashboard runs at: `http://localhost:3000`

---

## 🔑 Demo Credentials

- **Admin Account:** `admin@rakshadoc.ai` / `Admin@12345`
- **User Account:** Register any new user or sign up via the app.
