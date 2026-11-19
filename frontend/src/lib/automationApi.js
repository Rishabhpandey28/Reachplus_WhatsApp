import { API_BASE } from './whatsappApi';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api/automation${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const getBotConfig = () => request('/config');
export const saveBotConfig = (patch) => request('/config', json('PUT', patch));

export const getKnowledge = () => request('/knowledge');
export const createKnowledge = (item) => request('/knowledge', json('POST', item));
export const updateKnowledge = (id, item) => request(`/knowledge/${id}`, json('PUT', item));
export const deleteKnowledge = (id) => request(`/knowledge/${id}`, { method: 'DELETE' });

export const testBot = (history) => request('/test', json('POST', { history }));

export const getBotState = (waId) => request(`/state/${encodeURIComponent(waId)}`);
export const resumeBot = (waId) =>
  request(`/state/${encodeURIComponent(waId)}/resume`, { method: 'POST' });
