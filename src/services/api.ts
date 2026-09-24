import { User, AuthResponse, AiInteraction, SheetSyncLog, SystemStatus } from '../types';

const TOKEN_KEY = 'nexus_access_token';
const USER_KEY = 'nexus_user_profile';

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // System
  getSystemStatus: () => apiRequest<SystemStatus>('/api/system/status'),

  // Auth
  register: async (payload: { email: string; password: string; fullName?: string }): Promise<AuthResponse> => {
    const res = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    authStorage.setToken(res.access_token);
    authStorage.setUser({
      id: res.user_id,
      email: res.email,
      full_name: res.full_name,
      role: res.role,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    return res;
  },

  login: async (payload: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    authStorage.setToken(res.access_token);
    authStorage.setUser({
      id: res.user_id,
      email: res.email,
      full_name: res.full_name,
      role: res.role,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    return res;
  },

  getProfile: () => apiRequest<User>('/api/auth/me'),

  // Users
  getUsers: () => apiRequest<User[]>('/api/users'),

  // AI Integration
  askAi: (payload: { prompt: string; systemPrompt?: string; model?: string; temperature?: number }) =>
    apiRequest<AiInteraction>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAiHistory: () => apiRequest<AiInteraction[]>('/api/ai/history'),

  clearAiHistory: () =>
    apiRequest<{ message: string }>('/api/ai/history', {
      method: 'DELETE',
    }),

  // Google Sheets
  getSheetsConfig: () =>
    apiRequest<{ configured_sheet_id: string; service_ready: boolean; total_logs: number }>('/api/sheets/config'),

  syncToGoogleSheets: (payload: {
    sheetId?: string;
    includeAiHistory?: boolean;
    includeUsers?: boolean;
    googleAccessToken?: string;
  }) =>
    apiRequest<{
      status: string;
      message: string;
      sheet_id: string;
      sheet_url: string;
      synced_records_count: number;
      synced_at: string;
    }>('/api/sheets/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSheetLogs: () => apiRequest<SheetSyncLog[]>('/api/sheets/logs'),
};
