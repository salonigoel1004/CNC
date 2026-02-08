import { useState, useEffect, useCallback } from 'react';
import type { Machine, BackendMachine, WebSocketMessage } from '../types/cnc';
import { MachineSidebar } from './MachineSideBar';
import { MachineDetail } from './MachineDetail';
import { Cpu, AlertTriangle } from 'lucide-react';
import { fetchMachines } from '../api/machines';
import { mapStateToStatus } from '../utils/mappers';
import { useWebSocket } from '../hooks/useWebSocket';

export function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMachines()
      .then((backendMachines: BackendMachine[]) => {
        const mapped: Machine[] = backendMachines.map((bm) => ({
          id: bm.machine_id,
          name: `CNC Machine ${bm.machine_id}`,
          status: mapStateToStatus(bm.current_state),
          telemetry: {
            spindleSpeed: 0,
            feedRate: 0,
            load: 0,
            axisPosition: { x: 0, y: 0, z: 0 },
            temperature: 0,
            runtime: 0,
          },
          business: {
            partCount: 0,
          },

          lastUpdate: bm.last_seen ? new Date(bm.last_seen) : new Date(),
          jobNo: "N/A",
          operator: "Unknown",
        }));
        setMachines(mapped);
        if (mapped.length > 0) setSelectedId(mapped[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch machines:', err);
        setError('Failed to load machines. Check if backend is running.');
        setLoading(false);
      });
  }, []);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== data.machine_id) return m;

        return {
          ...m,
          status: mapStateToStatus(data.current_state),
          lastUpdate: new Date(data.timestamp),
          jobNo: data.current_job || m.jobNo,
          telemetry: {
            spindleSpeed: data.telemetry?.spindle_speed ?? m.telemetry.spindleSpeed,
            feedRate: data.telemetry?.feed_rate ?? m.telemetry.feedRate,
            load: data.telemetry?.load ?? m.telemetry.load,
            temperature: data.telemetry?.temperature ?? m.telemetry.temperature,
            runtime: data.telemetry?.runtime ?? m.telemetry.runtime,
            axisPosition: {
              x: data.telemetry?.axis_x ?? m.telemetry.axisPosition.x,
              y: data.telemetry?.axis_y ?? m.telemetry.axisPosition.y,
              z: data.telemetry?.axis_z ?? m.telemetry.axisPosition.z,
            },
          },
            business: {
            partCount: data.business?.part_count ?? m.business?.partCount ?? 0,
            },
        };
      })
    );
  }, []);

  
  const isConnected = useWebSocket(selectedId, handleWebSocketMessage);

  const selectedMachine = machines.find((m) => m.id === selectedId);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Cpu className="mx-auto mb-4 size-16 animate-pulse text-gray-300" />
          <p className="text-lg text-gray-600">Loading machines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 size-16 text-red-500" />
          <p className="text-lg text-red-600">{error}</p>
          <p className="mt-2 text-sm text-gray-500">
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <MachineSidebar
        machines={machines}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <main className="flex-1 overflow-hidden">
        {selectedMachine ? (
          <>
            <MachineDetail machine={selectedMachine} />
            {/* WebSocket Status Indicator */}
            <div className="fixed bottom-4 right-4">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg ${
                  isConnected
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isConnected ? 'bg-white animate-pulse' : 'bg-gray-300'
                  }`}
                />
                {isConnected ? 'Live' : 'Connecting...'}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <Cpu className="mb-4 size-16 opacity-20" />
            <p className="text-lg">Select a machine to view details</p>
          </div>
        )}
      </main>
    </div>
  );
}