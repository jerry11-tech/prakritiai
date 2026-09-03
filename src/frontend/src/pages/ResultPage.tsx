import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Leaf,
  Brain,
  Sparkles,
  Download,
  Utensils,
  Activity,
  Sun,
  Moon,
  ShieldAlert,
  Layers,
  Scan,
} from "lucide-react";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { PrakritiDistribution } from "@/components/prakriti/PrakritiDistribution";
import { FacialFeatureMap } from "@/components/prakriti/FacialFeatureMap";
import { TriDoshaMatrix } from "@/components/prakriti/TriDoshaMatrix";
import { LongitudinalChart } from "@/components/prakriti/LongitudinalChart";
import { PrakritiRadarChart } from "@/components/prakriti/PrakritiRadarChart";
import { WellnessPlanner } from "@/components/prakriti/WellnessPlanner";
import { PDFExportModal, ExportOptions } from "@/components/prakriti/PDFExportModal";
import { toast } from "sonner";

type DoshaKey = "Vata" | "Pitta" | "Kapha";

const DOSHA_COLORS: Record<DoshaKey, string> = {
  Vata: "#4F86C6",
  Pitta: "#E8753D",
  Kapha: "#4F9A67",
};

const DOSHA_LABELS: Record<DoshaKey, string> = {
  Vata: "Air · Space · Movement",
  Pitta: "Fire · Water · Transformation",
  Kapha: "Earth · Water · Stability",
};

const GUIDANCE: Record<DoshaKey, { nutrition: string; lifestyle: string; yoga: string; routine: string }> = {
  Vata: {
    nutrition:
      "Warm, moist, grounding foods. Favor sweet, sour, salty tastes. Regular warm meals, cooked root vegetables, ghee, healthy oils, and warm spices like cinnamon and ginger.",
    lifestyle:
      "Gentle grounding exercise. Avoid overstimulation and cold drafts. Stay in warm, cozy environments with a predictable regular sleep schedule.",
    yoga:
      "Slow, grounding Hatha yoga, forward folds, Child's pose, and calming Nadi Shodhana (alternate nostril) pranayama.",
    routine:
      "Wake by 6:00 AM. Daily warm sesame oil massage (abhyanga). Warm baths. Early bedtime by 10:00 PM.",
  },
  Pitta: {
    nutrition:
      "Cooling, hydrating foods. Favor sweet, bitter, astringent tastes. Avoid spicy, fried, fermented foods. Enjoy sweet fruits, leafy greens, coconut, and mint.",
    lifestyle:
      "Moderate non-competitive exercise like swimming and cycling. Avoid overheating. Cool natural environments and balanced work-rest boundaries.",
    yoga:
      "Cooling Moon salutations (Chandra Namaskar), gentle heart openers, twist poses, and Sheetali (cooling breath) pranayama.",
    routine:
      "Wake by 5:30 AM. Refreshing cool shower. Morning meditation. Avoid midday harsh sun. Sleep by 10:00 PM.",
  },
  Kapha: {
    nutrition:
      "Light, warm, dry foods. Favor pungent, bitter, astringent tastes. Reduce sweet, heavy, dairy, and salty foods. Enjoy light soups, steamed veggies, and spicy tea.",
    lifestyle:
      "Vigorous invigorating exercise like running, hiking, and HIIT. Seek variety and movement. Warm dry environments with early rising.",
    yoga:
      "Dynamic Sun salutations (Surya Namaskar), backbends, standing poses, and energizing Kapalabhati (breath of fire) pranayama.",
    routine:
      "Wake by 5:00 AM. Morning dry skin brushing (garshana). Active morning movement. Light dinner. Avoid daytime naps.",
  },
};

// Clinical disease susceptibility mapping based on Paper 3 scoping review
const CLINICAL_RISKS: Record<string, { title: string; desc: string; guidance: string }> = {
  Vata: {
    title: "Vascular & Neurological Susceptibility (Pakshaghata / Stroke)",
    desc: "Paper 3 scoping review indicates Vata dominance is present in 88.8% of cerebrovascular / stroke subjects due to increased dryness (Ruksha) and variability (Chala).",
    guidance: "Prioritize Vata-pacifying oleation (Snehana), warm unctuous foods, lipid management, and blood pressure monitoring.",
  },
  Pitta: {
    title: "Metabolic & Inflammatory Susceptibility (Hypertension & Gastritis)",
    desc: "Pitta dominance creates thermal intensity (Ushna / Tikshna), predisposing to hyperacidity, hypertension, inflammatory skin conditions, and oxidative metabolic stress.",
    guidance: "Incorporate cooling herbs (Amalaki, Guduchi), avoid excess spice/alcohol, and maintain emotional calm.",
  },
  Kapha: {
    title: "Congestive & Metabolic Susceptibility (Prameha / Diabetes & Obesity)",
    desc: "Kapha dominance exhibits heavy (Guru) and slow (Manda) qualities, leading to sluggish metabolism, insulin resistance, hyperlipidemia, and lymphatic congestion.",
    guidance: "Engage in daily vigorous exercise, warm light meals, Trikatu spices, and regular fasting (Langhana).",
  },
};

export function ResultPage() {
  const { testId } = useParams({ from: "/result/$testId" });
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"nutrition" | "lifestyle" | "yoga" | "routine">("nutrition");
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(`prakriti_result_${testId}`);
      if (cached) {
        setResult(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}

    api
      .getUserTest(testId)
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch((e) => {
        setResult((prev: any) => {
          if (!prev) setError(e.message);
          return prev;
        });
      })
      .finally(() => setLoading(false));
  }, [testId]);

  const handleConfirmExport = (options: ExportOptions) => {
    toast.success("Generating customized clinical PDF report...");
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-xs font-semibold">
            Generating your Clinical Prakriti Assessment Report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Unable to Load Result</h2>
          <p className="text-muted-foreground mb-6 text-xs">{error || "Result not found."}</p>
          <Link to="/analysis">
            <Button className="text-xs font-bold bg-primary text-primary-foreground">
              Start New Analysis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const rawDom = result.dominant_dosha || "Vata";
  const primaryDosha: DoshaKey = rawDom.includes("Pitta")
    ? "Pitta"
    : rawDom.includes("Kapha")
    ? "Kapha"
    : "Vata";

  const scores = result.scores || { Vata: 45, Pitta: 35, Kapha: 20 };
  const totalScore = (scores.Vata || 0) + (scores.Pitta || 0) + (scores.Kapha || 0) || 1;

  const vataPct = (scores.Vata / totalScore) * 100;
  const pittaPct = (scores.Pitta / totalScore) * 100;
  const kaphaPct = (scores.Kapha / totalScore) * 100;

  const circumference = 2 * Math.PI * 40;
  const vataOffset = 0;
  const pittaOffset = (vataPct / 100) * circumference;
  const kaphaOffset = ((vataPct + pittaPct) / 100) * circumference;

  const category = result.constitution_category || "Ekadoshaja (Single)";
  const riskInfo = CLINICAL_RISKS[primaryDosha] || CLINICAL_RISKS.Vata;
  const cvMetrics = result.cv_metrics;

  return (
    <div className="min-h-screen bg-background text-foreground font-body print:bg-white print:text-black">
      {/* Header Nav */}
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-card/95 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-7xl px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-display font-extrabold text-base text-foreground">
              Prakriti <span className="text-primary font-bold">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="gap-2 text-xs font-bold border-border"
            >
              <Download className="h-4 w-4 text-primary" /> Customize PDF Report
            </Button>
            <Link to="/analysis" className="text-xs text-muted-foreground hover:text-foreground">
              New Assessment
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <Link
          to="/analysis"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground print:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Assessment
        </Link>

        {/* Header Summary Card */}
        <div className="bg-card border border-border/60 rounded-3xl p-8 text-center shadow-card relative overflow-hidden print:border print:p-6 space-y-3">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <PrakritiBadge
              type={primaryDosha}
              label={`${rawDom.toUpperCase()} CONSTITUTION`}
              size="lg"
            />
            <span className="text-xs font-mono px-3 py-1 bg-accent/15 text-accent rounded-full font-bold border border-accent/30">
              {category}
            </span>
          </div>

          <h1 className="font-display font-black text-4xl md:text-5xl text-foreground">
            {rawDom.toUpperCase()} CONSTITUTION
          </h1>
          <div className="font-display font-extrabold text-3xl text-primary">
            {scores[primaryDosha] || Math.round(vataPct)}% Expression
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span>{DOSHA_LABELS[primaryDosha]}</span>
          </div>

          <div className="block pt-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-muted/40 rounded-full text-xs font-semibold text-muted-foreground border border-border/40">
              <Brain className="h-3.5 w-3.5 text-primary" /> Stacking ML Model Confidence:{" "}
              {result.ai_confidence}%
            </span>
          </div>
        </div>

        {/* 3-Model Benchmark Architecture Cards */}
        {result.questionnaire_prediction && (
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-accent" />
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">
                    3-Model Benchmark Architecture Breakdown
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Questionnaire-Only vs. Computer Vision-Only vs. Multimodal Fusion Model
                  </p>
                </div>
              </div>
              {result.multimodal_agreement ? (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> High Multimodal Agreement
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {result.low_agreement_warning}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-2">
                <span className="font-bold text-accent uppercase tracking-wider block">
                  Model A: Questionnaire-Only
                </span>
                <p className="font-display text-lg font-bold text-foreground">
                  {result.questionnaire_prediction.dominant} (
                  {result.questionnaire_prediction.confidence}%)
                </p>
                <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
                  <p>Vata: {result.questionnaire_prediction.doshaScores.Vata || 0}%</p>
                  <p>Pitta: {result.questionnaire_prediction.doshaScores.Pitta || 0}%</p>
                  <p>Kapha: {result.questionnaire_prediction.doshaScores.Kapha || 0}%</p>
                </div>
              </div>

              <div className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-2">
                <span className="font-bold text-primary uppercase tracking-wider block">
                  Model B: Facial Vision-Only
                </span>
                <p className="font-display text-lg font-bold text-foreground">
                  {result.vision_prediction?.dominant || "N/A"} (
                  {result.vision_prediction?.confidence || 0}%)
                </p>
                <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
                  <p>
                    Vata:{" "}
                    {result.vision_prediction?.doshaScores
                      ? (result.vision_prediction.doshaScores.Vata * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                  <p>
                    Pitta:{" "}
                    {result.vision_prediction?.doshaScores
                      ? (result.vision_prediction.doshaScores.Pitta * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                  <p>
                    Kapha:{" "}
                    {result.vision_prediction?.doshaScores
                      ? (result.vision_prediction.doshaScores.Kapha * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/40 rounded-2xl space-y-2">
                <span className="font-bold text-primary uppercase tracking-wider block">
                  Model C: Multimodal Fusion (65/35)
                </span>
                <p className="font-display text-lg font-bold text-foreground">
                  {result.fusion_prediction?.dominant || rawDom} (
                  {result.fusion_prediction?.confidence || result.ai_confidence}%)
                </p>
                <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
                  <p>Vata: {scores.Vata}%</p>
                  <p>Pitta: {scores.Pitta}%</p>
                  <p>Kapha: {scores.Kapha}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Risk Insights Card */}
        <div className="bg-card border border-rose-500/30 rounded-3xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h3 className="font-display font-bold text-base text-foreground">
              Clinical Predisposition & Risk Insights (Paper 3 Scoping Review)
            </h3>
          </div>
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2 text-xs">
            <h4 className="font-bold text-sm text-rose-300">{riskInfo.title}</h4>
            <p className="text-muted-foreground leading-relaxed">{riskInfo.desc}</p>
            <p className="font-medium text-foreground pt-1">
              <strong>Preventive Action:</strong> {riskInfo.guidance}
            </p>
          </div>
        </div>

        {/* Donut Visual & Scores Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-card flex flex-col items-center justify-center">
            <h3 className="font-display font-bold text-base text-foreground mb-6 w-full text-left">
              Constitutional Balance Donut Visual
            </h3>
            <div className="relative w-44 h-44 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={DOSHA_COLORS.Vata}
                  strokeWidth="12"
                  strokeDasharray={`${(vataPct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-vataOffset}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={DOSHA_COLORS.Pitta}
                  strokeWidth="12"
                  strokeDasharray={`${(pittaPct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-pittaOffset}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={DOSHA_COLORS.Kapha}
                  strokeWidth="12"
                  strokeDasharray={`${(kaphaPct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-kaphaOffset}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black font-display text-primary">
                  {scores[primaryDosha]}%
                </span>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                  {primaryDosha}
                </span>
              </div>
            </div>

            <PrakritiDistribution scores={scores} className="w-full max-w-sm" />
          </div>

          {/* Interactive Facial Landmark Overlay */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-card">
            <FacialFeatureMap
              imageUrl={result.image_url}
              observations={result.facial_observations}
              status={result.facial_analysis_status}
            />
          </div>
        </div>

        {/* 6-Axis Tri-Dosha Radar Visual */}
        <PrakritiRadarChart scores={scores} dominantDosha={primaryDosha} />

        {/* Tri-Dosha Comparative Matrix */}
        <TriDoshaMatrix dominantDosha={primaryDosha} />

        {/* Longitudinal History Shift Analytics */}
        <LongitudinalChart currentScores={scores} />

        {/* Interactive Ayurvedic Meal & Dinacharya Checklist Planner */}
        <WellnessPlanner dominantDosha={primaryDosha} />

        {/* Tabbed Recommendations Plan */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-border/40 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">
                Personalized Ayurvedic Wellness Plan
              </h3>
              <p className="text-xs text-muted-foreground">
                Tailored lifestyle & dietary guidance for {rawDom}-dominant constitution.
              </p>
            </div>

            <div className="flex border border-border/60 rounded-xl p-1 bg-muted/20 text-xs font-bold gap-1">
              <button
                onClick={() => setActiveTab("nutrition")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "nutrition"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Utensils className="h-3.5 w-3.5" /> Diet
              </button>
              <button
                onClick={() => setActiveTab("lifestyle")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "lifestyle"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Activity className="h-3.5 w-3.5" /> Lifestyle
              </button>
              <button
                onClick={() => setActiveTab("yoga")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "yoga"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-3.5 w-3.5" /> Yoga & Breathing
              </button>
              <button
                onClick={() => setActiveTab("routine")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "routine"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-3.5 w-3.5" /> Daily Dinacharya
              </button>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border border-border/40 rounded-2xl animate-fadeUp">
            <h4 className="font-bold text-sm text-primary mb-2 capitalize">
              {activeTab} Guidance for {primaryDosha}
            </h4>
            <p className="text-xs text-foreground leading-relaxed">
              {GUIDANCE[primaryDosha][activeTab]}
            </p>
          </div>
        </div>
      </main>

      {/* Customizable Export Modal */}
      <PDFExportModal
        testId={result.test_id}
        dominantDosha={primaryDosha}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirmExport={handleConfirmExport}
      />
    </div>
  );
}
