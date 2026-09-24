import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { AiInteraction, User } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  Sliders,
  Trash2,
  FileSpreadsheet,
  Copy,
  Check,
  Cpu,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface AiStudioProps {
  user: User | null;
  onOpenAuth: () => void;
  onSyncToSheets: () => void;
}

export const AiStudio: React.FC<AiStudioProps> = ({ user, onOpenAuth, onSyncToSheets }) => {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an intelligent, concise, and helpful AI assistant specializing in full-stack architecture, JWT auth, and database design.');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AiInteraction[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const data = await api.getAiHistory();
      setHistory(data);
    } catch (e: any) {
      console.warn('Could not load history:', e);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);
    setError(null);

    // Optimistic user display
    const tempId = Date.now();
    const optimisticInteraction: AiInteraction = {
      id: tempId,
      prompt: currentPrompt,
      response: '...',
      model: model,
      tokens_used: 0,
      created_at: new Date().toISOString(),
    };

    setHistory((prev) => [optimisticInteraction, ...prev]);

    try {
      const result = await api.askAi({
        prompt: currentPrompt,
        systemPrompt,
        model,
        temperature,
      });

      setHistory((prev) =>
        prev.map((item) => (item.id === tempId ? result : item))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to query OpenAI backend service');
      setHistory((prev) => prev.filter((item) => item.id !== tempId));
    } finally {
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your AI query history?')) return;
    try {
      await api.clearAiHistory();
      setHistory([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear history');
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptSuggestions = [
    {
      title: 'FastAPI + SQLAlchemy 2.0',
      text: 'Show how to create a FastAPI route using SQLAlchemy 2.0 select() query with Pydantic v2 response model.',
    },
    {
      title: 'MySQL 8.4 Indexing',
      text: 'What are best practices for indexing users and refresh tokens tables in MySQL 8.4?',
    },
    {
      title: 'Google Sheets OAuth Flow',
      text: 'How does Google Workspace OAuth client-side token flow securely interact with a backend data API?',
    },
    {
      title: 'JWT Bearer Security',
      text: 'Explain token expiration, Argon2 password hashing, and role-based access control (RBAC).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">OpenAI GPT Backend Studio</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Backend Proxy Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Queries are routed securely through the backend. API keys are never exposed to the browser.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                showSettings
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Model &amp; Prompt Parameters</span>
            </button>

            {user && (
              <>
                <button
                  onClick={onSyncToSheets}
                  title="Sync AI prompts to Google Sheets"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Sync to Sheets</span>
                </button>

                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    title="Clear history"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/80 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Expandable Settings Drawer */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn text-left">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>GPT Model</span>
                <span className="text-[10px] text-slate-500">Configured in .env</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Fast &amp; Accurate)</option>
                <option value="gpt-4o">gpt-4o (High Reasoning)</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy Standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Temperature</span>
                <span className="text-[10px] text-indigo-400 font-mono">{temperature}</span>
              </label>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Precise (0.0)</span>
                <span>Creative (1.5)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                System Context / Instructions
              </label>
              <input
                type="text"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="System prompt context..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Guest Warning if not logged in */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Authentication Required for AI Chat</p>
              <p className="text-[11px] text-amber-300/80">
                Sign in with the demo account or register to send GPT prompts and save interactions to MySQL.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-md whitespace-nowrap"
          >
            Sign In Now
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Chat Feed */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-400 shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              Ready for your prompts
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              Ask anything to the backend OpenAI GPT integration. Responses are securely streamed, token-counted, and persisted in the MySQL database.
            </p>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(item.text);
                    if (!user) onOpenAuth();
                  }}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 transition group flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition flex items-center justify-between w-full">
                    {item.title}
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition" />
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {item.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl transition hover:border-slate-700 text-left"
              >
                {/* User Prompt */}
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0 mt-0.5">
                    U
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">User Prompt</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-white mt-1 whitespace-pre-wrap">{item.prompt}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-3 pt-3 border-t border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold shrink-0 mt-0.5">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-indigo-300">OpenAI GPT Response</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.model}
                        </span>
                        {item.tokens_used > 0 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            ~{item.tokens_used} tokens
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleCopy(item.response, item.id)}
                          title="Copy response"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                      {item.response === '...' ? (
                        <div className="flex items-center space-x-2 text-indigo-400 py-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                          <span className="text-xs font-mono">Generating response via backend API...</span>
                        </div>
                      ) : (
                        item.response
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Box */}
      <div className="sticky bottom-4 z-20">
        <form
          onSubmit={handleSend}
          className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 sm:p-3 flex items-center gap-2 backdrop-blur-xl"
        >
          <div className="pl-2 text-slate-400 hidden sm:block">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              user
                ? `Ask OpenAI GPT (${model})... (e.g. Write a MySQL query or Python FastAPI route)`
                : 'Sign in to send prompts to the OpenAI backend...'
            }
            disabled={loading}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 shrink-0"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send to GPT</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
