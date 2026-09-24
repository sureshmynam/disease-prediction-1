import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  PatientInput,
  PredictionRecord,
  DashboardStats
} from './types';
import { ApiService } from './services/apiService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PatientFormView } from './components/PatientFormView';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { AdminView } from './components/AdminView';
import { CodeViewerView } from './components/CodeViewerView';
import { AnalysisLoadingModal } from './components/AnalysisLoadingModal';
import {
  Activity,
  LayoutDashboard,
  Stethoscope,
  FileBadge2,
  History,
  Sliders,
  FileCode,
  X
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [historyRecords, setHistoryRecords] = useState<PredictionRecord[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 1428,
    totalPredictions: 3892,
    significantFeaturesRatio: '7 / 10',
    avgBayesianConfidence: 87.4,
    riskDistribution: { lower: 46.2, moderate: 32.8, higher: 21.0 }
  });

  const [activePrediction, setActivePrediction] = useState<PredictionRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [pendingPatient, setPendingPatient] = useState<PatientInput | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Initialize and load historical records & dashboard telemetry
  useEffect(() => {
    async function loadData() {
      const records = await ApiService.getHistory();
      setHistoryRecords(records);
      if (records.length > 0 && !activePrediction) {
        setActivePrediction(records[0]);
      }
      const stats = await ApiService.getDashboard();
      setDashboardStats(stats);
    }
    loadData();
  }, []);

  // 1. Triggered when user clicks "Start Prediction", "New Prediction", or "Assess Patient"
  const handleStartPrediction = () => {
    setCurrentTab('prediction');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Triggered when user requests prediction (defaults to direct prediction without modal wait)
  const handleAnalyzePatient = async (patient: PatientInput, showModal: boolean = false) => {
    setPendingPatient(patient);

    // Compute prediction through ApiService
    const resultRecord = await ApiService.predict(patient);
    setActivePrediction(resultRecord);

    if (showModal) {
      setIsAnalyzing(true);
    } else {
      setIsAnalyzing(false);
      setCurrentTab('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 3. Called when the 6-step analysis modal completes animation
  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setCurrentTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Save prediction handler (Requirement 8)
  const handleSavePrediction = async (record: PredictionRecord) => {
    const { record: savedRec } = await ApiService.savePrediction(record);
    setActivePrediction(savedRec);

    // Refresh history
    const updatedHistory = await ApiService.getHistory();
    setHistoryRecords(updatedHistory);

    // Refresh dashboard stats (Requirement 10)
    const updatedDashboard = await ApiService.getDashboard();
    setDashboardStats(updatedDashboard);
  };

  // 5. View specific historical prediction (Requirement 9)
  const handleViewRecord = (record: PredictionRecord) => {
    setActivePrediction(record);
    setCurrentTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tab switcher
  const handleSelectTab = (tab: ActiveTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans">
      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/80 backdrop-blur-xs">
          <div className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" />
                  <span className="font-bold text-white text-sm">CardioBayes.ai</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                <button
                  onClick={() => handleSelectTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentTab === 'dashboard' ? 'bg-sky-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => handleSelectTab('prediction')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentTab === 'prediction' ? 'bg-sky-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" /> New Assessment
                </button>
                <button
                  onClick={() => handleSelectTab('result')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentTab === 'result' ? 'bg-sky-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <FileBadge2 className="w-4 h-4" /> Assessment Result
                </button>
                <button
                  onClick={() => handleSelectTab('history')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentTab === 'history' ? 'bg-sky-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <History className="w-4 h-4" /> Patient History
                </button>
                <button
                  onClick={() => handleSelectTab('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentTab === 'admin' ? 'bg-sky-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <Sliders className="w-4 h-4" /> Admin & Model Stats
                </button>
                <button
                  onClick={() => handleSelectTab('code-viewer')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    currentTab === 'code-viewer' ? 'bg-sky-600 text-white' : 'text-slate-300'
                  }`}
                >
                  <FileCode className="w-4 h-4" /> Python / Flask Source
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          hasActiveResult={!!activePrediction}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
          {/* Top Header */}
          <Header
            currentTab={currentTab}
            onStartPrediction={handleStartPrediction}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
          />

          {/* Dynamic Content Views */}
          <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto pb-16">
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={dashboardStats}
                recentRecords={historyRecords}
                onStartPrediction={handleStartPrediction}
                onViewRecord={handleViewRecord}
                onViewAllHistory={() => handleSelectTab('history')}
              />
            )}

            {currentTab === 'prediction' && (
              <PatientFormView
                onAnalyze={handleAnalyzePatient}
                initialPatient={pendingPatient}
              />
            )}

            {currentTab === 'result' && activePrediction && (
              <ResultView
                record={activePrediction}
                onSave={handleSavePrediction}
                onNewAssessment={handleStartPrediction}
                onViewHistory={() => handleSelectTab('history')}
              />
            )}

            {currentTab === 'result' && !activePrediction && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
                <FileBadge2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800">No Assessment Loaded</h3>
                <p className="text-xs text-slate-500">
                  Please intake a new patient or select a record from the history registry.
                </p>
                <button
                  onClick={handleStartPrediction}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition"
                >
                  Start Prediction
                </button>
              </div>
            )}

            {currentTab === 'history' && (
              <HistoryView
                records={historyRecords}
                onViewRecord={handleViewRecord}
                onNewPrediction={handleStartPrediction}
              />
            )}

            {currentTab === 'admin' && <AdminView />}

            {currentTab === 'code-viewer' && <CodeViewerView />}
          </div>
        </main>
      </div>

      {/* 6-Step Analysis Loading Modal */}
      <AnalysisLoadingModal
        isOpen={isAnalyzing}
        onComplete={handleAnalysisComplete}
        patientName={pendingPatient?.name || ''}
      />
    </div>
  );
}
