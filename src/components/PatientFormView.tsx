import React, { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { PatientInput } from '../types';

interface PatientFormViewProps {
  onAnalyze: (patient: PatientInput) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAnalyze(formData);
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
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Clear Form
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-2 transition"
          >
            <Calculator className="w-4 h-4" /> Analyze Patient
          </button>
        </div>
      </form>
    </div>
  );
};
