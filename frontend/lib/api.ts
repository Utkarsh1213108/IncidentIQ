const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents/`);
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function fetchIncident(id: string) {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  if (!res.ok) throw new Error("Failed to fetch incident");
  return res.json();
}

export async function fetchLogs(id: string) {
  const res = await fetch(`${API_BASE}/incidents/${id}/logs`);
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/incidents/stats/summary`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function analyzeIncident(id: string) {
  const res = await fetch(`${API_BASE}/analyze/${id}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Analysis failed");

  return res.json();
}