// src/constants/api.js
export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/+$/, '');

export async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  const text = await res.text();
  if (!ct.includes('application/json')) {
    throw new Error(`Expected JSON but got '${ct}'. Body: ${text.slice(0,180)}...`);
  }
  try { return JSON.parse(text); }
  catch { throw new Error(`Invalid JSON: ${text.slice(0,180)}...`); }
}
