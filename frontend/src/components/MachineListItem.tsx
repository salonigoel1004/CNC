import { cn } from '../utils/cn';
import type { Machine } from '../types/cnc';
import { Activity, AlertTriangle, Pause } from 'lucide-react';

interface MachineListItemProps {
  machine: Machine;
  isSelected: boolean;
  onSelect: () => void;
}

const statusIcon = {
  RUNNING: <Activity className="size-4 text-green-600" />,
  IDLE: <Pause className="size-4 text-gray-500" />,
  FAULT: <AlertTriangle className="size-4 text-red-600" />,
};

const statusDotClass = {
  RUNNING: "bg-green-500 shadow-[0_0_8px_rgb(34,197,94)]",
  IDLE: "bg-gray-500",
  FAULT: "bg-red-500 shadow-[0_0_8px_rgb(239,68,68)] animate-pulse",
};

export function MachineListItem({
  machine,
  isSelected,
  onSelect,
}: MachineListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors",
        "hover:bg-gray-100",
        isSelected
          ? "border-l-blue-600 bg-gray-50"
          : "border-l-transparent"
      )}
    >
      <div className="relative">
        <span
          className={cn(
            "block size-2.5 rounded-full",
            statusDotClass[machine.status]
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-gray-900">
            {machine.id}
          </span>
          {statusIcon[machine.status]}
        </div>
        <p className="truncate text-xs text-gray-500">{machine.name}</p>
      </div>
      {machine.status === "RUNNING" && (
        <span className="font-mono text-xs text-gray-500">
          {machine.telemetry.load}%
        </span>
      )}
    </button>
  );
}