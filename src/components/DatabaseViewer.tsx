import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, AiInteraction } from '../types';
import { Database, Users, Bot, RefreshCw, Search, Shield, CheckCircle, Clock } from 'lucide-react';

interface DatabaseViewerProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ currentUser, onOpenAuth }) => {
  const [activeTable, setActiveTable] = useState<'users' | 'ai'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [aiRecords, setAiRecords] = useState<AiInteraction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, aiList] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getAiHistory().catch(() => []),
      ]);
      setUsers(uList);
      setAiRecords(aiList);
    } catch (e) {
      console.warn('Failed to load database records', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAi = aiRecords.filter(
    (a) =>
      a.prompt.toLowerCase().includes(search.toLowerCase()) ||
      a.response.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Registered Users</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{users.length || 1}</h3>
            <span className="text-[10px] text-emerald-400 font-mono">Table: `users`</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">AI Interactions Logged</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{aiRecords.length}</h3>
            <span className="text-[10px] text-purple-400 font-mono">Table: `ai_interactions`</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Database Engine</p>
            <h3 className="text-lg font-bold text-white mt-0.5 font-mono">MySQL 8.4</h3>
            <span className="text-[10px] text-cyan-400 font-mono">InnoDB • UTF8MB4</span>
          </div>
        </div>
      </div>

      {/* Database Tables Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Table Switcher */}
          <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 max-w-xs">
            <button
              onClick={() => setActiveTable('users')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 text-xs font-medium rounded-lg transition ${
                activeTable === 'users'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>users ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTable('ai')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 text-xs font-medium rounded-lg transition ${
                activeTable === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>ai_interactions ({aiRecords.length})</span>
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTable}...`}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Refresh database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        {activeTable === 'users' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-mono text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">id (INT PK)</th>
                  <th className="px-4 py-2.5">email (VARCHAR)</th>
                  <th className="px-4 py-2.5">full_name</th>
                  <th className="px-4 py-2.5">role (ENUM)</th>
                  <th className="px-4 py-2.5">is_active</th>
                  <th className="px-4 py-2.5">created_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-2.5 font-mono text-indigo-400">#{u.id}</td>
                    <td className="px-4 py-2.5 font-medium text-white">{u.email}</td>
                    <td className="px-4 py-2.5 text-slate-300">{u.full_name || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AI Interactions Table */}
        {activeTable === 'ai' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-mono text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">id (INT PK)</th>
                  <th className="px-4 py-2.5">prompt (TEXT)</th>
                  <th className="px-4 py-2.5">response preview</th>
                  <th className="px-4 py-2.5">model_used</th>
                  <th className="px-4 py-2.5">tokens</th>
                  <th className="px-4 py-2.5">timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                {filteredAi.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      No interactions recorded yet. Send a prompt in the AI Studio tab!
                    </td>
                  </tr>
                ) : (
                  filteredAi.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-2.5 font-mono text-purple-400">#{a.id}</td>
                      <td className="px-4 py-2.5 font-medium text-white max-w-[200px] truncate">
                        {a.prompt}
                      </td>
                      <td className="px-4 py-2.5 max-w-[280px] truncate text-slate-400">
                        {a.response}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-indigo-400 text-[11px]">{a.model}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{a.tokens_used}</td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                        {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
