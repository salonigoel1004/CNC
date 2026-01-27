
export type MachineStatus = "IDLE" | "RUNNING" | "STOPPED";

export function mapMachineState(value?: number): MachineStatus {
  switch (value) {
    case 1:
      return "RUNNING";
    case 2:
      return "STOPPED";
    default:
      return "IDLE";
  }
}
