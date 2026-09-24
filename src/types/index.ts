export interface PatientInput {
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  bp: number; // Resting Blood Pressure in mm Hg
  bs: number; // Fasting Blood Sugar in mg/dL
  chol: number; // Serum Cholesterol in mg/dL
  hr: number; // Resting Heart Rate in bpm
  bmi: number; // Body Mass Index kg/m²
  smoking: 'Yes' | 'No';
  chestPain: 'Typical Angina' | 'Atypical Angina' | 'Non-Anginal Pain' | 'Asymptomatic';
  familyHistory: 'Present' | 'Absent';
}

export interface PValueResult {
  feature: string;
  pValue: number;
  statistic: string;
  isSignificant: boolean; // p < 0.05
  patientValue: string | number;
  testUsed: string;
  interpretation: string;
}

export interface BayesianFactor {
  name: string;
  value: string;
  impact: 'higher_risk' | 'moderate_risk' | 'protective' | 'neutral';
  weight: number;
  oddsRatio: string;
  clinicalRationale: string;
}

export type RiskTier = 'Lower estimated risk' | 'Moderate estimated risk' | 'Higher estimated risk';

export interface PredictionRecord {
  id: string;
  mrn: string;
  date: string;
  patient: PatientInput;
  pValues: PValueResult[];
  significantFeatures: string[];
  bayesianProbability: number; // 0 - 100%
  riskCategory: RiskTier;
  keyFactors: BayesianFactor[];
  savedAt: string;
  isSaved?: boolean;
}

export interface DashboardStats {
  totalPatients: number;
  totalPredictions: number;
  significantFeaturesRatio: string;
  avgBayesianConfidence: number;
  riskDistribution: {
    lower: number;
    moderate: number;
    higher: number;
  };
}

export type ActiveTab = 'dashboard' | 'prediction' | 'result' | 'history' | 'admin' | 'code-viewer';
