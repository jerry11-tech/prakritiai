import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function ResearchDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const json = await api.getResearchDashboard();
      setData(json);
    } catch (err) {
      console.warn("FastAPI backend error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const handleSyncExcel = async () => {
    setSyncing(true);
    try {
      await api.syncExcel();
      await fetchDashboardMetrics();
    } catch (err) {
      console.error("Excel sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadExcel = () => {
    window.open("http://127.0.0.1:8000/api/download-excel", "_blank");
  };

  if (loading || !data) {
    return (
      <section id="research" className="py-20 px-6 md:px-12 text-center bg-background border-b border-border/30">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Loading ML Validation Metrics & Dataset Summary...</p>
        </div>
      </section>
    );
  }

  const ds = data.datasetSummary;
  const ml = data.mlModelMetrics;
  const inter = data.interRaterAgreement;

  return (
    <section id="research" className="py-20 md:py-28 px-6 md:px-12 bg-background border-b border-border/30">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase mb-3">
            <span className="w-4 h-0.5 bg-accent rounded-full" />
            RESEARCH & MODEL VALIDATION DASHBOARD
            <span className="w-4 h-0.5 bg-accent rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight mb-2">
            Scientific Accuracy & Evaluation System
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Evaluates machine-learning models against independent expert ground-truth labels. Features non-circular $X \to y$ modeling, Stratified 5-Fold CV, and an untouched test dataset.
          </p>
        </div>

        {/* 1. Dataset Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="bg-card border border-border/40 rounded-2xl p-4">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Total Users</span>
            <span className="font-display font-black text-2xl text-foreground">{ds.totalParticipants}</span>
          </div>
          <div className="bg-card border border-accent/40 rounded-2xl p-4">
            <span className="text-[10px] text-accent uppercase font-bold block mb-1">Verified</span>
            <span className="font-display font-black text-2xl text-accent">{ds.verifiedParticipants}</span>
          </div>
          <div className="bg-card border border-chart-3/40 rounded-2xl p-4">
            <span className="text-[10px] text-chart-3 uppercase font-bold block mb-1">Pending</span>
            <span className="font-display font-black text-2xl text-chart-3">{ds.pendingVerification}</span>
          </div>
          <div className="bg-card border border-destructive/40 rounded-2xl p-4">
            <span className="text-[10px] text-destructive uppercase font-bold block mb-1">Re-Verify</span>
            <span className="font-display font-black text-2xl text-destructive">{ds.needsReverification}</span>
          </div>
          <div className="bg-card border border-primary/40 rounded-2xl p-4">
            <span className="text-[10px] text-primary uppercase font-bold block mb-1">Changes</span>
            <span className="font-display font-black text-2xl text-primary">{ds.totalChanges}</span>
          </div>
          <div className="bg-card border border-border/40 rounded-2xl p-4">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">V / P / K</span>
            <span className="font-display font-bold text-sm text-foreground">{ds.vataCount} / {ds.pittaCount} / {ds.kaphaCount}</span>
          </div>
          <div className="bg-card border border-border/40 rounded-2xl p-4">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Disagreements</span>
            <span className="font-display font-bold text-sm text-destructive">{ds.disagreementCount}</span>
          </div>
        </div>

        {/* 2. Automated Excel Synchronization Management Card */}
        <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">
                AUTOMATED EXCEL SYNCHRONIZATION ENGINE
              </span>
              <span className="text-[10px] font-bold text-accent bg-accent/15 border border-accent/30 rounded-full px-2 py-0.5">
                Prakriti_Verified_Data.xlsx
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Maintains 5 auto-synced sheets: <code className="text-foreground font-semibold">User_Data</code>, <code className="text-foreground font-semibold">Verified_Data</code>, <code className="text-foreground font-semibold">Change_History</code>, <code className="text-foreground font-semibold">Verification_Log</code>, <code className="text-foreground font-semibold">Summary</code>.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-primary/40 text-primary font-semibold"
              disabled={syncing}
              onClick={handleSyncExcel}
            >
              {syncing ? "⟳ Syncing..." : "⟳ Sync Excel Now"}
            </Button>
            <Button
              size="sm"
              className="text-xs bg-primary text-primary-foreground font-bold shadow-md"
              onClick={handleDownloadExcel}
            >
              📥 Download Verified Excel File
            </Button>
          </div>
        </div>

        {/* 3. ML Model Evaluation & Validation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Frozen Unseen Test Results */}
          <div className="lg:col-span-6 bg-card border border-accent/40 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <div>
                <span className="text-xs font-bold text-accent tracking-widest uppercase">
                  FROZEN UNSEEN TEST EVALUATION
                </span>
                <h3 className="font-display font-extrabold text-xl text-foreground">
                  {ml.modelName} Classifier ({ml.version})
                </h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                n_test = {ml.testSamples}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/20 border border-border/30 rounded-xl">
                <span className="text-[10px] text-muted-foreground block uppercase">Test Accuracy</span>
                <strong className="text-lg text-accent font-display font-extrabold">
                  {(ml.testAccuracy * 100).toFixed(2)}%
                </strong>
              </div>
              <div className="p-3 bg-muted/20 border border-border/30 rounded-xl">
                <span className="text-[10px] text-muted-foreground block uppercase">Macro F1</span>
                <strong className="text-lg text-primary font-display font-extrabold">
                  {ml.testF1Macro.toFixed(4)}
                </strong>
              </div>
              <div className="p-3 bg-muted/20 border border-border/30 rounded-xl">
                <span className="text-[10px] text-muted-foreground block uppercase">Cohen's Kappa</span>
                <strong className="text-lg text-chart-3 font-display font-extrabold">
                  {ml.cohensKappa.toFixed(4)}
                </strong>
              </div>
            </div>

            {/* Confusion Matrix Display */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Confusion Matrix (Actual Rows × Predicted Columns)
              </span>
              <div className="bg-muted/20 border border-border/40 rounded-xl p-4 overflow-x-auto text-xs">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground">
                      <th className="p-1.5 text-left">Actual \ Pred</th>
                      {ml.classNames.map((c: string) => (
                        <th key={c} className="p-1.5 font-bold">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ml.confusionMatrix.map((row: number[], rIdx: number) => (
                      <tr key={ml.classNames[rIdx]} className="border-b border-border/20 last:border-0">
                        <td className="p-1.5 font-bold text-left text-foreground">{ml.classNames[rIdx]}</td>
                        {row.map((val: number, cIdx: number) => (
                          <td
                            key={`${rIdx}-${cIdx}`}
                            className={`p-1.5 font-semibold ${
                              rIdx === cIdx ? "bg-accent/20 text-accent font-bold rounded-lg" : "text-muted-foreground"
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inter-Rater Reliability */}
            <div className="p-3.5 bg-muted/20 border border-border/40 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expert Inter-Rater Reliability (Fleiss' Kappa):</span>
                <strong className="text-accent">{inter.fleissKappa}</strong>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Multi-Assessed Subjects: {inter.totalMultiAssessed}</span>
                <span>Disagreements Flagged: {inter.disagreementCount}</span>
              </div>
            </div>
          </div>

          {/* Stratified 5-Fold CV & Candidate Model Comparison */}
          <div className="lg:col-span-6 bg-card border border-primary/30 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="border-b border-border/40 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase">
                  STRATIFIED 5-FOLD CROSS VALIDATION
                </span>
                <h3 className="font-display font-extrabold text-xl text-foreground">
                  Development Dataset Model Comparison
                </h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                n_dev = {ml.trainSamples}
              </span>
            </div>

            {/* Candidate Models CV Scores */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider block">
                Algorithm CV Performance (Development Split)
              </span>
              {Object.entries(ml.allModelCv || {}).map(([modelName, meanAcc]: [string, any]) => (
                <div
                  key={modelName}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    modelName === ml.modelName
                      ? "bg-primary/15 border-primary text-primary font-bold shadow-xs"
                      : "bg-muted/10 border-border/30 text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {modelName === ml.modelName && <span>⭐</span>}
                    {modelName}
                  </span>
                  <span>{(meanAcc * 100).toFixed(2)}% CV Acc</span>
                </div>
              ))}
            </div>

            {/* Top Discriminative Features */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Top Model Discriminative Features (Importance)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(ml.topFeatures || []).slice(0, 6).map((item: any) => (
                  <div key={item.feature} className="p-2.5 bg-muted/20 border border-border/30 rounded-xl flex justify-between">
                    <span className="text-muted-foreground font-mono text-[11px] truncate">{item.feature}</span>
                    <strong className="text-accent">{(item.importance * 100).toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}