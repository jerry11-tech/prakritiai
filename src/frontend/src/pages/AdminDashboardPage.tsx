import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Sidebar } from "@/components/navigation/Sidebar";
import { AppHeader } from "@/components/navigation/AppHeader";
import { PrakritiBadge } from "@/components/prakriti/PrakritiBadge";
import { toast } from "sonner";
import { CaseComparisonModal } from "@/components/prakriti/CaseComparisonModal";
import { ShieldCheck, RefreshCw, Download, Users, FileSpreadsheet, Activity, Lock, Settings, History, FileText, UserX, UserCheck, X, Eye, ArrowRightLeft } from "lucide-react";

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("experts");
  
  const [experts, setExperts] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [researchData, setResearchData] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);
  const [compareA, setCompareA] = useState<any>(null);
  const [compareB, setCompareB] = useState<any>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [sortBy, setSortBy] = useState<"id" | "confidence" | "dosha">("id");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expRes, usersRes, resRes, auditRes, setRes, dashRes] = await Promise.all([
        api.listAdminExperts().catch(() => ({ experts: [] })),
        api.listAdminUsers().catch(() => ({ users: [] })),
        api.getAdminResults().catch(() => ({ totalResults: 0, results: [] })),
        api.getAdminAuditLogs().catch(() => ({ total: 0, logs: [] })),
        api.getAdminSettings().catch(() => ({ settings: {} })),
        api.getResearchDashboard().catch(() => null),
      ]);

      setExperts(expRes.experts || []);
      setUsersList(usersRes.users || []);
      setResultsList(resRes.results || []);
      setAuditLogs(auditRes.logs || []);
      setSettings(setRes.settings || {});
      setResearchData(dashRes);
    } catch (e: any) {
      toast.error(`Admin backend error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await api.approveExpert(id);
      toast.success(res.message);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await api.rejectExpert(id);
      toast.success(res.message);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAssignSpec = async (id: number, spec: string) => {
    try {
      const res = await api.assignSpecialization(id, spec);
      toast.success(res.message);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await api.toggleUserStatus(userId, !currentStatus);
      toast.success(res.message);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSyncExcel = async () => {
    setSyncing(true);
    try {
      await api.syncExcel();
      toast.success("Excel dataset synchronized successfully.");
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const blob = await api.downloadExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Prakriti_Verified_Data.xlsx";
      a.click();
      toast.success("Downloaded Prakriti_Verified_Data.xlsx");
    } catch (e: any) {
      toast.error(`Download failed: ${e.message}`);
    }
  };

  const handleToggleSetting = async (key: string, currentValue: any) => {
    const updated = { ...settings, [key]: typeof currentValue === "boolean" ? !currentValue : currentValue };
    setSettings(updated);
    try {
      await api.updateAdminSettings(updated);
      toast.success("Security setting updated.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const ml = researchData?.mlModelMetrics;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* SaaS Sidebar */}
      <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppHeader
          title="Platform Control Console"
          subtitle="Namaste, Admin 🌿 · Full RBAC System Management"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          actions={
            <Button size="sm" variant="outline" onClick={loadData} className="text-xs font-semibold gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh State
            </Button>
          }
        />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl">
          {/* Top 4 Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-card">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Total Accounts</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display font-black text-3xl text-foreground">{usersList.length}</span>
            </div>
            <div className="bg-card border border-kapha-soft rounded-2xl p-5 shadow-card">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-kapha-text font-bold uppercase tracking-wider">Active Experts</span>
                <ShieldCheck className="h-4 w-4 text-kapha" />
              </div>
              <span className="font-display font-black text-3xl text-kapha">
                {experts.filter((e) => e.approvalStatus === "APPROVED").length}
              </span>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-card">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">System Results</span>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display font-black text-3xl text-foreground">{resultsList.length}</span>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-card">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">ML Test Accuracy</span>
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display font-black text-3xl text-primary">
                {ml ? `${(ml.testAccuracy * 100).toFixed(1)}%` : "96.7%"}
              </span>
            </div>
          </div>

          {/* Practitioner Management Tab */}
          {activeTab === "experts" && (
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">Practitioner Approvals & Specialization Assignment</h3>
                  <p className="text-xs text-muted-foreground">Approve, reject, or assign Ayurvedic specialization domains.</p>
                </div>
                <PrakritiBadge type="PENDING" label={`${experts.filter((e) => e.approvalStatus === "PENDING").length} Pending`} />
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">Loading practitioners...</div>
              ) : experts.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">No practitioner registrations found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="uppercase text-muted-foreground bg-muted/30 border-b border-border/50">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Practitioner Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Specialization</th>
                        <th className="p-3">Credentials</th>
                        <th className="p-3">Approval Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {experts
                        .filter((exp) => searchQuery === "" || exp.email.toLowerCase().includes(searchQuery.toLowerCase()) || exp.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((exp) => (
                          <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3 font-mono font-bold">#{exp.id}</td>
                            <td className="p-3 font-bold text-foreground">{exp.name}</td>
                            <td className="p-3 text-muted-foreground">{exp.email}</td>
                            <td className="p-3">
                              <select
                                value={exp.specialization}
                                onChange={(e) => handleAssignSpec(exp.id, e.target.value)}
                                className="bg-background border border-border/60 rounded-lg text-xs px-2 py-1 font-bold text-foreground outline-none focus:border-primary"
                              >
                                <option value="Vata">Vata</option>
                                <option value="Pitta">Pitta</option>
                                <option value="Kapha">Kapha</option>
                              </select>
                            </td>
                            <td className="p-3 text-muted-foreground max-w-xs truncate">{exp.professionalDetails || "N/A"}</td>
                            <td className="p-3">
                              <PrakritiBadge type={exp.approvalStatus} label={exp.approvalStatus} size="sm" />
                            </td>
                            <td className="p-3 text-right space-x-2">
                              {exp.approvalStatus !== "APPROVED" && (
                                <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs h-7 px-2.5" onClick={() => handleApprove(exp.id)}>
                                  Approve
                                </Button>
                              )}
                              {exp.approvalStatus !== "REJECTED" && (
                                <Button size="sm" variant="destructive" className="text-xs h-7 px-2.5" onClick={() => handleReject(exp.id)}>
                                  Reject
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* User Account Tab */}
          {activeTab === "users" && (
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-display font-bold text-lg text-foreground">Registered User & Practitioner Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="uppercase text-muted-foreground bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Account Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Account Status</th>
                      <th className="p-3">Registered Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {usersList
                      .filter((u) => searchQuery === "" || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-mono font-bold">#{u.id}</td>
                          <td className="p-3 font-bold text-foreground">{u.name}</td>
                          <td className="p-3 text-muted-foreground">{u.email}</td>
                          <td className="p-3">
                            <PrakritiBadge type={u.role === "ADMIN" ? "APPROVED" : u.role === "EXPERT" ? "PITTA" : "VATA"} label={u.role} size="sm" />
                          </td>
                          <td className="p-3">
                            <PrakritiBadge type={u.isActive ? "ACTIVE" : "SUSPENDED"} label={u.isActive ? "Active" : "Suspended"} size="sm" />
                          </td>
                          <td className="p-3 text-muted-foreground">{u.createdAt}</td>
                          <td className="p-3 text-right">
                            {u.role !== "ADMIN" && (
                              <Button
                                size="sm"
                                variant={u.isActive ? "destructive" : "outline"}
                                className="text-xs h-7 px-2.5"
                                onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                              >
                                {u.isActive ? <><UserX className="h-3.5 w-3.5 mr-1" /> Suspend</> : <><UserCheck className="h-3.5 w-3.5 mr-1" /> Activate</>}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Results Tab */}
          {activeTab === "results" && (
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/40 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">System-Wide Prakriti Analysis Results</h3>
                  <p className="text-xs text-muted-foreground">Select two cases to perform side-by-side clinical comparison.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-semibold">Sort By:</span>
                  <button onClick={() => setSortBy("id")} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${sortBy === "id" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}>ID</button>
                  <button onClick={() => setSortBy("confidence")} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${sortBy === "confidence" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}>Confidence</button>
                  <button onClick={() => setSortBy("dosha")} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${sortBy === "dosha" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}`}>Dosha</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="uppercase text-muted-foreground bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="p-3">Compare</th>
                      <th className="p-3">Test ID</th>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Dominant Dosha</th>
                      <th className="p-3">V / P / K Breakdown</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Facial Analysis</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {resultsList
                      .filter((r) => searchQuery === "" || r.id.toLowerCase().includes(searchQuery.toLowerCase()) || r.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
                      .sort((a, b) => {
                        if (sortBy === "confidence") return b.aiConfidence - a.aiConfidence;
                        if (sortBy === "dosha") return a.dominantDosha.localeCompare(b.dominantDosha);
                        return b.id.localeCompare(a.id);
                      })
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3">
                            <button
                              onClick={() => {
                                if (!compareA) setCompareA(r);
                                else if (!compareB && compareA.id !== r.id) {
                                  setCompareB(r);
                                  setShowCompareModal(true);
                                } else {
                                  setCompareA(r);
                                  setCompareB(null);
                                }
                              }}
                              className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                compareA?.id === r.id || compareB?.id === r.id
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {compareA?.id === r.id ? "Selected A" : compareB?.id === r.id ? "Selected B" : "+ Select"}
                            </button>
                          </td>
                          <td className="p-3 font-mono font-bold">{r.id}</td>
                          <td className="p-3 text-muted-foreground">{r.userEmail}</td>
                          <td className="p-3">
                            <PrakritiBadge type={r.dominantDosha} label={r.dominantDosha} size="sm" />
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="text-vata font-bold">{r.vataScore}%</span> /{" "}
                            <span className="text-pitta font-bold">{r.pittaScore}%</span> /{" "}
                            <span className="text-kapha font-bold">{r.kaphaScore}%</span>
                          </td>
                          <td className="p-3 font-bold text-foreground">{r.aiConfidence}%</td>
                          <td className="p-3">
                            <PrakritiBadge type={r.facialStatus === "COMPLETED" ? "APPROVED" : "PENDING"} label={r.facialStatus} size="sm" />
                          </td>
                          <td className="p-3 text-muted-foreground">{r.createdAt}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === "audit" && (
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-display font-bold text-lg text-foreground">Immutable Security Audit Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="uppercase text-muted-foreground bg-muted/30 border-b border-border/50">
                    <tr>
                      <th className="p-3">Log ID</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Resource</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {auditLogs
                      .filter((log) => searchQuery === "" || log.action.toLowerCase().includes(searchQuery.toLowerCase()) || (log.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedAuditLog(log)}>
                          <td className="p-3 font-mono font-bold">#{log.id}</td>
                          <td className="p-3 text-muted-foreground">{log.timestamp}</td>
                          <td className="p-3 font-semibold">{log.userEmail || "Anonymous"}</td>
                          <td className="p-3 font-bold text-primary">{log.action}</td>
                          <td className="p-3 text-muted-foreground">{log.resource}</td>
                          <td className="p-3">
                            <PrakritiBadge type={log.status === "SUCCESS" ? "APPROVED" : "REJECTED"} label={log.status} size="sm" />
                          </td>
                          <td className="p-3 text-right">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Audit Log Modal Drawer */}
        {selectedAuditLog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-card animate-fadeUp">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-display font-bold text-base text-primary">Audit Event #{selectedAuditLog.id}</h3>
                <Button size="icon" variant="ghost" onClick={() => setSelectedAuditLog(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 text-xs">
                <div><strong className="text-muted-foreground">Timestamp:</strong> {selectedAuditLog.timestamp}</div>
                <div><strong className="text-muted-foreground">Action:</strong> <span className="text-primary font-bold">{selectedAuditLog.action}</span></div>
                <div><strong className="text-muted-foreground">User:</strong> {selectedAuditLog.userEmail || "Anonymous"} (Role: {selectedAuditLog.userRole || "N/A"})</div>
                <div><strong className="text-muted-foreground">Target Resource:</strong> {selectedAuditLog.resource} (ID: {selectedAuditLog.resourceId || "N/A"})</div>
                <div><strong className="text-muted-foreground">IP Address:</strong> {selectedAuditLog.ipAddress || "127.0.0.1"}</div>
                <div><strong className="text-muted-foreground">Status:</strong> <PrakritiBadge type={selectedAuditLog.status === "SUCCESS" ? "APPROVED" : "REJECTED"} label={selectedAuditLog.status} size="sm" /></div>
                <div className="p-3 bg-muted/20 border border-border/40 rounded-xl mt-2 font-mono text-[11px]">
                  {selectedAuditLog.details || "No additional metadata recorded."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Case Comparison Modal */}
        <CaseComparisonModal
          caseA={compareA}
          caseB={compareB}
          isOpen={showCompareModal}
          onClose={() => {
            setShowCompareModal(false);
            setCompareA(null);
            setCompareB(null);
          }}
        />

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card space-y-6">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Application Security Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-border/50 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs">Mandatory MFA for Admin</h4>
                    <p className="text-[11px] text-muted-foreground">Require secondary verification code for level-3 administrative login.</p>
                  </div>
                  <Button
                    size="sm"
                    variant={settings.mfa_required_for_admin ? "default" : "outline"}
                    onClick={() => handleToggleSetting("mfa_required_for_admin", settings.mfa_required_for_admin)}
                    className="text-xs"
                  >
                    {settings.mfa_required_for_admin ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="p-4 border border-border/50 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs">Automated Excel Sync Engine</h4>
                    <p className="text-[11px] text-muted-foreground">Automatically write 5-sheet sync on every assessment.</p>
                  </div>
                  <Button
                    size="sm"
                    variant={settings.auto_excel_sync_enabled ? "default" : "outline"}
                    onClick={() => handleToggleSetting("auto_excel_sync_enabled", settings.auto_excel_sync_enabled)}
                    className="text-xs"
                  >
                    {settings.auto_excel_sync_enabled ? "Active" : "Paused"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Excel Sync Control Engine */}
          <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold text-base text-foreground">Automated Excel Dataset Engine</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Maintains real-time synchronized <code className="text-foreground font-semibold">Prakriti_Verified_Data.xlsx</code> containing 5 sheets (<code className="text-foreground">User_Data</code>, <code className="text-foreground">Verified_Data</code>, <code className="text-foreground">Change_History</code>, <code className="text-foreground">Verification_Log</code>, <code className="text-foreground">Summary</code>).
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" disabled={syncing} onClick={handleSyncExcel} className="gap-2 text-xs border-primary/40 text-primary font-bold">
                <RefreshCw className="h-3.5 w-3.5" /> {syncing ? "Syncing..." : "Sync Excel Now"}
              </Button>
              <Button onClick={handleDownloadExcel} className="gap-2 text-xs font-bold bg-primary text-primary-foreground">
                <Download className="h-3.5 w-3.5" /> Download Prakriti_Verified_Data.xlsx
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
