import { SystemHealth, Model, Incident, Log, Trace } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthHeaders(contentType = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = 'application/json';
  return headers;
}

export const api = {
  // System Health
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await fetch(`${API_BASE_URL}/system_health`);
    if (!response.ok) throw new Error('Failed to fetch system health');
    return response.json();
  },

  // Models
  getModels: async (): Promise<Model[]> => {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },

  // Incidents
  getIncidents: async (status?: string): Promise<Incident[]> => {
    const url = new URL(`${API_BASE_URL}/incidents`);
    if (status) url.searchParams.append('status', status);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch incidents');
    return response.json();
  },

  getIncident: async (id: string): Promise<Incident> => {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}`);
    if (!response.ok) throw new Error('Failed to fetch incident');
    return response.json();
  },

  // Logs
  getLogs: async (modelId?: string): Promise<Log[]> => {
    const url = new URL(`${API_BASE_URL}/logs`);
    if (modelId) url.searchParams.append('model_id', modelId);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  // Traces
  getTraces: async (modelId?: string): Promise<Trace[]> => {
    const url = new URL(`${API_BASE_URL}/traces`);
    if (modelId) url.searchParams.append('model_id', modelId);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch traces');
    return response.json();
  },

  // Chat
  sendMessage: async (message: string): Promise<{ response: string }> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Projects
  createProject: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  getMyProjects: async () => {
    const response = await fetch(`${API_BASE_URL}/projects/mine`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      console.error('Failed to fetch projects:', await response.text());
      throw new Error('Failed to fetch projects');
    }
    const data = await response.json();
    console.log('Projects data:', data);
    return data;
  },

  getProjectIntegrations: async (projectId: number) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/integrations`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      console.error('Failed to fetch integrations:', await response.text());
      throw new Error('Failed to fetch integrations');
    }
    const data = await response.json();
    console.log('Integrations data:', data);
    return data;
  },

  updateProjectIntegrations: async (projectId: number, integrations: any) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/integrations`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify(integrations),
    });
    if (!response.ok) {
      console.error('Failed to update integrations:', await response.text());
      throw new Error('Failed to update integrations');
    }
    return response.json();
  },
}; 