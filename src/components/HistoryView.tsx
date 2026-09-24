import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Eye,
  Filter,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { PredictionRecord, RiskTier } from '../types';

interface HistoryViewProps {
  records: PredictionRecord[];
  onViewRecord: (record: PredictionRecord) => void;
  onNewPrediction: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onViewRecord,
  onNewPrediction
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.mrn.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (riskFilter === 'LOWER') return rec.riskCategory.includes('Lower');
    if (riskFilter === 'MODERATE') return rec.riskCategory.includes('Moderate');
    if (riskFilter === 'HIGHER') return rec.riskCategory.includes('Higher');
    return true;
  });

  const exportCSV = () => {
    let csv = 'ID,Date,Patient Name,MRN,Age,Gender,BP,Cholesterol,BloodSugar,BMI,Smoking,ChestPain,FamilyHistory,Probability,RiskCategory\n';
    filteredRecords.forEach((r) => {
      csv += `${r.id},"${r.date}","${r.patient.name}",${r.mrn},${r.patient.age},${r.patient.gender},${r.patient.bp},${r.patient.chol},${r.patient.bs},${r.patient.bmi},${r.patient.smoking},"${r.patient.chestPain}",${r.patient.familyHistory},${r.bayesianProbability},"${r.riskCategory}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cardiobayes_predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            Patient Longitudinal Prediction Registry
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Persistent database records of evaluated Bayesian probabilities and significance profiles ({filteredRecords.length} records)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by patient name or MRN..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-52 bg-slate-50 text-slate-700"
            />
          </div>

          {/* Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Risk Strata</option>
            <option value="LOWER">Lower Risk (&lt;35%)</option>
            <option value="MODERATE">Moderate Risk (35–70%)</option>
            <option value="HIGHER">Higher Risk (&gt;70%)</option>
          </select>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition active:scale-95"
            title="Export CSV of current view"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table (Requirement 9) */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Age / Sex</th>
              <th className="py-3 px-4 font-mono">Probability</th>
              <th className="py-3 px-4">Estimated Risk</th>
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4 text-right">View Prediction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                  No prediction records found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const isHigh = rec.riskCategory.includes('Higher');
                const isMod = rec.riskCategory.includes('Moderate');

                const badgeColor = isHigh
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isMod
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-sky-700 transition">
                        {rec.patient.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {rec.mrn} &bull; BP: {rec.patient.bp} mmHg &bull; Chol: {rec.patient.chol}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>{rec.patient.age} yrs</div>
                      <div className="text-slate-400 text-[10px]">{rec.patient.gender}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-extrabold text-sm text-slate-900">
                        {rec.bayesianProbability.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-400">P(CAD | Evidence)</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {rec.riskCategory}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {rec.date}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewRecord(rec)}
                        className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-semibold px-2.5 py-1 rounded-md hover:bg-sky-50 transition border border-transparent hover:border-sky-200 active:scale-95"
                        title="View complete prediction results"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info & New Prediction Quick Action */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span className="flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          Showing {filteredRecords.length} of {records.length} historical evaluations
        </span>
        <button
          onClick={onNewPrediction}
          className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
        >
          + New Prediction
        </button>
      </div>
    </div>
  );
};
