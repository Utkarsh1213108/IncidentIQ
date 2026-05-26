"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchIncidents, fetchStats } from "@/lib/api";
import { Incident, Stats } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";

const SEVERITY_COLORS: Record<string, string> = {
  P1: "#ef4444", P2: "#f97316", P3: "#eab308", P4: "#22c55e"
};

const STATUS_COLORS: Record<string, string> = {
  active: "#ef4444", resolved: "#22c55e", investigating: "#f97316"
};

function SeverityBadge({ s }: { s: string }) {
  const colors: Record<string, string> = {
    P1: "bg-red-500/20 text-red-400 border-red-500/30",
    P2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    P3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    P4: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${colors[s] || "bg-slate-500/20 text-slate-400"}`}>
      {s}
    </span>
  );
}

function StatusBadge({ s }: { s: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1.5 ${s === "active" ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s === "active" ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
      {s}
    </span>
  );
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchIncidents(), fetchStats()])
      .then(([inc, st]) => { setIncidents(inc); setStats(st); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter((i) => {
    const matchFilter = filter === "all" || i.severity === filter || i.status === filter;
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.service.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const severityData = stats
    ? [
        { name: "P1", count: stats.by_severity.P1, fill: "#ef4444" },
        { name: "P2", count: stats.by_severity.P2, fill: "#f97316" },
        { name: "P3", count: stats.by_severity.P3, fill: "#eab308" },
      ]
    : [];

  const statusData = stats
    ? [
        { name: "Resolved", value: stats.by_status.resolved, fill: "#22c55e" },
        { name: "Active", value: stats.by_status.active, fill: "#ef4444" },
      ]
    : [];

  const trendData = incidents
    .filter(i => i.started_at)
    .slice(0, 8)
    .map(i => ({
      name: i.id,
      duration: i.duration_minutes || 0,
      users: Math.round(i.affected_users / 1000),
    }));

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/5 glass">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">IQ</div>
            <span className="font-semibold">IncidentIQ</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <span className="text-white font-medium">Dashboard</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AI Engine Online
          </div>
        </div>
      </header>

      <main className="relative z-10 px-8 py-8 max-w-7xl mx-auto">
        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Incidents", value: stats.total, sub: "all time", color: "text-blue-400" },
              { label: "Active Now", value: stats.by_status.active, sub: "needs attention", color: "text-red-400" },
              { label: "Users Impacted", value: stats.total_affected_users.toLocaleString(), sub: "total affected", color: "text-orange-400" },
              { label: "Avg MTTR", value: `${Math.round(stats.mttr_minutes)}m`, sub: "mean time to resolve", color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-5 border border-white/5">
                <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
                <div className="text-sm font-medium text-white">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Incidents by Severity</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={severityData} barSize={40}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Resolution Status</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Resolution Time (min)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="duration" stroke="#60a5fa" strokeWidth={2} dot={{ fill: "#60a5fa", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg glass border border-white/10 text-sm bg-transparent text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-64"
          />
          {["all", "P1", "P2", "P3", "active", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f ? "bg-blue-600 text-white" : "glass border border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500">{filtered.length} incidents</span>
        </div>

        {/* Incident list */}
        <div className="space-y-2">
          {loading && (
            <div className="glass rounded-xl p-8 border border-white/5 text-center text-slate-500">
              Loading incidents...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="glass rounded-xl p-8 border border-white/5 text-center text-slate-500">
              No incidents match your filters.
            </div>
          )}
          {filtered.map((inc) => (
            <Link key={inc.id} href={`/incident/${inc.id}`}>
              <div className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer group glass-hover">
                <div className="flex items-center gap-4 flex-wrap">
                  <SeverityBadge s={inc.severity} />
                  <span className="text-xs text-slate-500 font-mono">{inc.id}</span>
                  <span className="text-sm font-medium text-white flex-1 min-w-0">{inc.title}</span>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-slate-500 hidden md:block">{inc.service}</span>
                    <span className="text-xs text-slate-500 hidden md:block">
                      {inc.affected_users.toLocaleString()} users
                    </span>
                    <span className="text-xs text-slate-500 hidden md:block">
                      {inc.duration_minutes ? `${inc.duration_minutes}m` : "ongoing"}
                    </span>
                    <StatusBadge s={inc.status} />
                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Analyze →
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-16 line-clamp-1">{inc.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
