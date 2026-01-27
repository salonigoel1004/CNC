import { create } from "zustand";

export interface LiveMachineData {
  current_state?: number;
  telemetry?: Record<string, number>;
  current_job?: string | null;
  timestamp?: string;
}

interface LiveState {
  machines: Record<string, LiveMachineData>;
  updateMachine: (machineId: string, data: LiveMachineData) => void;
  reset: () => void;
}

export const useLiveStore = create<LiveState>((set) => ({
  machines: {},

  updateMachine: (machineId, data) =>
    set((state) => ({
      machines: {
        ...state.machines,
        [machineId]: {
          ...(state.machines[machineId] || {}),
          ...data,
        },
      },
    })),

  reset: () => set({ machines: {} }),
}));
