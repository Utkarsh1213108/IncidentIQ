"use client";

import { useMemo, useState } from "react";

const incidentsData = [
  {
    id: "INC-001",
    title: "Payment Service Database Connection Pool Exhaustion",
    severity: "P1",
    status: "resolved",
    service: "payment-service",
    affected_users: 47832,
    duration_minutes: 93,
  },
  {
    id: "INC-002",
    title: "CDN Cache Stampede - Product Images 503",
    severity: "P2",
    status: "resolved",
    service: "cdn-service",
    affected_users: 12400,
    duration_minutes: 43,
  },
  {
    id: "INC-003",
    title: "Auth Service JWT Secret Rotation Failure",
    severity: "P1",
    status: "resolved",
    service: "auth-service",
    affected_users: 89210,
    duration_minutes: 47,
  },
  {
    id: "INC-004",
    title: "Kubernetes Node Memory Pressure OOMKill Cascade",
    severity: "P2",
    status: "resolved",
    service: "k8s-cluster",
    affected_users: 31500,
    duration_minutes: 97,
  },
  {
    id: "INC-005",
    title: "Search Elasticsearch Index Corruption",
    severity: "P2",
    status: "resolved",
    service: "search-service",
    affected_users: 25600,
    duration_minutes: 193,
  },
  {
    id: "INC-006",
    title: "Redis Sentinel Failover Loop",
    severity: "P1",
    status: "resolved",
    service: "session-service",
    affected_users: 67000,
    duration_minutes: 98,
  },
  {
    id: "INC-007",
    title: "API Rate Limiter False Positives",
    severity: "P3",
    status: "resolved",
    service: "api-gateway",
    affected_users: 8900,
    duration_minutes: 35,
  },
  {
    id: "INC-008",
    title: "Notification Service Kafka Consumer Lag Spike",
    severity: "P3",
    status: "resolved",
    service: "notification-service",
    affected_users: 18750,
    duration_minutes: 153,
  },
];

export default function DashboardPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredIncidents = useMemo(() => {
    return incidentsData.filter((incident) => {
      const matchesFilter =
        filter === "all"
          ? true
          : incident.severity === filter ||
            incident.status === filter;

      const matchesSearch =
        incident.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        incident.service
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const severityCount = {
    P1: incidentsData.filter((i) => i.severity === "P1").length,
    P2: incidentsData.filter((i) => i.severity === "P2").length,
    P3: incidentsData.filter((i) => i.severity === "P3").length,
  };

  const avgResolution =
    Math.round(
      incidentsData.reduce(
        (acc, item) => acc + item.duration_minutes,
        0
      ) / incidentsData.length
    );

  return (
    <main className="min-h-screen bg-[#050814] text-white p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold">
            IncidentIQ Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            AI-powered incident monitoring
          </p>
        </div>

        <div className="bg-green-500/20 border border-green-500/40 px-5 py-2 rounded-full text-green-300">
          ● AI Engine Online
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0b1020] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Incidents by Severity
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>P1</span>
              <span className="text-red-400">
                {severityCount.P1}
              </span>
            </div>

            <div className="flex justify-between">
              <span>P2</span>
              <span className="text-yellow-400">
                {severityCount.P2}
              </span>
            </div>

            <div className="flex justify-between">
              <span>P3</span>
              <span className="text-blue-400">
                {severityCount.P3}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0b1020] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Resolution Status
          </h2>

          <div className="text-5xl font-bold text-green-400">
            {
              incidentsData.filter(
                (i) => i.status === "resolved"
              ).length
            }
          </div>

          <p className="text-gray-400 mt-2">
            incidents resolved
          </p>
        </div>

        <div className="bg-[#0b1020] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            Avg Resolution Time
          </h2>

          <div className="text-5xl font-bold text-purple-400">
            {avgResolution}m
          </div>

          <p className="text-gray-400 mt-2">
            average MTTR
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <input
          placeholder="Search incidents..."
          className="bg-[#0b1020] border border-gray-800 rounded-xl px-4 py-3 w-80 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {["all", "P1", "P2", "P3", "resolved"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-5 py-3 rounded-xl border ${
              filter === item
                ? "bg-blue-600 border-blue-500"
                : "bg-[#0b1020] border-gray-800"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-[#0b1020] border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex gap-3 items-center mb-2">
                  <span className="text-xs bg-gray-800 px-3 py-1 rounded-full">
                    {incident.id}
                  </span>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      incident.severity === "P1"
                        ? "bg-red-500/20 text-red-400"
                        : incident.severity === "P2"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {incident.severity}
                  </span>
                </div>

                <h2 className="text-xl font-semibold">
                  {incident.title}
                </h2>

                <p className="text-gray-400 mt-2">
                  Service: {incident.service}
                </p>
              </div>

              <div className="text-right">
                <div className="text-green-400 font-medium">
                  {incident.status}
                </div>

                <div className="text-gray-400 mt-2 text-sm">
                  {incident.duration_minutes} min
                </div>
              </div>
            </div>

            <div className="mt-5 text-sm text-gray-300">
              👥 {incident.affected_users.toLocaleString()} users affected
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}