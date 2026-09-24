import React from 'react';
import {
  Activity,
  LayoutDashboard,
  Stethoscope,
  FileBadge2,
  History,
  Sliders,
  FileCode,
  Radio
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveResult: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  hasActiveResult
}) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 hidden md:flex min-h-screen">
      <div>
        {/* Brand / Logo Area */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
              CardioBayes<span className="text-cyan-400">.ai</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">BayesNet & p-Value Suite</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-3 py-2">
            Clinical Portal
          </div>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>

          <button
            onClick={() => onSelectTab('prediction')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'prediction'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> New Assessment
          </button>

          <button
            onClick={() => onSelectTab('result')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'result'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <FileBadge2 className="w-4 h-4" /> Assessment Result
            </span>
            {hasActiveResult && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'history'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Patient History
          </button>

          <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-3 pt-5 pb-2">
            Academic & System
          </div>

          <button
            onClick={() => onSelectTab('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'admin'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" /> Admin & Model Stats
          </button>

          <button
            onClick={() => onSelectTab('code-viewer')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'code-viewer'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" /> Python / Flask Source
          </button>
        </nav>
      </div>

      {/* User / Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-white text-xs">
            DR
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">Dr. Sarah Vance, MD</div>
            <div className="text-[10px] text-cyan-400 font-mono">Biostatistician / Admin</div>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 bg-slate-800/80 rounded p-2 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            pgmpy + SciPy
          </span>
          <span className="text-emerald-400 font-medium">Online</span>
        </div>
      </div>
    </aside>
  );
};
