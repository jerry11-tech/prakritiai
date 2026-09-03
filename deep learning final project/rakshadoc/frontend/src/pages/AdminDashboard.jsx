import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Users, FileText, Layers, Activity, Search, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes] = await Promise.all([
        axios.get('/api/v1/admin/metrics'),
        axios.get('/api/v1/admin/users')
      ]);
      setMetrics(mRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading Admin Metrics & Audit Logs...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl card">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Admin Control Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              System analytics, user management, layout taxonomy distribution & audit logs
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-lg card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Registered Users</span>
            <span className="text-3xl font-black text-slate-100 mt-1 block">{metrics?.total_users || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-lg card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Scanned Documents</span>
            <span className="text-3xl font-black text-slate-100 mt-1 block">{metrics?.total_documents || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-lg card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Layout Elements Segmented</span>
            <span className="text-3xl font-black text-slate-100 mt-1 block">{metrics?.total_layout_elements || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Breakdown & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Layout Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-xl card space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Detected Taxonomy Breakdown
          </h3>

          <div className="space-y-2.5">
            {metrics?.categories_breakdown && Object.entries(metrics.categories_breakdown).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 text-xs">
                <span className="font-semibold text-slate-200">{cat}</span>
                <span className="font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  {count} regions
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs & User List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-xl card space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            System Audit Log Activity
          </h3>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {metrics?.recent_activity?.map(log => (
              <div key={log.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">{log.action}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
