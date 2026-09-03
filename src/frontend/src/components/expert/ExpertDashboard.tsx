import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { PrakrutiType } from "../../types/prakruti";

interface ExpertParticipant {
  participantId: string;
  name: string;
  ageGroup: string;
  gender: string;
  city: string;
  createdAt: string;
  verificationStatus: string;
  expertCount: number;
  responses: Record<string, string>;
}

export function ExpertDashboard() {
  const [participants, setParticipants] = useState<ExpertParticipant[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [expertId, setExpertId] = useState("EXP_01");
  const [expertName, setExpertName] = useState("Dr. A. Sharma (MD Ayurveda)");
  const [primaryPrakriti, setPrimaryPrakriti] = useState<PrakrutiType>("Vata");
  const [secondaryPrakriti, setSecondaryPrakriti] = useState<PrakrutiType | "None">("Pitta");
  const [confidence, setConfidence] = useState(85);
  const [assessmentMethod, setAssessmentMethod] = useState("Nadi Pariksha & Clinical Exam");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/expert/participants");
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
        if (data.length > 0 && !selectedPartId) {
          setSelectedPartId(data[0].participantId);
        }
      }
    } catch (err) {
      console.warn("FastAPI backend connection warning:", err);
    }
  };

  const selectedParticipant = participants.find((p) => p.participantId === selectedPartId);

  const handleSubmitAssessment = async () => {
    if (!selectedPartId) return;
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const payload = {
        participantId: selectedPartId,
        expertId,
        expertName,
        primaryPrakriti,
        secondaryPrakriti: secondaryPrakriti === "None" ? null : secondaryPrakriti,
        confidence,
        assessmentMethod,
        notes,
      };

      const res = await fetch("http://127.0.0.1:8000/api/expert-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(`Assessment submitted for ${selectedPartId}! Consensus Status: ${data.consensus?.status}`);
        fetchParticipants();
      }
    } catch (err) {
      console.error("Error submitting expert assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="expert" className="py-20 md:py-28 px-6 md:px-12 bg-background border-b border-border/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            BLIND EXPERT EVALUATION PORTAL
            <span className="w-4 h-0.5 bg-accent rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-2">
            Independent Practitioner Assessment
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Evaluations are conducted blindly — practitioners cannot see ML predictions, model probabilities, or other practitioners' choices prior to submission.
          </p>
        </div>

        {/* Practitioner Credentials */}
        <div className="bg-card border border-border/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Practitioner ID</span>
              <input
                type="text"
                value={expertId}
                onChange={(e) => setExpertId(e.target.value)}
                className="bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1 text-xs font-semibold text-foreground"
              />
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase">Practitioner Name</span>
              <input
                type="text"
                value={expertName}
                onChange={(e) => setExpertName(e.target.value)}
                className="bg-muted/30 border border-border/50 rounded-lg px-2.5 py-1 text-xs font-semibold text-foreground w-64"
              />
            </div>
          </div>
          <span className="text-[11px] font-bold text-accent bg-accent/10 border border-accent/30 rounded-full px-3 py-1">
            🔒 Blind Evaluation Protocol Enforced
          </span>
        </div>

        {successMessage && (
          <div className="p-4 bg-accent/15 border border-accent/40 rounded-xl text-xs font-semibold text-accent text-center animate-fadeUp">
            ✓ {successMessage}
          </div>
        )}

        {/* 2-Column Split: Left = Participant List & Features, Right = Evaluation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Participant Selector & Questionnaire Responses */}
          <div className="lg:col-span-6 bg-card border border-border/40 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <h3 className="font-display font-bold text-sm text-foreground">
                Participant Records ({participants.length})
              </h3>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={fetchParticipants}>
                ⟳ Refresh
              </Button>
            </div>

            {/* Selector list */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {participants.map((p) => (
                <button
                  type="button"
                  key={p.participantId}
                  onClick={() => setSelectedPartId(p.participantId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-all ${
                    selectedPartId === p.participantId
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.participantId} ({p.expertCount} 👨⚕️)
                </button>
              ))}
            </div>

            {selectedParticipant ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-muted/20 rounded-xl border border-border/30 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Demographics</span>
                    <strong className="text-foreground">{selectedParticipant.ageGroup} · {selectedParticipant.gender} · {selectedParticipant.city}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Verification Status</span>
                    <strong className="text-accent">{selectedParticipant.verificationStatus}</strong>
                  </div>
                </div>

                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Submitted Questionnaire Characteristics ({Object.keys(selectedParticipant.responses).length})
                </div>

                <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {Object.entries(selectedParticipant.responses).map(([k, v]) => (
                    <div key={k} className="p-2.5 bg-muted/10 border border-border/30 rounded-lg flex justify-between">
                      <span className="text-muted-foreground font-mono text-[11px]">{k}</span>
                      <strong className="text-foreground">{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-12">
                No participant selected.
              </div>
            )}
          </div>

          {/* Right Column: Independent Expert Assessment Form */}
          <div className="lg:col-span-6 bg-card border border-primary/30 rounded-2xl p-6 space-y-5 shadow-lg">
            <div className="border-b border-border/40 pb-3 flex justify-between items-center">
              <h3 className="font-display font-bold text-base text-foreground">
                Independent Expert Evaluation Form
              </h3>
              <span className="text-xs text-accent font-bold">
                Participant: {selectedPartId || "None"}
              </span>
            </div>

            {/* Primary Prakriti Selection */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                Primary Assessed Prakriti (Ground Truth) *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["Vata", "Pitta", "Kapha"] as PrakrutiType[]).map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setPrimaryPrakriti(d)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      primaryPrakriti === d
                        ? d === "Vata"
                          ? "bg-accent text-accent-foreground border-accent shadow-md"
                          : d === "Pitta"
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-chart-3 text-white border-chart-3 shadow-md"
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Prakriti Selection */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                Secondary Prakriti (If Dual-Dosha)
              </label>
              <select
                value={secondaryPrakriti}
                onChange={(e) => setSecondaryPrakriti(e.target.value as any)}
                className="w-full bg-muted/20 border border-border/40 rounded-xl p-2.5 text-xs text-foreground font-semibold"
              >
                <option value="None">None (Single Dosha)</option>
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
              </select>
            </div>

            {/* Confidence Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Assessment Confidence Level</span>
                <span className="text-accent">{confidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            {/* Assessment Method */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                Assessment Methodology
              </label>
              <select
                value={assessmentMethod}
                onChange={(e) => setAssessmentMethod(e.target.value)}
                className="w-full bg-muted/20 border border-border/40 rounded-xl p-2.5 text-xs text-foreground font-semibold"
              >
                <option value="Nadi Pariksha & Clinical Exam">Nadi Pariksha & Clinical Examination</option>
                <option value="Physical & Diagnostic Profiling">Physical & Diagnostic Profiling</option>
                <option value="Standardized Prakriti Index">Standardized Prakriti Index Exam</option>
                <option value="Consensus Panel Review">Consensus Panel Review</option>
              </select>
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                Clinical Observation Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter clinical observations, pulse attributes, or diagnostic remarks..."
                className="w-full bg-muted/20 border border-border/40 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground font-bold py-3 text-xs shadow-md"
              disabled={submitting || !selectedPartId}
              onClick={handleSubmitAssessment}
            >
              {submitting ? "⟳ Submitting Evaluation..." : "✓ Submit Blind Evaluation"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}