export const createMachineSocket = () => {
  return new WebSocket("ws://localhost:8000/ws/machines");
};
