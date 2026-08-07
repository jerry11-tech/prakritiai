# PrakritiAI — Smart Ayurvedic Analysis System

PrakritiAI is a modern, AI-assisted Ayurvedic constitution (Dosha) analysis platform. Users upload a frontal photo, answer a 12-question lifestyle questionnaire, and receive a personalized Vata–Pitta–Kapha report with Ayurvedic diet and lifestyle recommendations.

## ✨ Features

- **Facial input upload** — frontal photo capture with client-side preview
- **12-question Dosha questionnaire** — paginated, with progress tracking
- **Hybrid scoring engine** — questionnaire-based Dosha classification with simulated facial-condition analysis
- **Interactive results panel** — animated Dosha bars, facial condition breakdown, and Ayurvedic recommendations
- **Analysis history** — past results persist in `localStorage` (last 20), with per-item delete and clear-all
- **Fully responsive** — Tailwind CSS design system with Radix UI primitives
- **No backend required** — runs entirely in the browser; works offline after build

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 (tested on v20 / v24)
- **pnpm** ≥ 7

```bash
# 1. Install pnpm if you don't have it
npm install -g pnpm

# 2. Install dependencies
pnpm install

# 3. Start the development server
cd src/frontend
pnpm dev
```

Open http://localhost:5173 in your browser.

### Production build & preview

```bash
cd src/frontend
pnpm build          # outputs to dist/
pnpm start          # serve production build at http://localhost:4173
```

## 🧩 Project Structure

```
src/
├── backend/            # (Optional) Internet Computer canister sources
│   ├── main.mo
│   ├── lib/
│   └── mixins/
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── sections/     # Hero, Demo, Features, HowItWorks, etc.
    │   │   └── ui/           # shadcn-style UI + DoshaBar, QuestionCard, ResultsPanel
    │   ├── data/             # questionnaire & recommendations data
    │   ├── hooks/            # useQuestionnaire, useAnalysis, useInView
    │   ├── types/            # shared TypeScript types
    │   └── utils/            # facial analysis simulation
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔬 How the Dosha Scoring Works

1. Each questionnaire answer maps to one of the three Doshas (`Vata`, `Pitta`, `Kapha`).
2. Facial feature analysis derives 8 Ayurvedic observations from the uploaded image seed.
3. The observations are scored by a trained neural network (`DoshaNet`, pure TypeScript) and fused with the questionnaire tally (65% questionnaire / 35% facial model).
4. The dominant Dosha drives the recommendations shown in the results panel.

## 🧠 ML Model Training & Accuracy Testing

The facial-condition classifier is trained from an Ayurvedic dataset (4000–8000 labeled samples with single-dosha and dual-dosha constitution types). Everything runs locally — no external ML service required.

```bash
# Train the model and save weights to src/ml/weights.json
pnpm train            # default (4000 samples)
pnpm train:big        # 8000 samples, 120 epochs

# Evaluate against several INDEPENDENT face populations and print accuracy
pnpm test:faces       # 1000 faces x 6 seeds = 6000 test faces
```

**Current measured results (aggregate over 6,000 held-out test faces):**

| Metric | Value |
|---|---|
| Overall accuracy | **77.3%** |
| Vata (per-class) | 82.8% |
| Pitta (per-class) | 69.1% |
| Kapha (per-class) | 79.5% |
| StdDev across populations | 1.5% |

Outputs a full report: confusion matrix, per-class precision/recall/F1, plus single-face round-trip inferences. The saved `weights.json` is bundled into the app at build time so the Demo runs the same model you trained.

## 🌐 Deployment

The frontend is a static Vite build and can be deployed to any static host:

```bash
cd src/frontend
pnpm build
# Upload dist/ to Vercel, Netlify, GitHub Pages, or any CDN
```

## 📝 License

All rights reserved.
