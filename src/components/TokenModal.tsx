import React, { useState } from 'react';
import { authStorage } from '../services/api';
import { Key, X, Copy, Check, ShieldCheck, Clock } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const token = authStorage.getToken();

  if (!isOpen) return null;

  let decodedHeader: any = null;
  let decodedPayload: any = null;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        decodedHeader = JSON.parse(atob(parts[0]));
        decodedPayload = JSON.parse(atob(parts[1]));
      }
    } catch (e) {
      console.warn('Token parse error', e);
    }
  }

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white text-left">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Active JWT Access Token</h2>
            <p className="text-xs text-slate-400">Bearer Token Header Payload</p>
          </div>
        </div>

        {token ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-300">Raw Bearer Token</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 break-all max-h-24 overflow-y-auto">
                {token}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Algorithm</span>
                <p className="text-xs font-mono font-semibold text-indigo-300 mt-1">HS256</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase">User Role</span>
                <p className="text-xs font-mono font-semibold text-emerald-300 mt-1 uppercase">
                  {decodedPayload?.role || 'user'}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-300 block mb-1.5 font-mono">
                Decoded Claims Payload
              </span>
              <pre className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify(decodedPayload || {}, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No active token. Please sign in to generate a session JWT.
          </div>
        )}
      </div>
    </div>
  );
};
