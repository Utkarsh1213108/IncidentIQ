export interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp?: string;
}

export interface RCA {
  rootCause: string;
  impact: string;
  resolution: string;
  actionItems?: string[];
}