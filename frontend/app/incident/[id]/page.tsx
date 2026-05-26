"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchIncident, fetchLogs, analyzeIncident } from "@/lib/api";
import { Incident, LogEntry, RCA } from "@/lib/types";

const LOG_COLORS: Record<string, string> = {
  INFO: "text-slate-400",
  WARN: "text-yellow-400",
  ERROR: "text-red-400",
  CRITICAL: "text-red-300 font-bold",
  DEBUG: "text-slate-600",
};

const TIMELINE_COLORS: Record<string, string> = {
  trigger: "bg-red-500",
  escalation: "bg-orange-500",
  detection: "bg-yellow-500",
  mitigation: "bg-blue-500",
  resolution: "bg-green-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const BLAST_COLORS: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

export default function IncidentPage() {
  const { id } = useParams() as { id: string };
  const [incident, setIncident] = useState<Incident | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rca, setRca] = useState<RCA | null>(null);
  const [postmortem, setPostmortem] = useState<string>("");
  const [tab, setTab] = useState<"overview" | "logs" | "rca" | "postmortem">("overview");
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingPm, setGeneratingPm] = useState(false);
  const [logFilter, setLogFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchIncident(id), fetchLogs(id)])
      .then(([inc, logData]) => {
        setIncident(inc);
        setLogs(logData.logs || []);
      })
      .catch(console.error);
  }, [id]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setError("");
    try {
      const result = await analyzeIncident(id);
      setRca(result.analysis);
      setTab("rca");
    } catch (e: any) {
      setError(e.message || "Analysis failed. Is the backend running?");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handlePostmortem() {
    if (!rca) return;
    setGeneratingPm(true);
    setError("");
    try {
      const result = await generatePostmortem(id, rca);
      setPostmortem(result.postmortem);
      setTab("postmortem");
    } catch (e: any) {
      setError(e.message || "Postmortem generation failed.");
    } finally {
      setGeneratingPm(false);
    }
  }

  const filteredLogs = logs.filter(l => logFilter === "all" || l.level === logFilter);

  if (!incident) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center text-slate-400">
        Loading incident...
      </div>
    );
  }

  const severityColor = { P1: "text-red-400 border-red-500/30 bg-red-500/10", P2: "text-orange-400 border-orange-500/30 bg-orange-500/10", P3: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" }[incident.severity] || "text-slate-400";

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/5 glass sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">← Dashboard</Link>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-blue-400 text-sm">{incident.id}</span>
        </div>
        <div className="flex items-center gap-3">
          {!rca ? (
            <button
              onClick={handleAnalyze}
              disabled={analyzing || logs.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>🔍 Run AI Analysis</>
              )}
            </button>
          ) : (
            <button
              onClick={handlePostmortem}
              disabled={generatingPm}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all font-medium disabled:opacity-50"
            >
              {generatingPm ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Postmortem...
                </>
              ) : (
                <>📋 Generate Postmortem</>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 px-8 py-8 max-w-7xl mx-auto">
        {/* Incident header */}
        <div className="glass rounded-xl p-6 border border-white/5 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className={`text-sm px-3 py-1 rounded-lg border font-mono font-bold ${severityColor}`}>{incident.severity}</span>
              <span className="text-slate-500 font-mono text-sm">{incident.id}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${incident.status === "active" ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${incident.status === "active" ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
              {incident.status}
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-3 mb-2">{incident.title}</h1>
          <p className="text-slate-400 text-sm mb-4">{incident.summary}</p>
          <div className="flex gap-6 flex-wrap text-sm">
            <div><span className="text-slate-500">Service: </span><span className="text-blue-400 font-mono">{incident.service}</span></div>
            <div><span className="text-slate-500">Started: </span><span className="text-slate-300">{new Date(incident.started_at).toLocaleString()}</span></div>
            <div><span className="text-slate-500">Duration: </span><span className="text-slate-300">{incident.duration_minutes ? `${incident.duration_minutes} min` : "Ongoing"}</span></div>
            <div><span className="text-slate-500">Affected Users: </span><span className="text-orange-400">{incident.affected_users.toLocaleString()}</span></div>
            <div><span className="text-slate-500">Error Rate: </span><span className="text-red-400">{incident.error_rate}%</span></div>
          </div>
          <div className="flex gap-2 mt-3">
            {incident.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{tag}</span>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass rounded-xl p-1 border border-white/5 w-fit">
          {(["overview", "logs", "rca", "postmortem"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {t === "rca" ? "🔍 Root Cause" : t === "postmortem" ? "📋 Postmortem" : t === "logs" ? "📜 Logs" : "📊 Overview"}
              {t === "rca" && rca && <span className="ml-1 w-2 h-2 rounded-full bg-green-400 inline-block" />}
              {t === "postmortem" && postmortem && <span className="ml-1 w-2 h-2 rounded-full bg-green-400 inline-block" />}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="font-semibold mb-4 text-slate-200">Incident Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: "Error Rate", value: `${incident.error_rate}%`, bar: incident.error_rate, color: "bg-red-500" },
                  { label: "Users Affected", value: incident.affected_users.toLocaleString(), bar: Math.min(incident.affected_users / 1000, 100), color: "bg-orange-500" },
                  { label: "Duration", value: incident.duration_minutes ? `${incident.duration_minutes}min` : "Ongoing", bar: Math.min((incident.duration_minutes || 180) / 2, 100), color: "bg-blue-500" },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="text-white font-medium">{m.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.bar}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="font-semibold mb-4 text-slate-200">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={handleAnalyze} disabled={analyzing} className="w-full p-3 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all text-sm font-medium text-left">
                  {analyzing ? "🔄 Analyzing..." : "🔍 Run AI Root Cause Analysis"}
                </button>
                <button onClick={handlePostmortem} disabled={!rca || generatingPm} className="w-full p-3 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 transition-all text-sm font-medium text-left disabled:opacity-40">
                  {generatingPm ? "📝 Generating..." : "📋 Auto-generate Postmortem"}
                  {!rca && <span className="ml-2 text-slate-500 text-xs">(run analysis first)</span>}
                </button>
                <button onClick={() => setTab("logs")} className="w-full p-3 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/8 transition-all text-sm font-medium text-left">
                  📜 View Raw Logs ({logs.length} entries)
                </button>
              </div>
            </div>

            {rca && (
              <div className="md:col-span-2 glass rounded-xl p-6 border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h3 className="font-semibold text-blue-300">AI Analysis Available</h3>
                  <span className="ml-auto text-xs text-slate-500">Confidence: {rca.confidence_score}%</span>
                </div>
                <p className="text-slate-300 text-sm mb-3"><strong className="text-white">Root Cause:</strong> {rca.root_cause}</p>
                <button onClick={() => setTab("rca")} className="text-sm text-blue-400 hover:text-blue-300">
                  View full analysis →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Logs tab */}
        {tab === "logs" && (
          <div className="glass rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <span className="text-sm text-slate-400">{filteredLogs.length} entries</span>
              <div className="flex gap-2 ml-auto">
                {["all", "INFO", "WARN", "ERROR", "CRITICAL"].map(l => (
                  <button key={l} onClick={() => setLogFilter(l)}
                    className={`text-xs px-2 py-1 rounded font-mono transition-all ${logFilter === l ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-auto max-h-[600px] p-4 space-y-1 font-mono">
              {filteredLogs.map((log, i) => (
                <div key={i} className="log-entry flex gap-3 py-1 hover:bg-white/2 rounded px-2 transition-colors">
                  <span className="text-slate-600 shrink-0 w-20 truncate">{log.timestamp.split("T")[1]?.replace("Z", "")}</span>
                  <span className={`shrink-0 w-14 ${LOG_COLORS[log.level]}`}>[{log.level}]</span>
                  <span className="text-blue-400/70 shrink-0 w-28 truncate">[{log.service}]</span>
                  <span className="text-slate-400 shrink-0 w-36 truncate hidden lg:block">[{log.host}]</span>
                  <span className={`${LOG_COLORS[log.level]}`}>{log.message}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center text-slate-500 py-8">No logs for this filter. Try connecting the backend!</div>
              )}
            </div>
          </div>
        )}

        {/* RCA tab */}
        {tab === "rca" && (
          <div>
            {!rca ? (
              <div className="glass rounded-xl p-12 border border-white/5 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-semibold text-lg mb-2">No analysis yet</h3>
                <p className="text-slate-400 text-sm mb-6">Click "Run AI Analysis" to analyze this incident with Claude</p>
                <button onClick={handleAnalyze} disabled={analyzing || logs.length === 0} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all font-medium disabled:opacity-50">
                  {analyzing ? "Analyzing..." : logs.length === 0 ? "No logs available" : "Run AI Analysis"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Root cause */}
                <div className="glass rounded-xl p-6 border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-400 text-lg">🎯</span>
                    <h3 className="font-bold text-red-300">Root Cause</h3>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {rca.confidence_score}% confidence
                    </span>
                  </div>
                  <p className="text-white font-medium mb-3">{rca.root_cause}</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{rca.root_cause_detail}</p>
                  <div className="mt-4 flex gap-4 text-sm flex-wrap">
                    <div><span className="text-slate-500">Trigger: </span><span className="text-orange-400">{rca.trigger_event}</span></div>
                    <div><span className="text-slate-500">Pattern: </span><span className="text-purple-400">{rca.similar_incident_pattern}</span></div>
                    <div><span className="text-slate-500">Blast Radius: </span><span className={BLAST_COLORS[rca.blast_radius] || "text-white"}>{rca.blast_radius}</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contributing factors */}
                  <div className="glass rounded-xl p-6 border border-white/5">
                    <h3 className="font-semibold mb-4 text-slate-200">Contributing Factors</h3>
                    <ul className="space-y-2">
                      {rca.contributing_factors.map((f, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-orange-400 shrink-0">▸</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Affected systems */}
                  <div className="glass rounded-xl p-6 border border-white/5">
                    <h3 className="font-semibold mb-4 text-slate-200">Affected Systems</h3>
                    <div className="flex flex-wrap gap-2">
                      {rca.affected_systems.map(s => (
                        <span key={s} className="text-sm px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4">
                      <span className="text-slate-500 text-sm">Detection Gap: </span>
                      <span className="text-yellow-400 text-sm">{rca.detection_gap_minutes} minutes</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">{rca.impact_summary}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="glass rounded-xl p-6 border border-white/5">
                  <h3 className="font-semibold mb-5 text-slate-200">Incident Timeline</h3>
                  <div className="space-y-3 relative">
                    <div className="absolute left-[17px] top-2 bottom-2 w-px bg-white/10" />
                    {rca.timeline.map((t, i) => (
                      <div key={i} className="flex gap-4 pl-2">
                        <div className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 z-10 ${TIMELINE_COLORS[t.type] || "bg-slate-500"}`} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-slate-500">{t.time}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${TIMELINE_COLORS[t.type] || "bg-slate-500"}/20 text-white/70`}>{t.type}</span>
                          </div>
                          <p className="text-sm text-slate-300 mt-0.5">{t.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prevention actions */}
                <div className="glass rounded-xl p-6 border border-white/5">
                  <h3 className="font-semibold mb-4 text-slate-200">Prevention Actions</h3>
                  <div className="space-y-3">
                    {rca.prevention_actions.map((a, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                        <span className={`text-xs px-2 py-0.5 rounded border shrink-0 h-fit ${PRIORITY_COLORS[a.priority]}`}>{a.priority}</span>
                        <div>
                          <p className="text-sm text-white">{a.action}</p>
                          <span className="text-xs text-slate-500 mt-0.5">{a.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remediation steps */}
                <div className="glass rounded-xl p-6 border border-white/5">
                  <h3 className="font-semibold mb-4 text-slate-200">Remediation Steps Taken</h3>
                  <div className="space-y-3">
                    {rca.remediation_steps.map((s) => (
                      <div key={s.step} className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-xs flex items-center justify-center shrink-0 font-bold">{s.step}</span>
                        <div>
                          <p className="text-sm text-white">{s.action}</p>
                          <p className="text-xs text-green-400 mt-0.5">→ {s.result}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Postmortem tab */}
        {tab === "postmortem" && (
          <div>
            {!postmortem ? (
              <div className="glass rounded-xl p-12 border border-white/5 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="font-semibold text-lg mb-2">No postmortem yet</h3>
                <p className="text-slate-400 text-sm mb-6">{rca ? "Generate a production-ready postmortem document" : "Run AI analysis first, then generate postmortem"}</p>
                <button onClick={handlePostmortem} disabled={!rca || generatingPm} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all font-medium disabled:opacity-50">
                  {generatingPm ? "Generating..." : !rca ? "Run Analysis First" : "Generate Postmortem"}
                </button>
              </div>
            ) : (
              <div className="glass rounded-xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <span className="text-sm text-slate-400">Postmortem — {incident.id}</span>
                  <button
                    onClick={() => {
                      const blob = new Blob([postmortem], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `postmortem-${id}.md`;
                      a.click();
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
                  >
                    ↓ Download .md
                  </button>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap overflow-auto max-h-[800px]">
                  {postmortem}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
