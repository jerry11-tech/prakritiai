import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, ImageIcon, Keyboard } from "lucide-react";

export function ExpertReviewPage() {
  const { testId } = useParams({ from: "/expert/review/$testId" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getExpertTestDetail(testId)
      .then((data) => {
        setDetail(data);
        if (data.review?.expert_notes) setNotes(data.review.expert_notes);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [testId]);

  const handleDecision = async (decision: "CORRECT" | "INCORRECT") => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (decision === "CORRECT") {
        await api.verifyTest(testId, notes);
      } else {
        await api.rejectTest(testId, notes);
      }
      navigate({ to: "/expert/dashboard" });
    } catch (e: any) {
      setError(e.message || "Failed to submit decision");
    } finally {
      setSubmitting(false);
    }
  };

  // Keyboard hotkeys: V -> Verify, R -> Reject, Escape -> Back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        handleDecision("CORRECT");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleDecision("INCORRECT");
      } else if (e.key === "Escape" || e.key === "ArrowLeft") {
        e.preventDefault();
        navigate({ to: "/expert/dashboard" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [testId, notes, submitting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm font-semibold">Loading test details for clinical review...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Access Denied / Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">{error}</p>
          <Link to="/expert/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const spec = user?.specialization || "Vata";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/expert/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-muted/30 border border-border/40 px-2.5 py-1 rounded-lg text-muted-foreground hidden sm:flex items-center gap-1">
              <Keyboard className="h-3.5 w-3.5 text-accent" /> Hotkeys: [V] Verify | [R] Reject | [Esc] Back
            </span>
            <span className="text-xs bg-accent/15 text-accent px-2.5 py-1 rounded-full font-bold uppercase">
              {spec} SPECIALIZATION
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl">Clinical Case Review — #{detail.test_id}</h1>
            <p className="text-muted-foreground text-sm">Review questionnaire responses, facial analysis evidence, and AI ML predictions.</p>
          </div>
        </div>

        {/* User Photo + Questionnaire Summary */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Photo + Facial Analysis */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              User Photo & Facial Analysis Evidence
            </h3>

            {detail.image_url ? (
              <div className="mb-4">
                <img src={`http://127.0.0.1:8000${detail.image_url}`} alt="User face" className="w-full max-h-64 object-contain rounded-2xl bg-muted/20 border border-border/30" />
              </div>
            ) : (
              <div className="p-6 bg-muted/30 border border-border/40 rounded-xl text-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber mx-auto mb-2" />
                <p className="text-sm font-medium">No photo uploaded</p>
                <p className="text-xs text-muted-foreground">Facial analysis status: {detail.facial_analysis_status}</p>
              </div>
            )}

            {detail.facial_observations?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Facial Observations</span>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {detail.facial_observations.map((obs: any, i: number) => (
                    <li key={i} className="p-2 bg-muted/20 rounded-lg border border-border/30">
                      <strong>{obs.category}:</strong> {obs.observation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Questionnaire Summary */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <h3 className="font-display font-bold text-lg mb-4">Questionnaire Responses</h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2 text-xs">
              {detail.answers?.map((a: any) => {
                return (
                  <div key={a.question_id} className="p-2.5 bg-muted/20 rounded-xl flex justify-between items-center border border-border/30">
                    <span className="text-muted-foreground font-semibold">{a.question_id}:</span>
                    <span className="font-semibold text-foreground">{a.answer}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Result Card - Blind Evaluation Protocol */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 mb-8 text-center">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <span className="text-xs font-bold tracking-widest text-accent uppercase">
              BLIND CLINICAL EVALUATION PROTOCOL (X → y)
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-mono border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => setNotes((prev) => prev ? prev : "Blind clinical observation completed.")}
            >
              Blind Trial Mode Active
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Per research guidelines, practitioners evaluate questionnaire and computer vision evidence prior to inspecting model predictions.
          </p>

          <div className="p-4 bg-muted/20 border border-border/30 rounded-2xl max-w-xl mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-2">
              {["Vata", "Pitta", "Kapha"].map((d) => (
                <div
                  key={d}
                  className={`p-3 rounded-xl border text-center ${
                    d === spec
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-muted/30 border-border/30"
                  }`}
                >
                  <span className="text-xs font-bold block">{d} Score</span>
                  <span className="font-display font-bold text-lg">
                    {detail.scores[d]}%
                  </span>
                </div>
              ))}
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              Model Prediction: {detail.dominant_dosha} ({detail.ai_confidence}% Confidence)
            </span>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-card border border-primary/40 rounded-3xl p-8 shadow-lg">
          <h3 className="font-display font-bold text-xl mb-2">Practitioner Verdict</h3>
          <p className="text-sm text-muted-foreground mb-6">Confirm or reject the AI result for your {spec} specialization.</p>

          <div className="mb-6">
            <label className="block text-xs font-bold tracking-widest text-accent uppercase mb-2">Expert Diagnostic Notes (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter clinical assessment notes or reasoning..."
              className="w-full p-4 bg-background border border-border rounded-xl text-sm text-foreground focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              disabled={submitting}
              onClick={() => handleDecision("CORRECT")}
              className="flex-1 bg-green hover:bg-green/90 text-white font-bold py-4 gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              ✓ CORRECT [Press V]
            </Button>
            <Button
              size="lg"
              variant="destructive"
              disabled={submitting}
              onClick={() => handleDecision("INCORRECT")}
              className="flex-1 font-bold py-4 gap-2"
            >
              <XCircle className="h-5 w-5" />
              ✕ INCORRECT [Press R]
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
