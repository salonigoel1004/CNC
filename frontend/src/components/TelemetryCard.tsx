import { cn } from '../utils/cn';
import type { LucideIcon } from 'lucide-react';

interface TelemetryCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export function TelemetryCard({
  label,
  value,
  unit,
  icon: Icon,
  highlight,
}: TelemetryCardProps) {
  return (
    <div
      className={cn(
        "rounded border border-gray-200 bg-white p-4 transition-colors",
        highlight && "border-blue-300 bg-blue-50"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </span>
        <Icon className="size-4 text-gray-400" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold text-gray-900">
          {value}
        </span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}