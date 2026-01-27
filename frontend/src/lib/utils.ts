import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

// Map backend state (0, 1, 2) to frontend status
export function mapStateToStatus(state: number): "IDLE" | "RUNNING" | "FAULT" {
  switch (state) {
    case 0: return "IDLE";
    case 1: return "RUNNING";
    case 2: return "FAULT";
    default: return "IDLE";
  }
}