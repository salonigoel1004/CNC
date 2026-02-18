import type { Machine, AppPage } from '../types';
import { MachineListItem } from './MachineListItem';
import { NavHeader } from './NavHeader';

interface MachineSidebarProps {
  machines: Machine[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function MachineSidebar({
  machines,
  selectedId,
  onSelect,
  currentPage,
  onNavigate,
}: MachineSidebarProps) {
  const runningCount = machines.filter((m) => m.status === "RUNNING").length;
  const faultCount = machines.filter((m) => m.status === "FAULT").length;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
      <NavHeader currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex gap-4 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-green-500" />
          <span className="font-mono text-xs text-gray-600">
            {runningCount} Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-red-500" />
          <span className="font-mono text-xs text-gray-600">
            {faultCount} Fault
          </span>
        </div>
      </div>
      <div className="px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Machines
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="space-y-0.5">
          {machines.map((machine) => (
            <MachineListItem
              key={machine.id}
              machine={machine}
              isSelected={selectedId === machine.id}
              onSelect={() => onSelect(machine.id)}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-[10px] text-gray-500">
          Last sync: just now
        </p>
      </div>
    </aside>
  );
}