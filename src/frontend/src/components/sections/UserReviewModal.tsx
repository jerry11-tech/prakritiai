import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Question, QuestionnaireAnswer, VerificationStatus } from "../../types/prakruti";

interface UserReviewModalProps {
  participantId: string;
  name: string;
  ageGroup: string;
  gender: string;
  city: string;
  diabetes: string;
  bloodPressure: string;
  questions: Question[];
  answers: Record<string, QuestionnaireAnswer>;
  verificationStatus: VerificationStatus;
  onConfirmVerification: () => Promise<void>;
  onEditAnswer: (questionId: string, dosha: any, value: string) => void;
  onClose: () => void;
}

export function UserReviewModal({
  participantId,
  name,
  ageGroup,
  gender,
  city,
  diabetes,
  bloodPressure,
  questions,
  answers,
  verificationStatus,
  onConfirmVerification,
  onEditAnswer,
  onClose,
}: UserReviewModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirmVerification();
    setIsConfirming(false);
    setConfirmedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-primary/30 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              REVIEW YOUR ANSWERS BEFORE VERIFICATION
            </div>
            <h2 className="font-display font-extrabold text-2xl text-foreground">
              Confirm Questionnaire Response Accuracy
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {confirmedSuccess ? (
          <div className="bg-accent/10 border border-accent/40 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center text-3xl mx-auto font-bold">
              ✓
            </div>
            <h3 className="font-display font-bold text-xl text-foreground">
              Response Verification Confirmed!
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your questionnaire responses have been verified and recorded in the research database & synchronized to the <strong className="text-foreground">Verified_Data</strong> Excel sheet.
            </p>
            <Button
              className="bg-primary text-primary-foreground font-bold text-xs"
              onClick={onClose}
            >
              Close & View My Prakriti Result →
            </Button>
          </div>
        ) : (
          <>
            {/* Status Alert */}
            <div className="flex items-center justify-between p-3.5 bg-muted/30 border border-border/40 rounded-xl text-xs">
              <div>
                <span className="text-muted-foreground">Participant ID: </span>
                <strong className="text-foreground">{participantId}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Verification Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    verificationStatus === "VERIFIED"
                      ? "bg-accent/15 text-accent border-accent/40"
                      : verificationStatus === "NEEDS_REVERIFICATION"
                        ? "bg-destructive/15 text-destructive border-destructive/40"
                        : "bg-chart-3/15 text-chart-3 border-chart-3/40"
                  }`}
                >
                  {verificationStatus}
                </span>
              </div>
            </div>

            {/* Demographics & Health Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 border border-border/30 rounded-2xl p-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Name</span>
                <strong className="text-foreground">{name || "Anonymous"}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Age Group</span>
                <strong className="text-foreground">{ageGroup}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">City</span>
                <strong className="text-foreground">{city}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Diabetes / BP</span>
                <strong className="text-foreground">{diabetes} / {bloodPressure}</strong>
              </div>
            </div>

            {/* Questionnaire Answers Table */}
            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
              <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
                Your Answered Characteristics ({Object.keys(answers).length} Features)
              </div>
              {questions.map((q, idx) => {
                const currentAns = answers[q.id];
                const isEditing = editingQId === q.id;
                return (
                  <div
                    key={q.id}
                    className="p-3 bg-card border border-border/40 rounded-xl flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-foreground block">
                        {idx + 1}. {q.text}
                      </span>
                      {isEditing ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {q.options.map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => {
                                onEditAnswer(q.id, opt.dosha, opt.value);
                                setEditingQId(null);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                                currentAns?.value === opt.value
                                  ? "bg-primary text-primary-foreground border-primary font-bold"
                                  : "border-border/50 text-muted-foreground hover:border-primary/40"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px] block mt-0.5">
                          Selected: <strong className="text-accent">{currentAns?.value || "Not Answered"}</strong> ({currentAns?.dosha?.toUpperCase() || ""})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingQId(isEditing ? null : q.id)}
                      className="text-xs text-primary underline shrink-0 hover:text-primary/80"
                    >
                      {isEditing ? "Done" : "Edit Answer"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
              <div className="text-[11px] text-muted-foreground max-w-sm">
                By confirming, you certify that all submitted details are true. Verified data will be copied to <code className="text-accent font-bold">Verified_Data</code> in Excel.
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-border/60"
                  onClick={onClose}
                >
                  Edit Answers
                </Button>
                <Button
                  size="sm"
                  className="text-xs bg-accent text-accent-foreground font-bold shadow-md hover:bg-accent/90"
                  disabled={isConfirming}
                  onClick={handleConfirm}
                >
                  {isConfirming ? "⟳ Confirming..." : "✓ Confirm My Answers"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}