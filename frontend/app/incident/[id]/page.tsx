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

export default function IncidentPage() {
  const { id } = useParams() as { id: string };

  const [incident, setIncident] = useState<Incident | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rca, setRca] = useState<RCA | null>(null);

  const [tab, setTab] = useState<"overview" | "logs" | "rca">("overview");

  const [analyzing, setAnalyzing] = useState(false);
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
      setError(e.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  const filteredLogs = logs.filter(
    (l) => logFilter === "all" || l.level === logFilter
  );

  if (!incident) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Link href="/" className="text-blue-400">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-2">
        {incident.title}
      </h1>

      <p className="text-slate-400 mb-6">
        Severity: {incident.severity}
      </p>

      {error && (
        <div className="bg-red-500/20 border border-red-500 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("overview")}
          className="px-4 py-2 bg-slate-800 rounded"
        >
          Overview
        </button>

        <button
          onClick={() => setTab("logs")}
          className="px-4 py-2 bg-slate-800 rounded"
        >
          Logs
        </button>

        <button
          onClick={() => setTab("rca")}
          className="px-4 py-2 bg-slate-800 rounded"
        >
          RCA
        </button>
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <p>Status: {incident.status}</p>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            {analyzing ? "Analyzing..." : "Run AI Analysis"}
          </button>
        </div>
      )}

      {tab === "logs" && (
        <div>
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 p-2 rounded mb-4"
          >
            <option value="all">All</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <div className="space-y-2">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className="bg-slate-900 p-3 rounded border border-slate-800"
              >
                <span className={LOG_COLORS[log.level]}>
                  [{log.level}]
                </span>{" "}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "rca" && (
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          {rca ? (
            <div>
              <h2 className="text-xl font-bold mb-3">
                Root Cause Analysis
              </h2>

              <p>{rca.rootCause}</p>
            </div>
          ) : (
            <p>No analysis yet.</p>
          )}
        </div>
      )}
    </div>
  );
}