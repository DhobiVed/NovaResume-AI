const env = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) || {};
export const API_BASE: string =
  env.VITE_API_BASE_URL ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8000/api/v1';
