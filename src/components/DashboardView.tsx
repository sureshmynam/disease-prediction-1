import React, { useState } from 'react';
import {
  Users,
  Cpu,
  Sigma,
  Sparkles,
  TrendingUp,
  PieChart,
  ArrowRight,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { DashboardStats, PredictionRecord } from '../types';
import { POPULATION_P_VALUES } from '../services/bayesianEngine';

interface DashboardViewProps {
  stats: DashboardStats;
  recentRecords: PredictionRecord[];
  onStartPrediction: () => void;
  onViewRecord: (record: PredictionRecord) => void;
  onViewAllHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentRecords,
  onStartPrediction,
  onViewRecord,
  onViewAllHistory
}) => {
  const [filterStrata, setFilterStrata] = useState<string>('ALL');

  const filteredRecs = recentRecords.filter((rec) => {
    if (filterStrata === 'LOWER') return rec.riskCategory.includes('Lower');
    if (filterStrata === 'MODERATE') return rec.riskCategory.includes('Moderate');
    if (filterStrata === 'HIGHER') return rec.riskCategory.includes('Higher');
    return true;
  }).slice(0, 5);

  // Prepare data for p-Value significance bar chart
  const pValueFeatures = [
    { name: 'Chest Pain (cp)', p: 0.00001, isSig: true },
    { name: 'Patient Age (age)', p: 0.00007, isSig: true },
    { name: 'Family History CAD', p: 0.00018, isSig: true },
    { name: 'Smoking History', p: 0.00033, isSig: true },
    { name: 'Resting Blood Pressure', p: 0.0115, isSig: true },
    { name: 'Serum Cholesterol', p: 0.0332, isSig: true },
    { name: 'Body Mass Index (BMI)', p: 0.0384, isSig: true },
    { name: 'Resting Heart Rate', p: 0.1782, isSig: false },
    { name: 'Fasting Blood Sugar', p: 0.6481, isSig: false },
    { name: 'Gender (Sex)', p: 0.062, isSig: false }
  ];

  // Log scale conversion: -log10(p) clamped between 0 and 5
  const chartBars = pValueFeatures.map(f => ({
    ...f,
    logScore: Math.min(5.0, -Math.log10(f.p))
  }));

  // Donut chart calculations
  const { lower, moderate, higher } = stats.riskDistribution;
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.55

  const lowerDash = (lower / 100) * circumference;
  const modDash = (moderate / 100) * circumference;
  const highDash = (higher / 100) * circumference;

  const lowerOffset = 0;
  const modOffset = -lowerDash;
  const highOffset = -(lowerDash + modDash);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Key Metrics 4-Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Patients
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalPatients.toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +12% this month
            </p>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Evaluations Run */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Evaluations Run
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalPredictions.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono text-[11px]">
              pgmpy exact inference
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Significant Features */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Significant Features
            </p>
            <h3 className="text-2xl font-bold text-teal-600 mt-1">
              {stats.significantFeaturesRatio}
            </h3>
            <p className="text-xs text-teal-700 mt-1 font-medium">
              p &lt; 0.05 (Chi-Square & T-Test)
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <Sigma className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Bayesian Confidence */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Avg Bayesian Confidence
            </p>
            <h3 className="text-2xl font-bold text-sky-700 mt-1">
              {stats.avgBayesianConfidence}%
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono text-[11px]">
              Dirichlet prior estimation
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Charts Row: p-Value Profile & Risk Stratification Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Feature Statistical Significance (p-Value Profile) SVG Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Feature Statistical Significance (p-Value Profile)
                </h3>
                <p className="text-xs text-slate-500">
                  Null hypothesis rejected when p &lt; 0.05 (dashed red threshold at -log10 ≈ 1.30)
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                SciPy 1.11 Engine
              </span>
            </div>

            {/* Interactive SVG Bar Chart */}
            <div className="h-64 w-full relative">
              <svg viewBox="0 0 540 200" className="w-full h-full select-none">
                {/* Horizontal grid lines */}
                <line x1="40" y1="20" x2="520" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="55" x2="520" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="90" x2="520" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="125" x2="520" y2="125" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="160" x2="520" y2="160" stroke="#cbd5e1" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="25" y="24" className="text-[9px] fill-slate-400 font-mono">5.0</text>
                <text x="25" y="94" className="text-[9px] fill-slate-400 font-mono">2.5</text>
                <text x="25" y="164" className="text-[9px] fill-slate-400 font-mono">0.0</text>

                {/* α = 0.05 Threshold Line (-log10(0.05) ≈ 1.301, y = 160 - (1.301/5.0)*140 = 123.5) */}
                <line
                  x1="40"
                  y1="123.5"
                  x2="520"
                  y2="123.5"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text x="440" y="118" className="text-[8px] fill-rose-600 font-bold font-mono">
                  α = 0.05 cutoff
                </text>

                {/* Bars */}
                {chartBars.map((bar, idx) => {
                  const barWidth = 34;
                  const barX = 48 + idx * 47;
                  const barHeight = (bar.logScore / 5.0) * 140;
                  const barY = 160 - barHeight;

                  return (
                    <g key={bar.name} className="group cursor-pointer">
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={bar.isSig ? '#059669' : '#94a3b8'}
                        className="transition-all duration-200 group-hover:opacity-85"
                      />
                      <title>{`${bar.name}\nRaw p-value: ${bar.p < 0.0001 ? '<0.0001' : bar.p}\nStatus: ${bar.isSig ? 'Statistically Significant' : 'Not Significant'}`}</title>
                      <text
                        x={barX + barWidth / 2}
                        y="172"
                        transform={`rotate(35, ${barX + barWidth / 2}, 172)`}
                        className="text-[8px] fill-slate-500 font-sans"
                        textAnchor="start"
                      >
                        {bar.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2">
            <span><strong className="text-emerald-700 font-semibold">Green:</strong> Significant predictor (p &lt; 0.05)</span>
            <span><strong className="text-slate-500 font-semibold">Gray:</strong> Non-significant (p ≥ 0.05)</span>
            <span className="font-mono text-[10px]">Log Scale [-log10(p-value)]</span>
          </div>
        </div>

        {/* Risk Stratification Distribution Donut */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Risk Stratification Distribution</h3>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            {/* SVG Donut Chart */}
            <div className="h-52 relative flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-44 h-44 select-none transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                />
                {/* Lower Risk Segment */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${lowerDash} ${circumference}`}
                  strokeDashoffset={lowerOffset}
                  className="transition-all duration-500 ease-out"
                />
                {/* Moderate Risk Segment */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray={`${modDash} ${circumference}`}
                  strokeDashoffset={modOffset}
                  className="transition-all duration-500 ease-out"
                />
                {/* Higher Risk Segment */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="20"
                  strokeDasharray={`${highDash} ${circumference}`}
                  strokeDashoffset={highOffset}
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Cohort</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5">N={stats.totalPatients}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Lower Risk (&lt;35%)
              </span>
              <span className="font-bold text-slate-800 font-mono">{lower.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate Risk (35–70%)
              </span>
              <span className="font-bold text-slate-800 font-mono">{moderate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Higher Risk (&gt;70%)
              </span>
              <span className="font-bold text-slate-800 font-mono">{higher.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Clinical Bayesian Assessments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Clinical Bayesian Assessments</h3>
            <p className="text-xs text-slate-500">Live feed from SQLite database of recent model inferences</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStrata}
              onChange={(e) => setFilterStrata(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">All Risk Strata</option>
              <option value="LOWER">Lower Risk (&lt;35%)</option>
              <option value="MODERATE">Moderate Risk (35–70%)</option>
              <option value="HIGHER">Higher Risk (&gt;70%)</option>
            </select>

            <button
              onClick={onViewAllHistory}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold px-2 py-1 flex items-center gap-1 transition"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Patient Name / MRN</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Vitals & Labs</th>
                <th className="py-3 px-4">Key Significant Factors</th>
                <th className="py-3 px-4">Bayesian Probability</th>
                <th className="py-3 px-4">Stratification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecs.map((rec) => {
                const isHigh = rec.riskCategory.includes('Higher');
                const isMod = rec.riskCategory.includes('Moderate');

                const badgeColor = isHigh
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isMod
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={rec.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{rec.patient.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.mrn}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div>{rec.patient.age} yrs</div>
                      <div className="text-slate-400 text-[10px]">{rec.patient.gender}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>BP: {rec.patient.bp} mmHg</div>
                      <div className="text-slate-500 text-[10px]">
                        Chol: {rec.patient.chol} | BS: {rec.patient.bs}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200">
                        {rec.patient.chestPain} &bull; Smk: {rec.patient.smoking}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-slate-900 font-mono">
                        {rec.bayesianProbability.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-400">P(CAD | Evidence)</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {rec.riskCategory}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewRecord(rec)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-semibold p-1 hover:bg-sky-50 rounded transition flex items-center gap-1 ml-auto"
                        title="Inspect full Bayesian and p-value report"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quick Launch Banner at Bottom of Dashboard */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <strong>Ready for clinical intake?</strong> Enter new patient vitals to run hypothesis screening and exact Variable Elimination.
          </div>
          <button
            onClick={onStartPrediction}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95 self-start sm:self-auto shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Start Prediction
          </button>
        </div>
      </div>
    </div>
  );
};
