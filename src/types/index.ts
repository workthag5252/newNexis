export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
}

export interface AiInteraction {
  id: number;
  prompt: string;
  response: string;
  model: string;
  tokens_used: number;
  created_at: string;
}

export interface SheetSyncLog {
  id: number;
  userId?: number;
  userEmail?: string;
  sheetId: string;
  sheetUrl: string;
  recordsCount: number;
  status: 'success' | 'failed';
  syncedAt: string;
}

export interface SystemStatus {
  status: string;
  appName: string;
  version: string;
  database: {
    type: string;
    tableUsers: number;
    tableAiHistory: number;
    tableSheetLogs: number;
  };
  ai: {
    configuredProvider: string;
    model: string;
    hasOpenAiKey: boolean;
  };
  googleSheets: {
    ready: boolean;
    defaultSheetId: string;
  };
  jwt: {
    algorithm: string;
    expiration: string;
  };
  timestamp: string;
}
