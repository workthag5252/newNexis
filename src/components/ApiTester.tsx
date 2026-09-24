import React, { useState } from 'react';
import { authStorage } from '../services/api';
import { Key, Send, Copy, Check, Terminal, Shield, Sparkles } from 'lucide-react';

interface ApiTesterProps {
  onOpenAuth: () => void;
}

export const ApiTester: React.FC<ApiTesterProps> = ({ onOpenAuth }) => {
  const token = authStorage.getToken();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/system/status');
  const [method, setMethod] = useState<'GET' | 'POST' | 'DELETE'>('GET');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseData, setResponseData] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Decode JWT payload
  let decodedPayload: any = null;
  let decodedHeader: any = null;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        decodedHeader = JSON.parse(atob(parts[0]));
        decodedPayload = JSON.parse(atob(parts[1]));
      }
    } catch (e) {
      console.warn('Failed to parse token parts', e);
    }
  }

  const endpoints = [
    {
      path: '/api/system/status',
      method: 'GET' as const,
      desc: 'System health, OpenAI model, MySQL database status',
      sampleBody: '',
    },
    {
      path: '/api/auth/me',
      method: 'GET' as const,
      desc: 'Get current user profile (requires Bearer token)',
      sampleBody: '',
    },
    {
      path: '/api/users',
      method: 'GET' as const,
      desc: 'List all registered users from MySQL users table',
      sampleBody: '',
    },
    {
      path: '/api/ai/chat',
      method: 'POST' as const,
      desc: 'Send prompt to OpenAI GPT via backend proxy',
      sampleBody: JSON.stringify(
        {
          prompt: 'Explain the benefits of FastAPI and MySQL 8.4 in 2 sentences.',
          model: 'gpt-4o-mini',
          temperature: 0.7,
        },
        null,
        2
      ),
    },
    {
      path: '/api/ai/history',
      method: 'GET' as const,
      desc: 'Retrieve AI interaction history for authenticated user',
      sampleBody: '',
    },
    {
      path: '/api/sheets/config',
      method: 'GET' as const,
      desc: 'Get Google Sheets OAuth status and configured Sheet ID',
      sampleBody: '',
    },
    {
      path: '/api/sheets/sync',
      method: 'POST' as const,
      desc: 'Trigger synchronization of MySQL records to Google Sheets',
      sampleBody: JSON.stringify(
        {
          includeUsers: true,
          includeAiHistory: true,
        },
        null,
        2
      ),
    },
    {
      path: '/api/auth/login',
      method: 'POST' as const,
      desc: 'Authenticate user with email and password to receive JWT',
      sampleBody: JSON.stringify(
        {
          email: 'admin@nexus.ai',
          password: 'admin123',
        },
        null,
        2
      ),
    },
  ];

  const handleSelectEndpoint = (ep: (typeof endpoints)[0]) => {
    setSelectedEndpoint(ep.path);
    setMethod(ep.method);
    setRequestBody(ep.sampleBody || '');
    setResponseData(null);
    setResponseStatus(null);
    setLatency(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (method === 'POST' && requestBody.trim()) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody));
        } catch {
          options.body = requestBody;
        }
      }

      const res = await fetch(selectedEndpoint, options);
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const json = await res.json().catch(() => ({ message: 'No JSON body returned' }));
      setResponseData(json);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message || 'Network request failed' });
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* JWT Inspector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">JSON Web Token (JWT) Inspector</h2>
              <p className="text-xs text-slate-400">Decoded state of current user authentication token</p>
            </div>
          </div>

          {token && (
            <button
              onClick={copyToken}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Token Copied' : 'Copy Raw JWT'}</span>
            </button>
          )}
        </div>

        {token ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Header */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/20">
              <span className="text-[10px] text-rose-400 uppercase font-semibold">1. Header (Algorithm &amp; Type)</span>
              <pre className="text-slate-300 mt-2 overflow-x-auto text-[11px]">
                {JSON.stringify(decodedHeader || { alg: 'HS256', typ: 'JWT' }, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-purple-500/20">
              <span className="text-[10px] text-purple-400 uppercase font-semibold">2. Payload (Claims &amp; Roles)</span>
              <pre className="text-slate-300 mt-2 overflow-x-auto text-[11px]">
                {JSON.stringify(decodedPayload || {}, null, 2)}
              </pre>
            </div>

            {/* Signature */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/20">
              <span className="text-[10px] text-cyan-400 uppercase font-semibold">3. Signature Verification</span>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                HMACSHA256(
                <br />
                &nbsp;&nbsp;base64UrlEncode(header) + &quot;.&quot; +
                <br />
                &nbsp;&nbsp;base64UrlEncode(payload),
                <br />
                &nbsp;&nbsp;JWT_SECRET
                <br />
                )
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3 h-3" /> Valid Token Active
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center text-xs text-slate-400">
            No active JWT found in storage. Click &quot;Sign In / Register&quot; to obtain a signed bearer token.
          </div>
        )}
      </div>

      {/* Interactive Web API Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">Interactive Web API Console</h2>
        </div>

        {/* Quick Endpoint Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-slate-800">
          {endpoints.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectEndpoint(ep)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition flex items-center space-x-1.5 ${
                selectedEndpoint === ep.path && method === ep.method
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span
                className={`text-[9px] px-1 rounded uppercase font-bold ${
                  ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {ep.method}
              </span>
              <span>{ep.path}</span>
            </button>
          ))}
        </div>

        {/* Request Input Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="flex">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-l-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="flex-1 bg-slate-800/90 border border-l-0 border-slate-700 rounded-r-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 text-xs text-slate-400 flex items-center">
            {endpoints.find((ep) => ep.path === selectedEndpoint)?.desc || 'Custom API request'}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="w-full md:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing...' : 'Send Request'}</span>
            </button>
          </div>
        </div>

        {/* Request / Response Split View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Request Body */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
              Request Body (JSON)
            </label>
            <textarea
              rows={8}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder="No body required for GET requests"
              className="w-full p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Response Inspector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-300 font-mono">Response Output</span>
              {responseStatus !== null && (
                <div className="flex items-center space-x-2 text-[11px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    Status: {responseStatus}
                  </span>
                  {latency !== null && <span className="text-slate-500">{latency}ms</span>}
                </div>
              )}
            </div>

            <div className="h-[178px] p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-mono overflow-auto">
              {responseData ? (
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              ) : (
                <span className="text-slate-600 italic">
                  Press &quot;Send Request&quot; to view live server response.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
