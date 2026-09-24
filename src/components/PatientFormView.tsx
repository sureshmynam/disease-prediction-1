import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  User,
  HeartPulse,
  ActivitySquare,
  Info,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Calculator,
  RotateCcw,
  Zap,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { PatientInput } from '../types';
import { computeBayesianInference } from '../services/bayesianEngine';

interface PatientFormViewProps {
  onAnalyze: (patient: PatientInput, showModal?: boolean) => void;
  initialPatient?: PatientInput | null;
}

const DEFAULT_PATIENT: PatientInput = {
  name: 'Eleanor Campbell',
  age: 62,
  gender: 'Female',
  bp: 148,
  chol: 268,
  bs: 136,
  hr: 84,
  bmi: 31.4,
  smoking: 'Yes',
  chestPain: 'Typical Angina',
  familyHistory: 'Present'
};

export const PatientFormView: React.FC<PatientFormViewProps> = ({
  onAnalyze,
  initialPatient
}) => {
  const [formData, setFormData] = useState<PatientInput>(initialPatient || DEFAULT_PATIENT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topErrorMessage, setTopErrorMessage] = useState<string | null>(null);

  // Field change handler
  const handleChange = (field: keyof PatientInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (topErrorMessage) setTopErrorMessage(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required.';
    }

    if (isNaN(formData.age) || formData.age < 18 || formData.age > 110) {
      newErrors.age = 'Please enter a valid age (18–110 years).';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select biological gender.';
    }

    if (isNaN(formData.bp) || formData.bp < 60 || formData.bp > 260) {
      newErrors.bp = 'Blood pressure is required (60–260 mm Hg).';
    }

    if (isNaN(formData.chol) || formData.chol < 80 || formData.chol > 650) {
      newErrors.chol = 'Cholesterol is required (80–650 mg/dL).';
    }

    if (isNaN(formData.bs) || formData.bs < 40 || formData.bs > 500) {
      newErrors.bs = 'Blood sugar is required (40–500 mg/dL).';
    }

    if (isNaN(formData.hr) || formData.hr < 40 || formData.hr > 220) {
      newErrors.hr = 'Heart rate is required (40–220 bpm).';
    }

    if (isNaN(formData.bmi) || formData.bmi < 12 || formData.bmi > 65) {
      newErrors.bmi = 'Please enter a valid BMI (12.0–65.0).';
    }

    if (!formData.smoking) {
      newErrors.smoking = 'Smoking status is required.';
    }

    if (!formData.chestPain) {
      newErrors.chestPain = 'Chest pain presentation is required.';
    }

    if (!formData.familyHistory) {
      newErrors.familyHistory = 'Family history is required.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.age) {
        setTopErrorMessage('Please enter a valid age.');
      } else if (newErrors.bp) {
        setTopErrorMessage('Blood pressure is required.');
      } else {
        setTopErrorMessage('Please complete all required fields.');
      }
      return false;
    }

    setTopErrorMessage(null);
    return true;
  };

  // Real-time direct Bayesian prediction computation
  const directInference = useMemo(() => {
    try {
      const patientForCalc: PatientInput = {
        name: formData.name || 'Patient',
        age: Number(formData.age) || 50,
        gender: formData.gender || 'Male',
        bp: Number(formData.bp) || 120,
        chol: Number(formData.chol) || 200,
        bs: Number(formData.bs) || 100,
        hr: Number(formData.hr) || 75,
        bmi: Number(formData.bmi) || 25,
        smoking: formData.smoking || 'No',
        chestPain: formData.chestPain || 'Typical Angina',
        familyHistory: formData.familyHistory || 'Absent'
      };
      return computeBayesianInference(patientForCalc);
    } catch {
      return null;
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAnalyze(formData, false); // Direct prediction (no loading modal delay)
    }
  };

  const handleDirectPrediction = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onAnalyze(formData, false); // Direct prediction
    }
  };

  const handleSimulatePipeline = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validate()) {
      onAnalyze(formData, true); // With 6-step animated modal
    }
  };

  const loadSample = (type: 'high' | 'moderate' | 'low') => {
    if (type === 'high') {
      setFormData({
        name: 'Eleanor Campbell',
        age: 62,
        gender: 'Female',
        bp: 152,
        chol: 275,
        bs: 138,
        hr: 86,
        bmi: 32.1,
        smoking: 'Yes',
        chestPain: 'Typical Angina',
        familyHistory: 'Present'
      });
    } else if (type === 'moderate') {
      setFormData({
        name: 'David K. Robinson',
        age: 57,
        gender: 'Male',
        bp: 134,
        chol: 235,
        bs: 110,
        hr: 74,
        bmi: 27.8,
        smoking: 'Yes',
        chestPain: 'Atypical Angina',
        familyHistory: 'Present'
      });
    } else {
      setFormData({
        name: 'Marcus Zhao',
        age: 44,
        gender: 'Male',
        bp: 118,
        chol: 184,
        bs: 92,
        hr: 68,
        bmi: 23.2,
        smoking: 'No',
        chestPain: 'Asymptomatic',
        familyHistory: 'Absent'
      });
    }
    setErrors({});
    setTopErrorMessage(null);
  };

  const handleClear = () => {
    setFormData({
      name: '',
      age: '' as any,
      gender: 'Male',
      bp: '' as any,
      chol: '' as any,
      bs: '' as any,
      hr: '' as any,
      bmi: '' as any,
      smoking: 'No',
      chestPain: 'Asymptomatic',
      familyHistory: 'Absent'
    });
    setErrors({});
    setTopErrorMessage(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header & Presets */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-sky-600" />
              Patient Health Intake & Evaluation Form
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter clinical parameters to compute two-stage inference: SciPy p-value hypothesis screening followed by pgmpy Variable Elimination.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDirectPrediction}
              className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1.5 active:scale-95"
              title="Directly display complete prediction assessment without waiting"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Show Direct Prediction</span>
            </button>
            <button
              type="button"
              onClick={() => loadSample('high')}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 transition flex items-center gap-1 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" /> High-Risk Sample
            </button>
            <button
              type="button"
              onClick={() => loadSample('low')}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 transition flex items-center gap-1 active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Low-Risk Sample
            </button>
          </div>
        </div>
      </div>

      {/* Validation Alert Message Banner */}
      {topErrorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{topErrorMessage}</span>
        </div>
      )}

      {/* Direct Prediction Live Preview Card */}
      {directInference && (
        <div className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50/90 via-slate-50 to-indigo-50/80 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                    Direct Bayesian Prediction (Live Model)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Dynamic
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Real-time conditional probability calculated directly from current patient biomarkers
                </p>
              </div>
            </div>

            {/* Right Side Stats & Direct Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-xl font-extrabold text-slate-900 font-mono">
                  {directInference.probability.toFixed(1)}%
                </div>
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    directInference.riskCategory.includes('Higher')
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : directInference.riskCategory.includes('Moderate')
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {directInference.riskCategory}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDirectPrediction}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                title="Immediately open complete prediction assessment with DAG and p-value tables"
              >
                <span>Show Direct Prediction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar & Quick Factor Pills */}
          <div className="mt-3 pt-3 border-t border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                <span>Lower (&lt;35%)</span>
                <span>Moderate (35–70%)</span>
                <span>Higher (&gt;70%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    directInference.probability >= 70
                      ? 'bg-rose-500'
                      : directInference.probability >= 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, directInference.probability))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="text-slate-400 font-medium">Drivers:</span>
              {directInference.contributingFactors.slice(0, 3).map((f) => (
                <span
                  key={f.name}
                  className={`px-2 py-0.5 rounded font-mono ${
                    f.impact === 'higher_risk'
                      ? 'bg-rose-100 text-rose-800'
                      : f.impact === 'moderate_risk'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {f.name.split(' (')[0]}: {f.oddsRatio}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Demographics */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4" /> 1. Patient Demographics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Jonathan Mercer"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.name ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.name}</p>
              ) : (
                <span className="text-[10px] text-slate-400">Full legal name or MRN alias</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={18}
                max={110}
                value={formData.age === 0 ? '' : formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                placeholder="e.g., 62"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition ${
                  errors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.age ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.age}</p>
              ) : (
                <span className="text-[10px] text-slate-400">Adult standard (18–110)</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biological Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Male">Male (Sex = 1)</option>
                <option value="Female">Female (Sex = 0)</option>
              </select>
              <span className="text-[10px] text-slate-400">Cardiovascular epidemiological sex</span>
            </div>
          </div>
        </div>

        {/* 2. Hemodynamics & Metabolic Labs */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-3 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4" /> 2. Clinical Vitals & Lab Measurements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resting Blood Pressure (mm Hg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={60}
                max={260}
                value={formData.bp === 0 ? '' : formData.bp}
                onChange={(e) => handleChange('bp', parseInt(e.target.value) || 0)}
                placeholder="e.g., 148"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition ${
                  errors.bp ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.bp ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.bp}</p>
              ) : (
                <span className="text-[10px] text-slate-400">Normal &lt;120, Hypertensive ≥140</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serum Cholesterol (mg/dL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={80}
                max={650}
                value={formData.chol === 0 ? '' : formData.chol}
                onChange={(e) => handleChange('chol', parseInt(e.target.value) || 0)}
                placeholder="e.g., 268"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition ${
                  errors.chol ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.chol ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.chol}</p>
              ) : (
                <span className="text-[10px] text-slate-400">Desirable &lt;200, Elevated ≥240</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fasting Blood Sugar (mg/dL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={40}
                max={500}
                value={formData.bs === 0 ? '' : formData.bs}
                onChange={(e) => handleChange('bs', parseInt(e.target.value) || 0)}
                placeholder="e.g., 136"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition ${
                  errors.bs ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.bs ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.bs}</p>
              ) : (
                <span className="text-[10px] text-slate-400">Normal &lt;100, Diabetic ≥126</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resting Heart Rate (bpm) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={40}
                max={220}
                value={formData.hr === 0 ? '' : formData.hr}
                onChange={(e) => handleChange('hr', parseInt(e.target.value) || 0)}
                placeholder="e.g., 84"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition ${
                  errors.hr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.hr ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.hr}</p>
              ) : (
                <span className="text-[10px] text-slate-400">Resting pulse range: 60 - 100</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Body Mass Index (BMI) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={12}
                max={65}
                value={formData.bmi === 0 ? '' : formData.bmi}
                onChange={(e) => handleChange('bmi', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 31.4"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition ${
                  errors.bmi ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.bmi ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.bmi}</p>
              ) : (
                <span className="text-[10px] text-slate-400">Overweight 25–29.9, Obese ≥30</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Smoking Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.smoking}
                onChange={(e) => handleChange('smoking', e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Yes">Yes (Active / Recent)</option>
                <option value="No">No (Never / Former &gt;5 yrs)</option>
              </select>
              <span className="text-[10px] text-slate-400">Significant CAD risk factor (p &lt; 0.05)</span>
            </div>
          </div>
        </div>

        {/* 3. Symptoms & Family Genetics */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-3 flex items-center gap-1.5">
            <ActivitySquare className="w-4 h-4" /> 3. Clinical Symptoms & Family History
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chest Pain Presentation <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.chestPain}
                onChange={(e) => handleChange('chestPain', e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Typical Angina">Type 1: Typical Angina (Exertional retrosternal)</option>
                <option value="Atypical Angina">Type 2: Atypical Angina</option>
                <option value="Non-Anginal Pain">Type 3: Non-Anginal Precordial Discomfort</option>
                <option value="Asymptomatic">Type 4: Asymptomatic</option>
              </select>
              <span className="text-[10px] text-slate-400">Highest predictive weight in Bayesian DAG</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First-Degree Family History of CAD <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.familyHistory}
                onChange={(e) => handleChange('familyHistory', e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Present">Present (Parent / Sibling with premature heart disease)</option>
                <option value="Absent">Absent</option>
              </select>
              <span className="text-[10px] text-slate-400">Significant hereditary indicator (p = 0.00018)</span>
            </div>
          </div>
        </div>

        {/* Statistical Pipeline Callout */}
        <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Info className="w-4 h-4 text-sky-600" />
            Biostatistical Pipeline Execution
          </div>
          <p className="text-sky-800 leading-relaxed text-[11px]">
            When you click <strong>Analyze Patient</strong>:
            <strong> 1.</strong> SciPy executes Pearson Chi-square (categorical) and Welch&apos;s Two-Sample t-test (continuous) across the baseline cohort (N=303) generating two-tailed p-values.
            <strong> 2.</strong> Features with p &lt; 0.05 are highlighted as statistically significant predictors.
            <strong> 3.</strong> The Directed Acyclic Graph (DAG) Bayesian Network evaluates exact conditional posterior probability: <code className="font-mono bg-white px-1 rounded text-sky-900 font-bold">P(Heart Disease = Yes | Evidence)</code>.
          </p>
        </div>

        {/* Submission Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Clear Form
          </button>

          <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
            <button
              type="button"
              onClick={handleSimulatePipeline}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1.5 active:scale-95"
              title="Run step-by-step 6-phase analytical pipeline modal animation"
            >
              <Calculator className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulate 6-Step Pipeline</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-2 transition"
              title="Directly display complete prediction assessment without delay"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Show Direct Prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
