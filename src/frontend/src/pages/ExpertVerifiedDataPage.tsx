import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft, Download, CheckCircle, Shield } from "lucide-react";

export function ExpertVerifiedDataPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVerifiedData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = async () => {
    try {
      const blob = await api.downloadPdfReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prakritiai_${user?.specialization}_verified_report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF download failed", e);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading verified dataset...</p>
        </div>
      </div>
    );
  }

  const verifiedList = data.verified || [];
  const stats = data.stats || { totalReviewed: 0, verified: 0, incorrect: 0, verificationRate: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/expert/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-xs bg-accent/15 text-accent px-2.5 py-0.5 rounded-full font-bold uppercase">
            {user?.specialization} SPECIALIZATION
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl">Verified Dataset</h1>
            <p className="text-muted-foreground text-sm">Official research dataset of verified {user?.specialization}-dominant tests.</p>
          </div>
          <Button onClick={handleDownloadPdf} className="gap-2 font-bold">
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8 max-w-2xl">
          <div className="bg-card border border-border/40 rounded-2xl p-5 text-center">
            <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Total Reviewed</span>
            <span className="font-display font-black text-2xl">{stats.totalReviewed}</span>
          </div>
          <div className="bg-card border border-green/40 rounded-2xl p-5 text-center">
            <span className="text-xs text-green uppercase font-bold block mb-1">Verified</span>
            <span className="font-display font-black text-2xl text-green">{stats.verified}</span>
          </div>
          <div className="bg-card border border-border/40 rounded-2xl p-5 text-center">
            <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">Verification Rate</span>
            <span className="font-display font-black text-2xl text-primary">{stats.verificationRate}%</span>
          </div>
        </div>

        {/* Verified Table */}
        <div className="bg-card border border-border/40 rounded-3xl p-6">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green" />
            Verified Results Only ({verifiedList.length})
          </h3>

          {verifiedList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No verified results found for {user?.specialization} specialization yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/20 border-b border-border/40">
                  <tr>
                    <th className="p-3">Test ID</th>
                    <th className="p-3">Dominant Dosha</th>
                    <th className="p-3">Scores</th>
                    <th className="p-3">AI Confidence</th>
                    <th className="p-3">Verified At</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {verifiedList.map((item: any) => (
                    <tr key={item.test_id}>
                      <td className="p-3 font-mono font-bold text-xs">{item.test_id}</td>
                      <td className="p-3 font-semibold">{item.dominant_dosha}</td>
                      <td className="p-3 text-xs">V:{item.scores.Vata}% P:{item.scores.Pitta}% K:{item.scores.Kapha}%</td>
                      <td className="p-3">{item.ai_confidence}%</td>
                      <td className="p-3 text-xs text-muted-foreground">{item.verified_at}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green/15 text-green border border-green/30">
                          ✓ Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}