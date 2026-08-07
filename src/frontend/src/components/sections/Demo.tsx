import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useAnalysis, type StoredAnalysis } from "../../hooks/useAnalysis";
import { useInView } from "../../hooks/useInView";
import { useQuestionnaire } from "../../hooks/useQuestionnaire";
import type { DoshaType, PrakrutiType } from "../../types/prakruti";
import { DoshaBar } from "../ui/DoshaBar";
import { QuestionCard } from "../ui/QuestionCard";
import { ResultsPanel } from "../ui/ResultsPanel";

const QUESTIONS_PER_PAGE = 4;

function HistoryTab({
  history,
  onClear,
  onDelete,
}: {
  history: StoredAnalysis[];
  onClear: () => void;
  onDelete: (id: string) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center text-center">
        <div className="text-3xl mb-3 opacity-30">📋</div>
        <p className="text-sm text-muted-foreground">
          No analyses yet. Complete the questionnaire to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          {history.length} past analysis{history.length !== 1 ? "es" : ""}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-destructive hover:underline"
        >
          Clear all
        </button>
      </div>
      {history.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40"
        >
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {item.result.dominant[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {item.result.dominant} Dosha
            </div>
            <div className="text-xs text-muted-foreground">
              {item.result.doshaScores.vata}% V ·{" "}
              {item.result.doshaScores.pitta}% P ·{" "}
              {item.result.doshaScores.kapha}% K ·{" "}
              {item.result.confidence}% confidence
            </div>
            <div className="text-[10px] text-muted-foreground/60">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="text-xs text-destructive/60 hover:text-destructive shrink-0 px-2 py-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function Demo() {
  const { ref, inView } = useInView(0.08);
  const {
    questions,
    answers,
    setAnswer,
    setImageFile,
    totalAnswered,
    totalQuestions,
    isComplete,
    result,
    classifyPrakruti,
    reset,
  } = useQuestionnaire();
  const { storeAnalysis, getHistory, deleteHistoryItem, clearHistory, stored } =
    useAnalysis();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"questionnaire" | "history">(
    "questionnaire",
  );
  const [barWidths, setBarWidths] = useState<Record<PrakrutiType, number>>({
    Vata: 0,
    Pitta: 0,
    Kapha: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<StoredAnalysis[]>(() =>
    getHistory(),
  );

  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file.name);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleAnalyze = async () => {
    if (!isComplete) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 800));
    const res = classifyPrakruti();
    void storeAnalysis(res, imagePreview || undefined);
    setTimeout(() => {
      setBarWidths({
        Vata: res.doshaScores.vata,
        Pitta: res.doshaScores.pitta,
        Kapha: res.doshaScores.kapha,
      });
      setHistory(getHistory());
    }, 300);
    setAnalyzing(false);
  };

  const handleReset = () => {
    reset();
    setImagePreview(null);
    setCurrentPage(0);
    setBarWidths({ Vata: 0, Pitta: 0, Kapha: 0 });
  };

  const handleDeleteHistory = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const doshaOrder: PrakrutiType[] = ["Vata", "Pitta", "Kapha"];

  return (
    <section id="demo" className="py-20 md:py-24 px-6 md:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live Demo
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-3">
            See It In Action
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Upload a photo, answer lifestyle questions, and receive your
            complete Ayurvedic report.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div
            className={`${inView ? "animate-fadeUp" : "opacity-0"} bg-card border border-border/50 rounded-2xl p-6 md:p-7`}
          >
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-muted/30 rounded-xl mb-5">
              {(
                ["questionnaire", "history"] as const
              ).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-smooth capitalize ${
                    activeTab === tab
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "questionnaire" ? "Questionnaire" : "History"}
                </button>
              ))}
            </div>

            {activeTab === "questionnaire" ? (
              <>
                {/* Upload zone */}
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-4">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Step 1 — Facial Input
                </div>
                <label
                  htmlFor="file-upload-input"
                  data-ocid="upload-zone"
                  className="w-full border border-dashed border-primary/30 rounded-xl p-6 text-center mb-5 bg-primary/[0.03] hover:bg-primary/[0.06] hover:border-primary/50 transition-smooth cursor-pointer block"
                >
                  <input
                    ref={fileRef}
                    id="file-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Uploaded face"
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-primary/40"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/25 to-accent/15 border border-primary/30 flex items-center justify-center text-2xl mx-auto mb-3">
                      📷
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-3">
                    {imagePreview
                      ? "Image uploaded — AI will analyze facial features"
                      : "Drag & drop or click to upload a frontal photo"}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="text-xs bg-primary text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileRef.current?.click();
                      }}
                    >
                      📂 Upload Image
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      data-ocid="simulated-analysis"
                      className="text-xs border-primary/40 text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(`simulated_${Math.random()}`);
                      }}
                    >
                      🔮 Simulate Analysis
                    </Button>
                  </div>
                </label>

                <div className="h-px bg-border/40 my-4" />

                {/* Questionnaire */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Step 2 — Questionnaire
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {totalAnswered}/{totalQuestions}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{
                      width: `${(totalAnswered / totalQuestions) * 100}%`,
                    }}
                  />
                </div>

                <div className="space-y-3 mb-5">
                  {pageQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      selected={answers[q.id]?.dosha ?? null}
                      onSelect={(dosha) => setAnswer(q.id, dosha)}
                    />
                  ))}
                </div>

                {/* Page navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ← Prev
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </div>

                <Button
                  type="button"
                  data-ocid="analyze-btn"
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-smooth disabled:opacity-50"
                  disabled={!isComplete || analyzing}
                  onClick={handleAnalyze}
                >
                  {analyzing
                    ? "⟳ Analyzing..."
                    : isComplete
                      ? "Analyze My Prakriti →"
                      : `Answer all ${totalQuestions} questions to continue`}
                </Button>
              </>
            ) : (
              <HistoryTab
                history={history}
                onClear={handleClearHistory}
                onDelete={handleDeleteHistory}
              />
            )}
          </div>

          {/* Results Panel */}
          <div
            className={`${inView ? "animate-fadeUp" : "opacity-0"} bg-card border border-border/50 rounded-2xl p-6 md:p-7`}
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Analysis Results
            </div>

            {!result ? (
              <div
                data-ocid="results-empty"
                className="h-[500px] flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center text-3xl mb-5 animate-float">
                  🧬
                </div>
                <div className="font-display font-bold text-lg mb-2">
                  Awaiting Analysis
                </div>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Complete all 12 questionnaire questions and click "Analyze My
                  Prakriti" to receive your personalized report.
                </p>
                <div className="mt-6 flex gap-2 flex-wrap justify-center">
                  {doshaOrder.map((d) => (
                    <span
                      key={d}
                      className="text-xs border border-border/40 text-muted-foreground rounded-full px-3 py-1"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <ResultsPanel
                result={result}
                barWidths={barWidths}
                doshaOrder={doshaOrder}
                onReset={handleReset}
                saved={stored}
              >
                {doshaOrder.map((dosha) => (
                  <DoshaBar
                    key={dosha}
                    dosha={dosha}
                    score={result.doshaScores[dosha.toLowerCase() as DoshaType]}
                    width={barWidths[dosha]}
                  />
                ))}
              </ResultsPanel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
