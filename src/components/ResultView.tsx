import React, { useState } from 'react';
import {
  AlertOctagon,
  Binary,
  HelpCircle,
  Printer,
  UserPlus,
  Save,
  Check,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PredictionRecord } from '../types';
import { BayesianDagDiagram } from './BayesianDagDiagram';

interface ResultViewProps {
  record: PredictionRecord;
  onSave: (record: PredictionRecord) => void;
  onNewAssessment: () => void;
  onViewHistory: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  record,
  onSave,
  onNewAssessment,
  onViewHistory
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(record.isSaved ?? false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  const handleSaveClick = () => {
    setIsSaved(true);
    setSaveSuccessNotice(true);
    onSave(record);
    setTimeout(() => {
      setSaveSuccessNotice(false);
    }, 4000);
  };

  const isHigherRisk = record.riskCategory.includes('Higher');
  const isModerateRisk = record.riskCategory.includes('Moderate');

  const riskBadgeClasses = isHigherRisk
    ? 'bg-rose-100 text-rose-800 border-rose-300'
    : isModerateRisk
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const riskScoreColor = isHigherRisk
    ? 'text-rose-600'
    : isModerateRisk
    ? 'text-amber-600'
    : 'text-emerald-600';

  // Filter important contributing factors based on actual patient model outcome
  const highImpactFactors = record.keyFactors.filter(f => f.impact === 'higher_risk' || f.impact === 'moderate_risk');
  const protectiveFactors = record.keyFactors.filter(f => f.impact === 'protective');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Mandatory Non-Clinical Notice */}
      <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-xs">
        <div className="flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
              Academic / Non-Clinical Prediction Notice
            </h4>
            <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
              Educational prediction only — this system is not a certified medical diagnosis and must never be used for independent clinical treatment decisions. Probabilities reflect exact Bayesian inference given the parameterized baseline training population.
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Prediction Saved Successfully!</strong> Patient evaluation record ({record.mrn}) has been committed to the database and dashboard registry.
            </span>
          </div>
          <button
            onClick={onViewHistory}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
          >
            View in History <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Hero Prediction Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                MRN: {record.mrn}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-mono">
                Timestamp: {record.date}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              {record.patient.name}
              <span className="text-xs font-normal text-slate-500">
                ({record.patient.age} yrs, {record.patient.gender})
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bayesian Belief Network Inferred Likelihood: <strong className="text-slate-800">Heart Disease Presence</strong>
            </p>
          </div>

          {/* Probability & Risk Category Display Box */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 w-full lg:w-auto justify-between lg:justify-start">
            <div className="text-center sm:text-left pr-0 sm:pr-4 sm:border-r border-slate-200 w-full sm:w-auto">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Estimated Heart Disease Probability
              </div>
              <div className={`text-4xl font-extrabold ${riskScoreColor} mt-0.5`}>
                {record.bayesianProbability.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono">P(Disease = 1 | Evidence)</div>
            </div>

            <div className="w-full sm:w-auto text-center sm:text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Estimated Risk Category
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 shadow-xs border ${riskBadgeClasses}`}>
                <span className={`w-2 h-2 rounded-full ${isHigherRisk ? 'bg-rose-600 animate-ping' : isModerateRisk ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                {record.riskCategory}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {isHigherRisk
                  ? 'Recommend full cardiovascular diagnostic workup'
                  : isModerateRisk
                  ? 'Follow-up clinical monitoring & lifestyle review'
                  : 'Low conditional disease likelihood profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Vitals Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Blood Pressure</span>
            <span className="text-xs font-bold text-slate-800">{record.patient.bp} mm Hg</span>
            <span className={`text-[9px] block font-medium ${record.patient.bp >= 140 ? 'text-rose-600' : 'text-slate-500'}`}>
              {record.patient.bp >= 140 ? 'Stage 1 Hypertensive' : record.patient.bp >= 120 ? 'Prehypertension' : 'Normal'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Cholesterol</span>
            <span className="text-xs font-bold text-slate-800">{record.patient.chol} mg/dL</span>
            <span className={`text-[9px] block font-medium ${record.patient.chol >= 240 ? 'text-rose-600' : 'text-slate-500'}`}>
              {record.patient.chol >= 240 ? 'Hyperlipidemia' : record.patient.chol >= 200 ? 'Borderline' : 'Desirable'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Blood Sugar</span>
            <span className="text-xs font-bold text-slate-800">{record.patient.bs} mg/dL</span>
            <span className={`text-[9px] block font-medium ${record.patient.bs >= 126 ? 'text-amber-600' : 'text-slate-500'}`}>
              {record.patient.bs >= 126 ? 'Diabetic Range' : record.patient.bs >= 100 ? 'Impaired Fasting' : 'Normal'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">BMI Status</span>
            <span className="text-xs font-bold text-slate-800">{record.patient.bmi} kg/m²</span>
            <span className={`text-[9px] block font-medium ${record.patient.bmi >= 30 ? 'text-rose-600' : record.patient.bmi >= 25 ? 'text-amber-600' : 'text-slate-500'}`}>
              {record.patient.bmi >= 30 ? 'Obese Class I' : record.patient.bmi >= 25 ? 'Overweight' : 'Normal Weight'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Chest Pain</span>
            <span className="text-xs font-bold text-slate-800 truncate block">{record.patient.chestPain}</span>
            <span className={`text-[9px] block font-medium ${record.patient.chestPain === 'Typical Angina' ? 'text-rose-600' : 'text-slate-500'}`}>
              {record.patient.chestPain === 'Typical Angina' ? 'High correlation' : 'Non-ischemic'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Smoking / FamHx</span>
            <span className="text-xs font-bold text-slate-800">{record.patient.smoking} / {record.patient.familyHistory}</span>
            <span className={`text-[9px] block font-medium ${record.patient.smoking === 'Yes' || record.patient.familyHistory === 'Present' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {record.patient.smoking === 'Yes' && record.patient.familyHistory === 'Present' ? 'Dual Amplifiers' : 'Single/None'}
            </span>
          </div>
        </div>

        {/* Top Action Bar: Save Result & Print */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveClick}
              disabled={isSaved}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition active:scale-95 ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Prediction Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Prediction</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Clinical Summary</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewAssessment}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Prediction</span>
            </button>
            <button
              onClick={onViewHistory}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Grid: SciPy p-Value Analysis Table & Bayesian DAG Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. SciPy p-Value Table (Requirement 4) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-sky-600" />
                  Feature Hypothesis Significance (p-Value Results)
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated against Heart Disease Target (α = 0.05 threshold)
                </p>
              </div>
              <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                {record.significantFeatures.length} Significant Features
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px]">
                    <th className="py-2 px-2.5 font-semibold">Feature</th>
                    <th className="py-2 px-2.5 font-mono">Patient Value</th>
                    <th className="py-2 px-2.5 font-mono text-right">p-value</th>
                    <th className="py-2 px-2.5 text-right font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {record.pValues.map((row) => (
                    <tr
                      key={row.feature}
                      className={row.isSignificant ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}
                    >
                      <td className="py-2.5 px-2.5 font-sans font-medium text-slate-800">
                        {row.feature}
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-600">
                        {row.patientValue}
                      </td>
                      <td className={`py-2.5 px-2.5 text-right font-bold ${row.isSignificant ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {row.pValue < 0.0001 ? '< 0.0001' : row.pValue.toFixed(4)}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-sans">
                        {row.isSignificant ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold inline-block">
                            Significant (p &lt; 0.05)
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] px-2 py-0.5 rounded inline-block">
                            Not Significant (p ≥ 0.05)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Crucial Biostatistical Educational Distinction Note */}
          <div className="mt-5 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <strong className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Critical Statistical Principle:
            </strong>
            The <strong>p-value is NOT the probability that the patient has the disease</strong>. A p-value of 0.0001 simply measures the probability of observing this biomarker correlation by random chance under the null hypothesis (absence of relationship). The patient&apos;s actual disease probability is computed exclusively by the <strong>Bayesian Network model</strong>.
          </div>
        </div>

        {/* 2. Visual Bayesian Network DAG (Requirement 5) */}
        <BayesianDagDiagram
          patient={record.patient}
          probability={record.bayesianProbability}
        />
      </div>

      {/* 3. Important Factors Contributing to Model Result (Requirement 7) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Important Factors Influencing Model Outcome
            </h3>
            <p className="text-xs text-slate-500">
              Evidence weights derived from this patient&apos;s data conditioned on the trained Bayesian CPD matrix
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2.5 py-1 rounded-md border border-slate-200">
            Patient Model Evidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Elevating / Contributing Risk Factors */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                Contributing Risk Factors ({highImpactFactors.length})
              </h4>
              <span className="text-[10px] text-rose-700 font-semibold font-mono">Odds Multipliers</span>
            </div>

            {highImpactFactors.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No significant elevated risk factors identified for this profile.</p>
            ) : (
              <div className="space-y-2">
                {highImpactFactors.map((factor) => (
                  <div key={factor.name} className="p-2.5 rounded-lg bg-white border border-rose-100 shadow-2xs text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{factor.name}</span>
                      <span className="text-rose-600 font-mono text-[11px] font-bold">{factor.oddsRatio}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{factor.clinicalRationale}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Protective / Normal Biomarkers */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Protective / Normal Factors ({protectiveFactors.length})
              </h4>
              <span className="text-[10px] text-emerald-700 font-semibold font-mono">Risk Buffers</span>
            </div>

            {protectiveFactors.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No protective indicators recorded.</p>
            ) : (
              <div className="space-y-2">
                {protectiveFactors.map((factor) => (
                  <div key={factor.name} className="p-2.5 rounded-lg bg-white border border-emerald-100 shadow-2xs text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{factor.name}</span>
                      <span className="text-emerald-700 font-mono text-[11px] font-bold">{factor.oddsRatio}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{factor.clinicalRationale}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
