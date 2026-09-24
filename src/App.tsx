/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { TokenModal } from './components/TokenModal';
import { AiStudio } from './components/AiStudio';
import { SheetsHub } from './components/SheetsHub';
import { DatabaseViewer } from './components/DatabaseViewer';
import { ApiTester } from './components/ApiTester';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { api, authStorage } from './services/api';
import { User, SystemStatus } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ai');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTokenOpen, setIsTokenOpen] = useState(false);

  useEffect(() => {
    // Check local storage for authenticated user
    const savedUser = authStorage.getUser();
    const token = authStorage.getToken();
    if (savedUser && token) {
      setUser(savedUser);
      // Verify token with backend
      api.getProfile()
        .then((u) => setUser(u))
        .catch(() => {
          // If expired, clear
          authStorage.removeToken();
          setUser(null);
        });
    }

    // Load initial system status
    api.getSystemStatus()
      .then((s) => setStatus(s))
      .catch((e) => console.warn('Could not load system status', e));
  }, []);

  const handleLogout = () => {
    authStorage.removeToken();
    setUser(null);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    // Refresh system status
    api.getSystemStatus().then(setStatus).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        user={user}
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenTokenModal={() => setIsTokenOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ai' && (
          <AiStudio
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSyncToSheets={() => setActiveTab('sheets')}
          />
        )}

        {activeTab === 'sheets' && (
          <SheetsHub
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseViewer
            currentUser={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'api' && (
          <ApiTester
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'docs' && (
          <ArchitectureDocs />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>NexusAI Platform • FastAPI Backend • MySQL 8.4 • OpenAI GPT API • Google Sheets</p>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>JWT Bearer HS256</span>
            <span>•</span>
            <span>Docker Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <TokenModal
        isOpen={isTokenOpen}
        onClose={() => setIsTokenOpen(false)}
      />
    </div>
  );
}
