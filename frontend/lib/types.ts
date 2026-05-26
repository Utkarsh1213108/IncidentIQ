export interface Incident {
  id: string;
  title: string;
  severity: "P1" | "P2" | "P3" | "P4";
  status: "active" | "resolved" | "investigating";
  service: string;
  started_at: string;
  resolved_at: string | null;
  duration_minutes: number | null;
  affected_users: number;
  error_rate: number;
  tags: string[];
  summary: string;
}

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL" | "DEBUG";
  service: string;
  host: string;
  message: string;
  trace_id: string | null;
}

export interface TimelineEvent {
  time: string;
  event: string;
  type: "trigger" | "escalation" | "detection" | "mitigation" | "resolution";
}

export interface RemediationStep {
  step: number;
  action: string;
  result: string;
}

export interface PreventionAction {
  priority: "high" | "medium" | "low";
  action: string;
  category: "code" | "process" | "monitoring" | "infrastructure";
}

export interface RCA {
  root_cause: string;
  root_cause_detail: string;
  trigger_event: string;
  contributing_factors: string[];
  timeline: TimelineEvent[];
  affected_systems: string[];
  impact_summary: string;
  detection_gap_minutes: number;
  blast_radius: "low" | "medium" | "high" | "critical";
  remediation_steps: RemediationStep[];
  prevention_actions: PreventionAction[];
  confidence_score: number;
  similar_incident_pattern: string;
}

export interface Stats {
  total: number;
  by_severity: { P1: number; P2: number; P3: number };
  by_status: { resolved: number; active: number };
  total_affected_users: number;
  avg_resolution_minutes: number;
  mttr_minutes: number;
}
