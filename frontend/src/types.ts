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
}

export interface MachineBusiness {
  partCount: number;
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  telemetry: MachineTelemetry;
  business: MachineBusiness;
  lastUpdate: Date;
  jobNo: string;
  operator: string;
}

// Backend API types
export interface BackendMachine {
  machine_id: string;
  current_state: number;
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
    axis_x?: number;
    axis_y?: number;
    axis_z?: number;
  };

  business?: {
    part_count?: number;
  };

  current_job?: string;
}

export type UserRole = "OWNER" | "MANAGER" | "WORKER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  post: string;
  identity_number: string;
  photo_url: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
