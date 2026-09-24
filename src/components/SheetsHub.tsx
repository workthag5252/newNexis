import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SheetSyncLog, User } from '../types';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Database,
  Bot,
  Sliders,
  Sparkles,
  Link2,
  ShieldCheck,
} from 'lucide-react';

interface SheetsHubProps {
  user: User | null;
  onOpenAuth: () => void;
}

export const SheetsHub: React.FC<SheetsHubProps> = ({ user, onOpenAuth }) => {
  const [sheetId, setSheetId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<SheetSyncLog[]>([]);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const [includeUsers, setIncludeUsers] = useState(true);
  const [includeAi, setIncludeAi] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLogs();
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const cfg = await api.getSheetsConfig();
      if (cfg.configured_sheet_id && !sheetId) {
        setSheetId(cfg.configured_sheet_id);
      }
    } catch (e) {
      console.warn('Could not load sheet config', e);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await api.getSheetLogs();
      setLogs(data);
    } catch (e) {
      console.warn('Could not load sync logs', e);
    }
  };

  const handleSync = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setSyncing(true);
    setMessage(null);

    try {
      const res = await api.syncToGoogleSheets({
        sheetId: sheetId.trim() || undefined,
        includeUsers,
        includeAiHistory: includeAi,
      });

      setLastSyncResult(res);
      setMessage(res.message);
      await loadLogs();
    } catch (err: any) {
      setMessage(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const sampleSheetData = [
    { type: 'USER', id: '1', primary: 'admin@nexus.ai', secondary: 'Admin Nexus', meta: 'admin', time: '2026-09-23 21:00' },
    { type: 'AI_QUERY', id: '1', primary: 'MySQL 8.4 schema best practices', secondary: 'Use InnoDB, strict mode & indexed foreign keys...', meta: 'gpt-4o-mini', time: '2026-09-23 21:15' },
    { type: 'AI_QUERY', id: '2', primary: 'FastAPI dependency injection', secondary: 'Use Depends(get_db) and HTTPBearer for JWT validation...', meta: 'gpt-4o-mini', time: '2026-09-23 21:30' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Google Sheets Data Hub</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Google Workspace OAuth Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bidirectional synchronization between MySQL database records, AI conversations, and Google Spreadsheets.
              </p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing to Sheets...' : 'Sync Database to Google Sheets'}</span>
          </button>
        </div>

        {/* Sync Controls */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                Target Google Sheet ID / URL
              </span>
              <span className="text-[10px] text-slate-500">Auto-configured or custom ID</span>
            </label>
            <input
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms (Leave empty to use default)"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Sync Options
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={includeUsers}
                  onChange={(e) => setIncludeUsers(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Users Table</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={includeAi}
                  onChange={(e) => setIncludeAi(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>AI Prompts Table</span>
              </label>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{message}</span>
            </div>
            {lastSyncResult?.sheet_url && (
              <a
                href={lastSyncResult.sheet_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-200 underline flex items-center space-x-1"
              >
                <span>Open in Sheets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Spreadsheet Structure Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Google Sheet Row Structure Preview</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Format: A1:F Range Append</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-mono text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Col A: Record Type</th>
                <th className="px-4 py-2.5">Col B: ID</th>
                <th className="px-4 py-2.5">Col C: Prompt / Email</th>
                <th className="px-4 py-2.5">Col D: Response / Name</th>
                <th className="px-4 py-2.5">Col E: Model / Role</th>
                <th className="px-4 py-2.5">Col F: Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
              {sampleSheetData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-2.5 font-mono text-indigo-400 font-semibold">{row.type}</td>
                  <td className="px-4 py-2.5 font-mono">{row.id}</td>
                  <td className="px-4 py-2.5 font-medium text-white max-w-[200px] truncate">{row.primary}</td>
                  <td className="px-4 py-2.5 max-w-[260px] truncate text-slate-400">{row.secondary}</td>
                  <td className="px-4 py-2.5 font-mono text-emerald-400">{row.meta}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync History Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Recent Sync Operations</h2>
          </div>
          <button
            onClick={loadLogs}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Refresh Logs
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No synchronization logs recorded yet. Click &quot;Sync Database to Google Sheets&quot; above to initiate.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-mono text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Sync ID</th>
                  <th className="px-4 py-2.5">Sheet ID</th>
                  <th className="px-4 py-2.5">Records Synced</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-2.5 font-mono">#{log.id}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-300 max-w-[200px] truncate">{log.sheetId}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-400">{log.recordsCount} items</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                      {new Date(log.syncedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <a
                        href={log.sheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
