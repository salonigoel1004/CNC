export type MachineStatus = "RUNNING" | "IDLE" | "FAULT";

export interface AxisPosition {
  x: number;
  y: number;
  z: number;
}

export interface MachineTelemetry {
  spindleSpeed: number;
  feedRate: number;
  load: number;
  axisPosition: AxisPosition;
  temperature: number;
  runtime: number;
  partCount: number;
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  telemetry: MachineTelemetry;
  lastUpdate: Date;
  jobNo: string;
  operator: string;
}

// Backend API types
export interface BackendMachine {
  machine_id: string;
  current_state: number; // 0=IDLE, 1=RUNNING, 2=FAULT
  last_seen: string | null;
}

export interface WebSocketMessage {
  machine_id: string;
  current_state: number;
  timestamp: string;
  telemetry?: {
    spindle_speed?: number;
    feed_rate?: number;
    load?: number;
    temperature?: number;
    runtime?: number;
    part_count?: number;
    axis_x?: number;
    axis_y?: number;
    axis_z?: number;
  };
  current_job?: string;
}