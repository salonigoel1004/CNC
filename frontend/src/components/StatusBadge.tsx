import { cn } from '../utils/cn';
import type { MachineStatus } from '../types';

interface StatusBadgeProps {
  status: MachineStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    RUNNING: {
      label: "RUNNING",
      className: "bg-green-500/15 text-green-600 border-green-500/30",
      dotClass: "bg-green-500 animate-pulse",
    },
    IDLE: {
      label: "IDLE",
      className: "bg-gray-500/15 text-gray-600 border-gray-500/30",
      dotClass: "bg-gray-500",
    },
    FAULT: {
      label: "FAULT",
      className: "bg-red-500/15 text-red-600 border-red-500/30",
      dotClass: "bg-red-500 animate-pulse",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded border font-mono font-semibold uppercase tracking-wider px-4 py-1.5 text-sm",
        config.className
      )}
    >
      <span className={cn("size-2 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}