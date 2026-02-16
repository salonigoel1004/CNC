import type { MachineStatus } from '../types';

export function mapStateToStatus(state: number): MachineStatus {
  switch (state) {
    case 0: return "IDLE";
    case 1: return "RUNNING";
    case 2: return "FAULT";
    default: return "IDLE";
  }
}