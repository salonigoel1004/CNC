import { useState, useRef, useEffect } from 'react';
import type { AppPage } from '../types';
import { Cpu, FileBarChart, ChevronDown } from 'lucide-react';

interface NavHeaderProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const pages = [
  { key: "monitor" as const, label: "CNC Monitor", subtitle: "Machine Control", icon: Cpu },
  { key: "reports" as const, label: "Reports", subtitle: "Analytics & Reports", icon: FileBarChart },
];

export function NavHeader({ currentPage, onNavigate }: NavHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = pages.find((p) => p.key === currentPage)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative border-b border-gray-200 px-4 py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3"
      >
        <div className="flex size-9 items-center justify-center rounded bg-blue-100">
          <current.icon className="size-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <h1 className="font-semibold text-gray-900">{current.label}</h1>
          <p className="text-xs text-gray-500">{current.subtitle}</p>
        </div>
        <ChevronDown
          className={`size-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {pages.map((page) => (
            <button
              key={page.key}
              type="button"
              onClick={() => {
                onNavigate(page.key);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                currentPage === page.key ? "bg-blue-50" : ""
              }`}
            >
              <div
                className={`flex size-8 items-center justify-center rounded ${
                  currentPage === page.key ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <page.icon
                  className={`size-4 ${
                    currentPage === page.key ? "text-blue-600" : "text-gray-500"
                  }`}
                />
              </div>
              <div>
                <span
                  className={`block text-sm font-medium ${
                    currentPage === page.key ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {page.label}
                </span>
                <span className="block text-[10px] text-gray-500">
                  {page.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
