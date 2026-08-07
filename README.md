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
2. Scores are tallied and normalized to percentages that always sum to exactly 100 (largest-remainder method).
3. Facial feature analysis (face shape, dark circles, puffiness, skin tone) is simulated deterministically from an image seed for a consistent per-image result.
4. The dominant Dosha drives the recommendations shown in the results panel.

## 🌐 Deployment

The frontend is a static Vite build and can be deployed to any static host:

```bash
cd src/frontend
pnpm build
# Upload dist/ to Vercel, Netlify, GitHub Pages, or any CDN
```

## 📝 License

All rights reserved.
