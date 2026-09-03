import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/navigation/Sidebar";
import { AppHeader } from "@/components/navigation/AppHeader";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { PrakritiDistribution } from "@/components/prakriti/PrakritiDistribution";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Clock, FileText, RefreshCw } from "lucide-react";

export function ExpertDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dbData, testsData] = await Promise.all([
        api.getExpertDashboard(),
        api.listExpertTests(filter),
      ]);
      setDashboard(dbData);
      setTests(testsData.tests || []);
    } catch (e: any) {
      if (e.message?.includes("401") || e.message?.includes("403")) {
        logout();
        navigate({ to: "/expert/login" });
      } else {
        toast.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  if (!user || (user.role !== "EXPERT" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-card border border-border p-8 rounded-3xl space-y-4">
          <Shield className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="font-display font-bold text-2xl">Practitioner Access Required</h2>
          <p className="text-muted-foreground text-xs">Please log in with an approved practitioner account.</p>
          <Link to="/expert/login">
            <Button className="w-full text-xs font-bold bg-primary text-primary-foreground">Go to Expert Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || { totalTests: 0, pending: 0, verified: 0, incorrect: 0 };
  const spec = user.specialization || "Vata";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* SaaS Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppHeader
          title={`Practitioner Workspace — ${spec} Specialization`}
          subtitle={`Welcome, ${user.name} · Domain: ${spec}`}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          actions={
            <Button size="sm" variant="outline" onClick={loadData} className="text-xs font-semibold gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
            </Button>
          }
        />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-card">
              <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">Assigned Cases</span>
              <span className="font-display font-black text-3xl text-foreground">{stats.totalTests}</span>
            </div>
            <div className="bg-card border border-pitta-soft rounded-2xl p-5 shadow-card">
              <span className="text-[11px] text-pitta-text font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Pending Reviews
              </span>
              <span className="font-display font-black text-3xl text-pitta">{stats.pending}</span>
            </div>
            <div className="bg-card border border-kapha-soft rounded-2xl p-5 shadow-card">
              <span className="text-[11px] text-kapha-text font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Verified Correct
              </span>
              <span className="font-display font-black text-3xl text-kapha">{stats.verified}</span>
            </div>
            <div className="bg-card border border-red-200 rounded-2xl p-5 shadow-card">
              <span className="text-[11px] text-red-700 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Rejected / Incorrect
              </span>
              <span className="font-display font-black text-3xl text-red-600">{stats.incorrect}</span>
            </div>
          </div>

          {/* Test Case Table */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/40 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">{spec.toUpperCase()} DOMAIN CLINICAL CASES</h3>
                <p className="text-xs text-muted-foreground">Select a case to perform independent blind ground-truth assessment.</p>
              </div>

              <div className="flex gap-1.5">
                {["ALL", "PENDING", "VERIFIED", "INCORRECT"].map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "default" : "outline"}
                    onClick={() => setFilter(f)}
                    className="text-xs h-8"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-muted-foreground">Loading assigned clinical cases...</div>
            ) : tests.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground">No clinical cases match the current filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="uppercase text-muted-foreground bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="p-3">Case ID</th>
                      <th className="p-3">AI Prediction</th>
                      <th className="p-3 font-mono">V / P / K Breakdown</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Facial Photo</th>
                      <th className="p-3">Verdict Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {tests
                      .filter((t) =>
                        searchQuery.trim() === ""
                          ? true
                          : t.test_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.dominant_dosha.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((t) => (
                        <tr key={t.test_id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-mono font-bold">{t.test_id}</td>
                          <td className="p-3">
                            <PrakritiBadge type={t.dominant_dosha} label={t.dominant_dosha} size="sm" />
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="text-vata font-bold">{t.scores.Vata}%</span> /{" "}
                            <span className="text-pitta font-bold">{t.scores.Pitta}%</span> /{" "}
                            <span className="text-kapha font-bold">{t.scores.Kapha}%</span>
                          </td>
                          <td className="p-3 font-bold text-foreground">{t.ai_confidence}%</td>
                          <td className="p-3">
                            <PrakritiBadge
                              type={t.facial_analysis_status === "COMPLETED" ? "APPROVED" : "PENDING"}
                              label={t.facial_analysis_status}
                              size="sm"
                            />
                          </td>
                          <td className="p-3">
                            <PrakritiBadge type={t.status} label={t.status} size="sm" />
                          </td>
                          <td className="p-3 text-right">
                            <Link to="/expert/review/$testId" params={{ testId: t.test_id }}>
                              <Button size="sm" variant="outline" className="text-xs h-7 px-3 border-border">
                                {t.status === "PENDING" ? "Review Case →" : "View Details"}
                              </Button>
                            </Link>
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
    </div>
  );
}
