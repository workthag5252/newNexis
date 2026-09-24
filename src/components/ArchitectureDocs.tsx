import React, { useState } from 'react';
import { Terminal, Copy, Check, Server, Database, Bot, FileSpreadsheet, Shield, Layers, Box } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dockerComposeCode = `version: '3.8'

services:
  db:
    image: mysql:8.4
    container_name: nexus_mysql_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:-root_password}
      MYSQL_DATABASE: \${MYSQL_DATABASE:-nexus_ai_db}
      MYSQL_USER: \${MYSQL_USER:-nexus_user}
      MYSQL_PASSWORD: \${MYSQL_PASSWORD:-nexus_password}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: nexus_backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://nexus_user:nexus_password@db:3306/nexus_ai_db
      JWT_SECRET: \${JWT_SECRET}
      OPENAI_API_KEY: \${OPENAI_API_KEY}
      OPENAI_MODEL: \${OPENAI_MODEL:-gpt-4o-mini}
      GOOGLE_SHEET_ID: \${GOOGLE_SHEET_ID}

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: nexus_frontend
    ports:
      - "3000:3000"

volumes:
  mysql_data:`;

  const runCommands = `# 1. Clone or open the project folder
git clone <repo-url> && cd project

# 2. Configure .env file
cp .env.example .env
# Edit .env and insert your OPENAI_API_KEY and passwords

# 3. Launch everything in one command with Docker Compose
docker compose up --build -d

# 4. Access points:
# Frontend Web App:   http://localhost:3000
# FastAPI Backend:    http://localhost:8000
# Interactive Docs:   http://localhost:8000/docs
# MySQL 8.4 Server:   localhost:3306`;

  const projectTree = `project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app initialization, CORS & routers
│   │   ├── database.py          # SQLAlchemy 2.x engine & SessionLocal
│   │   ├── models.py            # User, AiInteraction, SheetSyncLog models
│   │   ├── schemas.py           # Pydantic 2.x request & response schemas
│   │   ├── auth.py              # PyJWT encode/decode & pwdlib password hashing
│   │   ├── config.py            # Pydantic BaseSettings (.env reader)
│   │   ├── dependencies.py      # HTTPBearer & get_current_user
│   │   ├── routers/
│   │   │   ├── auth.py          # /api/auth/register, /login, /me
│   │   │   ├── users.py         # /api/users
│   │   │   ├── ai.py            # /api/ai/chat, /history
│   │   │   └── sheets.py        # /api/sheets/sync, /config
│   │   └── services/
│   │       ├── ai_service.py    # OpenAI GPT API client integration
│   │       └── sheets_service.py# Google Sheets v4 API synchronization
│   ├── requirements.txt         # FastAPI, SQLAlchemy, PyMySQL, PyJWT, pwdlib, etc.
│   └── Dockerfile               # Python 3.13-slim container definition
├── docker-compose.yml           # MySQL 8.4 + Backend + Frontend orchestration
├── Dockerfile.frontend          # Node.js production image
├── .env.example                 # Secrets & environment template
├── server.ts                    # Full-stack Node/Express runner for AI Studio
└── src/                         # React + TypeScript + Tailwind UI`;

  return (
    <div className="space-y-6 text-left">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Project Architecture &amp; Deployment Guide
            </h1>
            <p className="text-xs text-slate-400">
              Архитектура веб-приложения: FastAPI + MySQL 8.4 + OpenAI GPT + Google Sheets + Docker
            </p>
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-2.5">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-white">Backend</p>
              <p className="text-[10px] text-slate-400">Python 3.13 FastAPI</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-2.5">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-white">Database</p>
              <p className="text-[10px] text-slate-400">MySQL 8.4 + SQLAlchemy</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-2.5">
            <Bot className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-white">AI Engine</p>
              <p className="text-[10px] text-slate-400">OpenAI GPT-4o-mini</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-2.5">
            <FileSpreadsheet className="w-4 h-4 text-green-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-white">Google Workspace</p>
              <p className="text-[10px] text-slate-400">Google Sheets API v4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Structure */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Box className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Структура проекта (Project Tree)</h2>
          </div>
          <button
            onClick={() => copySnippet(projectTree, 'tree')}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
          >
            {copiedId === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'tree' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
          {projectTree}
        </pre>
      </div>

      {/* Docker Compose Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">docker-compose.yml</h2>
          </div>
          <button
            onClick={() => copySnippet(dockerComposeCode, 'docker')}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
          >
            {copiedId === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'docker' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
          {dockerComposeCode}
        </pre>
      </div>

      {/* Quick Start Commands */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Команды запуска (Quick Start)</h2>
          </div>
          <button
            onClick={() => copySnippet(runCommands, 'commands')}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
          >
            {copiedId === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'commands' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
          {runCommands}
        </pre>
      </div>
    </div>
  );
};
