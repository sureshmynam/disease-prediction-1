import React from 'react';
import {
  ShieldCheck,
  FunctionSquare,
  Database,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { POPULATION_P_VALUES } from '../services/bayesianEngine';

export const AdminView: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Administrative & Biostatistical Model Telemetry
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Verification of SciPy hypothesis tests, Bayesian CPD matrices, and data engine health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full font-semibold font-mono">
            Role: Authorized Clinician/Admin
          </span>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-500 uppercase font-semibold">Registered Clinicians</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">14 Users</div>
          <span className="text-[10px] text-slate-400 font-mono">PBKDF2 Password Hashed</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-500 uppercase font-semibold">Reference Dataset</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">303 Records</div>
          <span className="text-[10px] text-emerald-600 font-medium">UCI Cleveland Heart Set</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-500 uppercase font-semibold">Inference Model</span>
          <div className="text-2xl font-bold text-purple-700 mt-1">pgmpy BBN</div>
          <span className="text-[10px] text-slate-400 font-mono">Bayesian Estimator (BDeu)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-500 uppercase font-semibold">Database Engine</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">SQLite 3.42</div>
          <span className="text-[10px] text-slate-400 font-mono">3 Normalized Tables</span>
        </div>
      </div>

      {/* Mathematical & Architectural Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-2xs space-y-3">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FunctionSquare className="w-4 h-4 text-sky-600" />
            Bayesian Conditional Probability Formula
          </h4>
          <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto">
            P(Disease | E_1, ..., E_k) = α · P(Disease) · ∏ P(E_i | Parents(E_i))
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Directed Acyclic Graph structure encodes conditional independence assumptions. Variables like Blood Pressure and Cholesterol are conditioned on Age, while Heart Disease presence is conditioned on hemodynamic and lifestyle risk factors. Exact inference uses Variable Elimination over Discrete Bayesian Network CPDs.
          </p>
        </div>

        <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-2xs space-y-3">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-sky-600" />
            Relational Database Schema (SQLite)
          </h4>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-700 space-y-1">
            <div><strong>users:</strong> (id PK, username UNIQUE, password_hash, role, created_at)</div>
            <div><strong>patients:</strong> (id PK, name, age, gender, created_at)</div>
            <div><strong>predictions:</strong> (id PK, patient_id FK, bp, chol, bs, hr, bmi, smoking, chest_pain, fam_hist, probability, risk_category, significant_features, created_at)</div>
          </div>
        </div>
      </div>

      {/* Model Training Feature Parameters & p-Values Table */}
      <div>
        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
          Model Feature Significance Parameters (Threshold α = 0.05)
        </h4>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Biomarker Feature</th>
                <th className="py-2.5 px-3">Statistical Test Employed</th>
                <th className="py-2.5 px-3 font-mono">Test Statistic</th>
                <th className="py-2.5 px-3 font-mono">p-value</th>
                <th className="py-2.5 px-3">α = 0.05 Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {Object.entries(POPULATION_P_VALUES).map(([name, data]) => (
                <tr key={name} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-sans font-semibold text-slate-900">{name}</td>
                  <td className="py-2 px-3 font-sans text-slate-600">{data.test}</td>
                  <td className="py-2 px-3 text-slate-800">{data.stat}</td>
                  <td className={`py-2 px-3 font-bold ${data.isSig ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {data.p < 0.0001 ? '< 0.00001' : data.p.toFixed(5)}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    {data.isSig ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Statistically Significant
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-slate-400" /> Not Significant (p ≥ 0.05)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
