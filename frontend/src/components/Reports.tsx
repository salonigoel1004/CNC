import { useState, useEffect } from 'react';
import type { AppPage, ReportPeriod, DailyReportEntry } from '../types';
import { NavHeader } from './NavHeader';
import { Calendar, CalendarDays, CalendarRange, FileBarChart, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { fetchDailyReport } from '../api/machines';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ReportsProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const periods: { key: ReportPeriod; label: string; icon: typeof Calendar }[] = [
  { key: "daily", label: "Daily", icon: Calendar },
  { key: "weekly", label: "Weekly", icon: CalendarDays },
  { key: "monthly", label: "Monthly", icon: CalendarRange },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function formatMinutes(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function DailyReport() {
  const [data, setData] = useState<DailyReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyReport()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch daily report:", err);
        setError("Failed to load report data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <FileBarChart className="mb-4 size-16 opacity-20" />
        <p className="text-lg">No data available for today</p>
      </div>
    );
  }

  const runtimeData = data.map((d) => ({
    machine: d.machine_id,
    runtime: Math.round(d.runtime_sec / 60),
    runtimeSec: d.runtime_sec,
  }));

  const partCountData = data.map((d) => ({
    machine: d.machine_id,
    parts: d.part_count,
  }));

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daily Report</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Runtime Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Machine Runtime (today)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runtimeData} margin={{ top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="machine"
                  tick={{ fontSize: 12, fontFamily: "monospace" }}
                />
                <YAxis
                  tickFormatter={(v) => formatMinutes(v * 60)}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(_value: number, _name: string, props: { payload: { runtimeSec: number } }) => [
                    formatMinutes(props.payload.runtimeSec),
                    "Runtime",
                  ]}
                  labelStyle={{ fontFamily: "monospace" }}
                />
                <Bar dataKey="runtime" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {runtimeData.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Part Count Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Part Count (today)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partCountData} margin={{ top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="machine"
                  tick={{ fontSize: 12, fontFamily: "monospace" }}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [value, "Parts"]}
                  labelStyle={{ fontFamily: "monospace" }}
                />
                <Bar dataKey="parts" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {partCountData.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Reports({ currentPage, onNavigate }: ReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("daily");

  return (
    <div className="flex h-screen bg-white">
      <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
        <NavHeader currentPage={currentPage} onNavigate={onNavigate} />

        <div className="px-4 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Report Period
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="space-y-0.5">
            {periods.map((period) => (
              <button
                key={period.key}
                type="button"
                onClick={() => setSelectedPeriod(period.key)}
                className={cn(
                  "flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors",
                  "hover:bg-gray-100",
                  selectedPeriod === period.key
                    ? "border-l-blue-600 bg-gray-50"
                    : "border-l-transparent"
                )}
              >
                <period.icon
                  className={cn(
                    "size-4",
                    selectedPeriod === period.key
                      ? "text-blue-600"
                      : "text-gray-500"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    selectedPeriod === period.key
                      ? "text-gray-900"
                      : "text-gray-600"
                  )}
                >
                  {period.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        {selectedPeriod === "daily" ? (
          <DailyReport />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <FileBarChart className="mb-4 size-16 opacity-20" />
            <p className="text-lg">
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} report
            </p>
            <p className="mt-1 text-sm text-gray-400">Coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
