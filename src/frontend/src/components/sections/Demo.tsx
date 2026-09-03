import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useAnalysis, type StoredAnalysis } from "../../hooks/useAnalysis";
import { useInView } from "../../hooks/useInView";
import { useQuestionnaire } from "../../hooks/useQuestionnaire";
import type { DoshaType, PrimaryDosha, PrakrutiType, VerificationStatus } from "../../types/prakruti";
import { DoshaBar } from "../ui/DoshaBar";
import { ResultsPanel } from "../ui/ResultsPanel";
import { UserReviewModal } from "./UserReviewModal";

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
  const [participantId, setParticipantId] = useState<string>(
    () => `P${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [userName, setUserName] = useState("Dhiraj");
  const [userAgeGroup, setUserAgeGroup] = useState("20-30");
  const [userGender, setUserGender] = useState("Female");
  const [userCity, setUserCity] = useState("Mumbai");
  const [userDiabetes, setUserDiabetes] = useState("No");
  const [userBP, setUserBP] = useState("Normal");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("PENDING");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"questionnaire" | "history">(
    "questionnaire",
  );
  const [barWidths, setBarWidths] = useState<Record<PrimaryDosha, number>>({
    Vata: 0,
    Pitta: 0,
    Kapha: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<StoredAnalysis[]>(() =>
    getHistory(),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file.name);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const respMap: Record<string, string> = {};
      for (const [qId, a] of Object.entries(answers)) {
        respMap[qId] = (a as any).value || (a as any).dosha;
      }

      const res = classifyPrakruti();
      void storeAnalysis(res, imagePreview || undefined);

      setBarWidths({
        Vata: res.doshaScores.vata,
        Pitta: res.doshaScores.pitta,
        Kapha: res.doshaScores.kapha,
      });
      setHistory(getHistory());

      setTimeout(() => {
        const el = document.getElementById("full-result-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Error running Prakriti analysis:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectOption = (dosha: DoshaType) => {
    const currentQ = questions[activeQuestionIdx];
    const selOpt = currentQ.options.find((o) => o.dosha === dosha);
    setAnswer(currentQ.id, dosha);

    const updatedAnswers = {
      ...answers,
      [currentQ.id]: { questionId: currentQ.id, dosha, value: selOpt?.value || dosha },
    };

    if (activeQuestionIdx < totalQuestions - 1) {
      setTimeout(() => {
        setActiveQuestionIdx((prev) => prev + 1);
      }, 220);
    } else if (Object.keys(updatedAnswers).length === totalQuestions) {
      setTimeout(() => {
        handleAnalyze();
      }, 300);
    }
  };

  const handleConfirmVerification = async () => {
    try {
      const confirmedMap: Record<string, string> = {};
      for (const [qId, a] of Object.entries(answers)) {
        confirmedMap[qId] = (a as any).value || (a as any).dosha;
      }
      const res = await fetch("http://127.0.0.1:8000/api/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          verifiedBy: userName || "User",
          confirmedAnswers: confirmedMap,
        }),
      });
      if (res.ok) {
        setVerificationStatus("VERIFIED");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationStatus("VERIFIED");
    }
  };

  const handleEditAnswerInModal = async (questionId: string, dosha: DoshaType, value: string) => {
    setAnswer(questionId, dosha);
    if (verificationStatus === "VERIFIED") {
      setVerificationStatus("NEEDS_REVERIFICATION");
      try {
        await fetch("http://127.0.0.1:8000/api/update-questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId,
            changedBy: userName || "User",
            userRole: "User",
            reason: "User edited answer during response verification review",
            updates: { [questionId]: value },
          }),
        });
      } catch (err) {
        console.warn("Update questionnaire backend sync error:", err);
      }
    }
  };

  const handleReset = () => {
    reset();
    setImagePreview(null);
    setActiveQuestionIdx(0);
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

  const currentQ = questions[activeQuestionIdx];
  const doshaOrder: PrakrutiType[] = ["Vata", "Pitta", "Kapha"];

  return (
    <section id="demo" className="py-20 md:py-28 px-6 md:px-12 bg-background border-b border-border/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            TRY PRAKRITIAI
            <span className="w-4 h-0.5 bg-accent rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-2">
            Interactive Prakriti Analysis
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-base">
            Complete the analysis to discover your Prakriti constitution.
          </p>
        </div>

        {/* Input & Questionnaire Card */}
        <div ref={ref} className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl mb-12">
          <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
            <span className="text-xs font-bold tracking-widest text-accent uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              ANALYSIS INPUT
            </span>
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-muted/30 rounded-xl">
              {(
                ["questionnaire", "history"] as const
              ).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? "bg-card shadow-xs text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "questionnaire" ? "Questionnaire" : "History"}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "questionnaire" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Photo Upload Box */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-muted/20 border border-border/40 rounded-2xl p-6 text-center">
                <div>
                  <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4">
                    📷 YOUR PHOTO
                  </div>
                  <label
                    htmlFor="demo-file-input"
                    className="w-full border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center bg-primary/[0.03] hover:bg-primary/[0.06] hover:border-primary/50 transition-all cursor-pointer block"
                  >
                    <input
                      ref={fileRef}
                      id="demo-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Uploaded face"
                        className="w-28 h-28 rounded-full object-cover mx-auto mb-3 border-4 border-primary/40 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/25 to-accent/15 border border-primary/30 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                        📷
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      {imagePreview
                        ? "Photo Loaded ✓ Facial features ready for CV extraction"
                        : "Click to upload your frontal photo for facial feature analysis"}
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="text-xs bg-primary text-primary-foreground font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileRef.current?.click();
                        }}
                      >
                        {imagePreview ? "Change Photo" : "Upload Photo"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs border-primary/40 text-primary font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(`simulated_${Math.random()}`);
                        }}
                      >
                        Simulate Capture
                      </Button>
                    </div>
                  </label>
                </div>

                <div className="mt-4 pt-4 border-t border-border/30 text-[11px] text-muted-foreground">
                  Your photo stays local in your browser and is never stored on external servers.
                </div>
              </div>

              {/* Right Column: Question Stepper Card */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-muted/10 border border-border/40 rounded-2xl p-6">
                {analyzing ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-accent border-t-transparent animate-spin mb-4" />
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">
                      Analyzing Your Prakriti...
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Fusing facial observation features with questionnaire responses using DoshaNet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                        <span className="text-xs font-bold text-accent tracking-widest uppercase">
                          QUESTION {String(activeQuestionIdx + 1).padStart(2, "0")} / {totalQuestions}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          {answers[currentQ.id] ? "Answered ✓" : "Required"}
                        </span>
                      </div>

                      {/* Question Text */}
                      <h3 className="font-display font-bold text-lg text-foreground mb-5 leading-snug">
                        {currentQ.text}
                      </h3>

                      {/* Radio Options */}
                      <div className="space-y-2.5 mb-6">
                        {currentQ.options.map((opt) => {
                          const isSelected = answers[currentQ.id]?.dosha === opt.dosha;
                          return (
                            <button
                              type="button"
                              key={opt.dosha}
                              onClick={() => handleSelectOption(opt.dosha)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-between ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                                  : "bg-card border-border/50 text-foreground hover:border-primary/40 hover:bg-muted/30"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                    isSelected
                                      ? "border-primary-foreground bg-primary-foreground text-primary"
                                      : "border-muted-foreground/40"
                                  }`}
                                >
                                  {isSelected ? "●" : "○"}
                                </span>
                                {opt.label}
                              </span>
                              {isSelected && <span className="text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navigation & Progress Dots */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/30 mb-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs border-border/50 font-semibold"
                          disabled={activeQuestionIdx === 0}
                          onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                        >
                          ← Previous Question
                        </Button>
                        <div className="flex gap-2">
                          {totalAnswered > 0 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-xs border-accent/40 text-accent font-semibold hover:bg-accent/10"
                              onClick={() => setShowReviewModal(true)}
                            >
                              📋 Review & Verify ({totalAnswered})
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            className="text-xs bg-primary font-semibold"
                            disabled={!answers[currentQ.id]}
                            onClick={() => {
                              if (activeQuestionIdx < totalQuestions - 1) {
                                setActiveQuestionIdx((p) => p + 1);
                              } else {
                                handleAnalyze();
                              }
                            }}
                          >
                            {activeQuestionIdx === totalQuestions - 1 ? "Complete Analysis →" : "Next Question →"}
                          </Button>
                        </div>
                      </div>

                      {/* 12 Progress Dots */}
                      <div className="flex justify-center items-center gap-1.5 pt-2">
                        {questions.map((q, idx) => {
                          const isAnswered = Boolean(answers[q.id]);
                          const isCurrent = idx === activeQuestionIdx;
                          return (
                            <button
                              type="button"
                              key={q.id}
                              title={`Question ${idx + 1}`}
                              onClick={() => setActiveQuestionIdx(idx)}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${
                                isCurrent
                                  ? "bg-accent scale-125 ring-2 ring-accent/40"
                                  : isAnswered
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <HistoryTab
              history={history}
              onClear={handleClearHistory}
              onDelete={handleDeleteHistory}
            />
          )}
        </div>

        {/* FULL-WIDTH RESULT & INSIGHTS (When Result Exists) */}
        {result && (
          <div id="full-result-section" className="space-y-8 animate-fadeUp pt-4">
            {/* FULL-WIDTH RESULT HEADER */}
            <div className="bg-card border border-accent/40 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
              <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/40 text-accent px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                ANALYSIS COMPLETE ✓
              </div>
              <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-1">
                YOUR PRAKRITI PROFILE
              </h3>
              <h2 className="font-display font-black text-3xl md:text-5xl text-foreground mb-1">
                {result.dominant.toUpperCase()} DOMINANT
              </h2>
              <div className="font-display font-extrabold text-2xl text-accent mb-6">
                {result.doshaScores[result.dominant.toLowerCase() as DoshaType].toFixed(0)}%
              </div>

              {/* Dosha Bars Full-Width Container */}
              <div className="max-w-3xl mx-auto space-y-4 bg-muted/20 border border-border/40 p-6 rounded-2xl mb-6">
                {doshaOrder.map((dosha) => {
                  const score = result.doshaScores[dosha.toLowerCase() as DoshaType];
                  const colorClass =
                    dosha === "Vata"
                      ? "bg-accent"
                      : dosha === "Pitta"
                        ? "bg-primary"
                        : "bg-chart-3";
                  return (
                    <div key={dosha} className="text-left">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-foreground">{dosha.toUpperCase()}</span>
                        <span>{score.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorClass} transition-all duration-700`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground italic mb-6">
                {result.dominant === "Vata"
                  ? "Air · Space · Movement"
                  : result.dominant === "Pitta"
                    ? "Fire · Water · Transformation"
                    : "Earth · Water · Structure"}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="border-border/60 font-bold text-xs"
                onClick={handleReset}
              >
                ← Start New Analysis
              </Button>
            </div>

            {/* INSIGHTS 2-COLUMN SPLIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facial Observations */}
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="text-xs font-bold tracking-widest uppercase text-accent mb-4 flex items-center gap-2">
                  <span>📷</span> FACIAL OBSERVATIONS
                </div>
                <ul className="space-y-2.5 text-xs">
                  <li className="flex justify-between py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground">Face Shape</span>
                    <span className="font-semibold text-foreground">{result.facialConditions.faceShape}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground">Dark Circles</span>
                    <span className="font-semibold text-foreground">{result.facialConditions.darkCircles}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground">Facial Puffiness</span>
                    <span className="font-semibold text-foreground">{result.facialConditions.puffiness}</span>
                  </li>
                  <li className="flex justify-between py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground">Skin Tone</span>
                    <span className="font-semibold text-foreground">{result.facialConditions.skinTone}</span>
                  </li>
                  <li className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Skin Moisture</span>
                    <span className="font-semibold text-foreground">{result.facialConditions.skinMoisture}</span>
                  </li>
                </ul>
              </div>

              {/* Prakriti Summary */}
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="text-xs font-bold tracking-widest uppercase text-primary mb-4 flex items-center gap-2">
                  <span>📊</span> PRAKRITI SUMMARY
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <span className="font-bold text-primary block text-sm mb-1">
                      {result.dominant} Dominant Constitution
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Your analysis indicates a primary {result.dominant} temperament combined with balanced secondary dosha traits.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-2 bg-muted/20 rounded-lg border border-border/30">
                      <div className="font-bold text-accent">{result.doshaScores.vata.toFixed(0)}%</div>
                      <div className="text-[10px] text-muted-foreground">Vata</div>
                    </div>
                    <div className="p-2 bg-muted/20 rounded-lg border border-border/30">
                      <div className="font-bold text-primary">{result.doshaScores.pitta.toFixed(0)}%</div>
                      <div className="text-[10px] text-muted-foreground">Pitta</div>
                    </div>
                    <div className="p-2 bg-muted/20 rounded-lg border border-border/30">
                      <div className="font-bold text-chart-3">{result.doshaScores.kapha.toFixed(0)}%</div>
                      <div className="text-[10px] text-muted-foreground">Kapha</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Review & Verification Modal */}
        {showReviewModal && (
          <UserReviewModal
            participantId={participantId}
            name={userName}
            ageGroup={userAgeGroup}
            gender={userGender}
            city={userCity}
            diabetes={userDiabetes}
            bloodPressure={userBP}
            questions={questions}
            answers={answers}
            verificationStatus={verificationStatus}
            onConfirmVerification={handleConfirmVerification}
            onEditAnswer={handleEditAnswerInModal}
            onClose={() => setShowReviewModal(false)}
          />
        )}
      </div>
    </section>
  );
}