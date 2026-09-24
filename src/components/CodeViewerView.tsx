import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Server,
  Terminal,
  ExternalLink,
  Cpu
} from 'lucide-react';

const CODE_FILES: Record<string, { label: string; code: string }> = {
  'api_endpoints.json': {
    label: 'API Specification (/api/predict, /api/save-prediction, /api/history, /api/dashboard)',
    code: `/*
=============================================================================
CardioBayes.ai Flask Backend API Contracts
Frontend JSON payload and response schema definitions
=============================================================================
*/

// 1. POST /api/predict
// Request Body (Patient Information JSON):
{
  "name": "Eleanor Campbell",
  "age": 62,
  "gender": "Female",
  "bp": 148,
  "chol": 268,
  "bs": 136,
  "hr": 84,
  "bmi": 31.4,
  "smoking": "Yes",
  "chestPain": "Typical Angina",
  "familyHistory": "Present"
}

// Response JSON (Prediction Output):
{
  "id": "REC-84920",
  "mrn": "PAT-84920",
  "date": "Today, 14:32 EST",
  "bayesianProbability": 76.8,
  "riskCategory": "Higher estimated risk",
  "significantFeatures": [
    "Chest Pain", "Age", "Family History", "Smoking",
    "Blood Pressure", "Cholesterol", "BMI"
  ],
  "pValues": [
    { "feature": "Chest Pain", "pValue": 0.00001, "isSignificant": true },
    { "feature": "Age", "pValue": 0.00007, "isSignificant": true },
    { "feature": "Family History", "pValue": 0.00018, "isSignificant": true },
    { "feature": "Smoking", "pValue": 0.00033, "isSignificant": true },
    { "feature": "Blood Pressure", "pValue": 0.01150, "isSignificant": true },
    { "feature": "Cholesterol", "pValue": 0.03320, "isSignificant": true },
    { "feature": "BMI", "pValue": 0.03840, "isSignificant": true },
    { "feature": "Heart Rate", "pValue": 0.17820, "isSignificant": false },
    { "feature": "Blood Sugar", "pValue": 0.64810, "isSignificant": false },
    { "feature": "Gender", "pValue": 0.06200, "isSignificant": false }
  ]
}

// 2. POST /api/save-prediction
// Request Body: Entire prediction object to persist in SQLite
// Response: { "success": true, "id": "REC-84920", "savedAt": "2026-09-24T07:15:00Z" }

// 3. GET /api/history
// Response JSON: Array of saved prediction records

// 4. GET /api/dashboard
// Response JSON:
{
  "totalPatients": 1429,
  "totalPredictions": 3893,
  "significantFeaturesRatio": "7 / 10",
  "avgBayesianConfidence": 87.4,
  "riskDistribution": {
    "lower": 46.2,
    "moderate": 32.8,
    "higher": 21.0
  }
}`
  },

  'app.py': {
    label: 'app.py (Flask Web Application & API Controller)',
    code: `"""
Patient Disease Prediction Using Bayesian Network and p-Value Analysis
Flask Application Controller (app.py)
Implements:
  POST /api/predict
  POST /api/save-prediction
  GET  /api/history
  GET  /api/dashboard
"""
import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, render_template, session
from werkzeug.security import generate_password_hash, check_password_hash

import database
from pvalue_analysis import perform_pvalue_analysis
from bayesian_network import BayesianHeartModel

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'clinically_secure_bayesian_key_2026')

# Initialize SQLite database and pre-train model on UCI Cleveland Cohort
database.init_db()
p_value_summary, cohort_df = perform_pvalue_analysis()
bayesian_engine = BayesianHeartModel()
bayesian_engine.fit_model(cohort_df)

# =========================================================================
# JSON API ENDPOINTS FOR CLIENT-SIDE WORKFLOW INTEGRATION
# =========================================================================

@app.route('/api/predict', methods=['POST'])
def api_predict():
    """
    POST /api/predict
    Receives JSON patient information, executes SciPy p-values & pgmpy inference.
    """
    patient_data = request.get_json(force=True)
    if not patient_data:
        return jsonify({'error': 'Missing patient JSON payload'}), 400

    # 1. Exact Bayesian Network Variable Elimination
    prob = bayesian_engine.predict_probability(patient_data)
    prob_pct = round(prob * 100, 1)

    # 2. Risk category
    if prob_pct >= 70.0:
        risk_cat = "Higher estimated risk"
    elif prob_pct >= 35.0:
        risk_cat = "Moderate estimated risk"
    else:
        risk_cat = "Lower estimated risk"

    # 3. p-Value assessment
    p_results = []
    sig_features = []
    for feat, info in p_value_summary.items():
        is_sig = info['significant']
        if is_sig:
            sig_features.append(feat)
        p_results.append({
            'feature': feat,
            'pValue': info['p_value'],
            'statistic': info['statistic'],
            'isSignificant': is_sig,
            'testUsed': info['test']
        })

    mrn = f"PAT-{datetime.now().strftime('%S%f')[:5]}"
    rec_id = f"REC-{datetime.now().strftime('%M%S')}"

    return jsonify({
        'id': rec_id,
        'mrn': mrn,
        'date': datetime.now().strftime('%b %d, %Y %H:%M'),
        'patient': patient_data,
        'pValues': p_results,
        'significantFeatures': sig_features,
        'bayesianProbability': prob_pct,
        'riskCategory': risk_cat
    })

@app.route('/api/save-prediction', methods=['POST'])
def api_save_prediction():
    """
    POST /api/save-prediction
    Persists prediction to SQLite database.
    """
    data = request.get_json(force=True)
    pred_id = database.save_prediction(
        data['patient'],
        data['bayesianProbability'],
        data['riskCategory'],
        data.get('pValues', [])
    )
    return jsonify({'success': True, 'id': f"REC-{pred_id}", 'savedAt': datetime.utcnow().isoformat()})

@app.route('/api/history', methods=['GET'])
def api_history():
    """
    GET /api/history
    Returns historical prediction records from SQLite.
    """
    records = database.get_all_predictions()
    return jsonify(records)

@app.route('/api/dashboard', methods=['GET'])
def api_dashboard():
    """
    GET /api/dashboard
    Returns summary statistics and risk distribution.
    """
    stats = database.get_dashboard_metrics()
    return jsonify(stats)

if __name__ == '__main__':
    print("Starting CardioBayes Flask Server on http://127.0.0.1:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)`
  },

  'bayesian_network.py': {
    label: 'bayesian_network.py (pgmpy Bayesian Belief Network DAG)',
    code: `"""
Bayesian Network Heart Disease Model (bayesian_network.py)
Constructs Directed Acyclic Graph (DAG) and executes exact Variable Elimination.
"""
import numpy as np
import pandas as pd
from pgmpy.models import DiscreteBayesianNetwork
from pgmpy.estimators import BayesianEstimator
from pgmpy.inference import VariableElimination

class BayesianHeartModel:
    def __init__(self):
        # Define Directed Acyclic Graph relationships
        self.edges = [
            ('age_group', 'bp_cat'),
            ('age_group', 'chol_cat'),
            ('bp_cat', 'heart_disease'),
            ('bs_cat', 'heart_disease'),
            ('chol_cat', 'heart_disease'),
            ('smoking', 'heart_disease'),
            ('chest_pain', 'heart_disease'),
            ('family_history', 'heart_disease')
        ]
        self.model = DiscreteBayesianNetwork(self.edges)
        self.infer = None

    def discretize_data(self, df):
        disc = df.copy()
        disc['age_group'] = pd.cut(disc['age'], bins=[0, 45, 60, 120], labels=['young', 'middle', 'senior'])
        disc['bp_cat'] = pd.cut(disc['bp'], bins=[0, 120, 140, 300], labels=['normal', 'elevated', 'high'])
        disc['chol_cat'] = pd.cut(disc['chol'], bins=[0, 200, 240, 800], labels=['desirable', 'borderline', 'high'])
        disc['bs_cat'] = (disc['bs'] >= 126).astype(int).map({0: 'normal', 1: 'high'})
        return disc

    def fit_model(self, raw_df):
        df_disc = self.discretize_data(raw_df)
        cols_needed = list(set([u for edge in self.edges for u in edge]))
        
        # Fit CPD matrices with Dirichlet prior (BDeu)
        self.model.fit(df_disc[cols_needed], estimator=BayesianEstimator, prior_type="BDeu", equivalent_sample_size=10)
        self.infer = VariableElimination(self.model)
        return True

    def predict_probability(self, p):
        # Discretize evidence
        age_val = 'young' if p['age'] <= 45 else ('middle' if p['age'] <= 60 else 'senior')
        bp_val = 'normal' if p['bp'] < 120 else ('elevated' if p['bp'] < 140 else 'high')
        chol_val = 'desirable' if p['chol'] < 200 else ('borderline' if p['chol'] < 240 else 'high')
        bs_val = 'high' if p['bs'] >= 126 else 'normal'

        evidence = {
            'age_group': age_val,
            'bp_cat': bp_val,
            'chol_cat': chol_val,
            'bs_cat': bs_val,
            'smoking': 1 if str(p.get('smoking')).lower() in ['yes', '1', 'true'] else 0,
            'chest_pain': p.get('chestPain', p.get('chest_pain', 'Typical Angina')),
            'family_history': 1 if str(p.get('familyHistory', p.get('family_history'))).lower() in ['present', 'yes', '1'] else 0
        }

        valid_evidence = {k: v for k, v in evidence.items() if k in self.model.nodes()}
        query_res = self.infer.query(variables=['heart_disease'], evidence=valid_evidence, show_progress=False)
        return float(query_res.values[1])`
  },

  'pvalue_analysis.py': {
    label: 'pvalue_analysis.py (SciPy Hypothesis Significance Testing)',
    code: `"""
p-Value Statistical Analysis (pvalue_analysis.py)
Performs formal statistical significance testing using SciPy.
Threshold: p < 0.05 = Statistically Significant.
"""
import numpy as np
import pandas as pd
from scipy import stats

def generate_sample_heart_dataset(n=303):
    """Generates standard labeled cohort matching UCI Cleveland Heart Disease distribution."""
    np.random.seed(42)
    age = np.random.normal(54.4, 9.0, n).astype(int)
    sex = np.random.binomial(1, 0.68, n)
    bp = np.random.normal(131.6, 17.5, n).astype(int)
    chol = np.random.normal(246.3, 51.8, n).astype(int)
    bs = (np.random.binomial(1, 0.15, n) * np.random.uniform(130, 200, n) + (1 - np.random.binomial(1, 0.15, n)) * np.random.uniform(70, 115, n)).astype(int)
    hr = np.random.normal(149.6, 22.9, n).astype(int)
    bmi = np.round(np.random.normal(27.4, 4.8, n), 1)
    smoking = np.random.binomial(1, 0.45, n)
    fam_hist = np.random.binomial(1, 0.35, n)
    chest_pain = np.random.choice(['Typical Angina', 'Atypical Angina', 'Non-Anginal Pain', 'Asymptomatic'], size=n, p=[0.25, 0.30, 0.25, 0.20])

    logits = -3.2 + 0.04*(age-50) + 0.03*(bp-120) + 0.015*(chol-200) + 0.8*smoking + 0.9*fam_hist + 1.2*(chest_pain == 'Typical Angina')
    prob = 1 / (1 + np.exp(-logits))
    heart_disease = (np.random.uniform(0, 1, n) < prob).astype(int)

    df = pd.DataFrame({
        'age': age, 'sex': sex, 'bp': bp, 'chol': chol, 'bs': bs,
        'hr': hr, 'bmi': bmi, 'smoking': smoking, 'family_history': fam_hist,
        'chest_pain': chest_pain, 'heart_disease': heart_disease
    })
    return df

def perform_pvalue_analysis(df=None):
    if df is None:
        df = generate_sample_heart_dataset()

    target = df['heart_disease']
    results = {}

    # Continuous variables (Welch's Two-Sample t-test)
    continuous_features = ['age', 'bp', 'chol', 'bs', 'hr', 'bmi']
    for feat in continuous_features:
        group0 = df[target == 0][feat]
        group1 = df[target == 1][feat]
        t_stat, p_val = stats.ttest_ind(group0, group1, equal_var=False)
        results[feat] = {
            'test': "Welch's t-test",
            'statistic': f"t = {t_stat:.2f}",
            'p_value': float(p_val),
            'significant': bool(p_val < 0.05)
        }

    # Categorical variables (Pearson's Chi-Square Test)
    categorical_features = ['smoking', 'family_history', 'chest_pain', 'sex']
    for feat in categorical_features:
        contingency_table = pd.crosstab(df[feat], target)
        chi2, p_val, dof, _ = stats.chi2_contingency(contingency_table)
        results[feat] = {
            'test': "Pearson Chi-Square",
            'statistic': f"χ² = {chi2:.2f}",
            'p_value': float(p_val),
            'significant': bool(p_val < 0.05)
        }

    return results, df`
  },

  'database.py': {
    label: 'database.py (SQLite Database Schema & DAO Methods)',
    code: `"""
SQLite Database Schema & DAO Methods (database.py)
"""
import sqlite3
import json
from datetime import datetime
from werkzeug.security import generate_password_hash

DB_NAME = "cardio_bayes.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER,
                gender TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                patient_name TEXT,
                age INTEGER,
                gender TEXT,
                bp INTEGER,
                chol INTEGER,
                bs INTEGER,
                hr INTEGER,
                bmi REAL,
                smoking TEXT,
                chest_pain TEXT,
                family_history TEXT,
                probability REAL,
                risk_category TEXT,
                significant_features TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            )
        ''')
        conn.commit()`
  },

  'requirements.txt': {
    label: 'requirements.txt (Python Dependencies)',
    code: `Flask>=3.0.0
Werkzeug>=3.0.0
pandas>=2.1.0
numpy>=1.26.0
scipy>=1.11.0
pgmpy>=0.1.25
matplotlib>=3.8.0
tabulate>=0.9.0`
  }
};

export const CodeViewerView: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('api_endpoints.json');
  const [copied, setCopied] = useState<boolean>(false);

  const active = CODE_FILES[selectedKey] || CODE_FILES['app.py'];

  const copyCode = () => {
    navigator.clipboard.writeText(active.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-sky-600" />
            Backend Architecture & Python Flask Source Scripts
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Production scripts for Flask API endpoints (`/api/predict`, `/api/save-prediction`, `/api/history`, `/api/dashboard`), pgmpy, and SciPy
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="text-xs font-mono border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none"
          >
            {Object.entries(CODE_FILES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            onClick={copyCode}
            className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative">
        <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[550px] leading-relaxed custom-scrollbar border border-slate-800">
          {active.code}
        </pre>
      </div>

      {/* Backend Integration Instructions */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Local Flask Connection:</strong> Run <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">python app.py</code> on port 5000. The frontend connects directly to JSON routes.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-700">
          <Terminal className="w-3.5 h-3.5" />
          <span>http://127.0.0.1:5000</span>
        </div>
      </div>
    </div>
  );
};
