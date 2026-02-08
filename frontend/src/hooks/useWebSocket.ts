import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage } from '../types/cnc';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function useWebSocket(
  machineId: string | null,
  onMessage: (data: WebSocketMessage) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (!machineId) return;

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/machines/${machineId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected: ${machineId}`);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      ws.onclose = () => {
        console.log(`❌ WebSocket closed: ${machineId}`);
        setIsConnected(false);
        

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Reconnecting WebSocket: ${machineId}`);
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [machineId, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return isConnected;
}