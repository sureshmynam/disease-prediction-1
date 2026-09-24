import React from 'react';
import {
  ShieldAlert,
  Search,
  PlusCircle,
  UserCheck,
  Menu,
  Activity
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  currentTab: ActiveTab;
  onStartPrediction: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onToggleMobileMenu?: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string; badge: string }> = {
  dashboard: {
    title: 'Biostatistical Clinical Dashboard',
    subtitle: 'Hypothesis significance testing (p < 0.05) & Directed Acyclic Graph (DAG) Bayesian inference',
    badge: 'UCI Cleveland Heart Set'
  },
  prediction: {
    title: 'New Patient Bayesian Assessment Intake',
    subtitle: 'Input comprehensive clinical biomarkers for automated p-value hypothesis screening & Bayesian inference',
    badge: 'Active Evaluation'
  },
  result: {
    title: 'Clinical Bayesian & Hypothesis Analysis Summary',
    subtitle: 'Evaluated conditional probability distribution, risk tier, and feature p-value significance table',
    badge: 'Inference Complete'
  },
  history: {
    title: 'Patient Longitudinal Prediction Registry',
    subtitle: 'Persistent clinical database records of historical Bayesian network evaluations and risk categories',
    badge: 'Database Records'
  },
  admin: {
    title: 'Administrative Control & pgmpy Model Telemetry',
    subtitle: 'Direct verification of SciPy hypothesis tests, Bayesian CPD matrices, and data engine health',
    badge: 'Telemetry & CPDs'
  },
  'code-viewer': {
    title: 'Complete Backend Architecture & Source Code',
    subtitle: 'Inspect production Python Flask web server, pgmpy Bayesian engine, and SciPy statistical scripts',
    badge: 'Flask API Ready'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onStartPrediction,
  onSearchChange,
  searchQuery,
  onToggleMobileMenu
}) => {
  const currentMeta = TAB_TITLES[currentTab] || TAB_TITLES.dashboard;

  return (
    <>
      {/* Top Emergency / Regulatory Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 max-w-5xl">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="truncate sm:overflow-visible">
            <strong>Academic & Clinical Research Notice:</strong> Educational statistical prediction system only — this application is not a certified medical device and must never substitute for licensed clinical diagnosis or treatment planning.
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-amber-800 shrink-0">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Bayesian Engine v2.4 (Active)
          </span>
          <span className="text-amber-300">|</span>
          <span className="font-mono text-[11px]">α = 0.05 Threshold</span>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="md:hidden flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {currentMeta.title}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200 shrink-0">
                {currentMeta.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Quick Actions & Search */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search patient MRN, name..."
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 w-56 text-slate-700"
            />
          </div>

          <button
            onClick={onStartPrediction}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
            title="Start New Patient Prediction Workflow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Assess Patient</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <button
            onClick={() => alert('Authenticated Clinician Session: Dr. Sarah Vance, MD (PBKDF2-SHA256 Token Active)')}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-md hover:bg-slate-100 hidden sm:block"
            title="Clinician Account Details"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </header>
    </>
  );
};
