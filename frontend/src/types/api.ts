export interface SystemHealth {
  total_models: number;
  active_models: number;
  open_incidents: number;
  system_status: string;
  last_rca: string | null;
}

export interface Model {
  id: string;
  name: string;
  version: string;
  status: string;
  last_updated: string;
}

export interface Log {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  model_id: string;
  trace_id?: string;
}

export interface Trace {
  id: string;
  start_time: string;
  end_time: string;
  model_id: string;
  status: string;
  metadata: Record<string, string>;
}

export interface Incident {
  id: string;
  model_id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
  resolved_at: string | null;
  root_cause: string | null;
  logs: Log[];
  traces: Trace[];
} 