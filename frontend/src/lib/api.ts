import type { BackendMachine } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchMachines(): Promise {
  try {
    const response = await fetch(`${API_BASE_URL}/machines`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch machines:', error);
    throw error;
  }
}

export { API_BASE_URL };