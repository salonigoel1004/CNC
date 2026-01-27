import type { Machine } from '../types/cnc';
import { StatusBadge } from './StatusBadge';
import { TelemetryCard } from './TelemetryCard';
import {
  Gauge,
  Zap,
  Thermometer,
  Clock,
  Package,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface MachineDetailProps {
  machine: Machine;
}

function formatRuntime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function MachineDetail({ machine }: MachineDetailProps) {
  const { telemetry } = machine;

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="font-mono text-2xl font-bold text-gray-900">
              {machine.id}
            </h2>
            <StatusBadge status={machine.status} />
          </div>
          <p className="text-lg text-gray-600">{machine.name}</p>
        </div>
      </div>

      {/* Status Alert for Fault */}
      {machine.status === "FAULT" && (
        <div className="mb-6 flex items-center gap-3 rounded border border-red-300 bg-red-50 p-4">
          <AlertTriangle className="size-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-600">Machine Fault Detected</p>
            <p className="text-sm text-gray-600">
              Check machine status and contact maintenance if needed.
            </p>
          </div>
        </div>
      )}

      {/* Job Info */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
          <Package className="size-5 text-gray-500" />
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Job No
            </span>
            <span className="font-mono text-sm text-gray-900">
              {machine.jobNo}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
          <Activity className="size-5 text-gray-500" />
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500">
              Operator
            </span>
            <span className="text-sm text-gray-900">{machine.operator}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 h-px bg-gray-200" />

      {/* Telemetry Grid */}
      <div className="mb-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Real-Time Telemetry
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <TelemetryCard
            label="Spindle Speed"
            value={telemetry.spindleSpeed.toLocaleString()}
            unit="RPM"
            icon={Gauge}
            highlight={machine.status === "RUNNING"}
          />
          <TelemetryCard
            label="Feed Rate"
            value={telemetry.feedRate}
            unit="mm/min"
            icon={Zap}
          />
          <TelemetryCard
            label="Temperature"
            value={telemetry.temperature}
            unit="°C"
            icon={Thermometer}
            highlight={telemetry.temperature > 50}
          />
        </div>
      </div>

      {/* Axis Position */}
      <div className="mb-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Axis Position
        </h3>
        <div className="rounded border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-3 gap-4">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="text-center">
                <span className="mb-1 block font-mono text-xs font-bold uppercase text-blue-600">
                  {axis.toUpperCase()}
                </span>
                <span className="font-mono text-lg font-medium text-gray-900 tabular-nums">
                  {telemetry.axisPosition[axis].toFixed(3)}
                </span>
                <span className="ml-1 text-xs text-gray-500">mm</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Stats */}
      <div>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Production
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <TelemetryCard
            label="Runtime"
            value={formatRuntime(telemetry.runtime)}
            icon={Clock}
          />
          <TelemetryCard
            label="Part Count"
            value={telemetry.partCount.toLocaleString()}
            unit="pcs"
            icon={Package}
          />
        </div>
      </div>
    </div>
  );
}