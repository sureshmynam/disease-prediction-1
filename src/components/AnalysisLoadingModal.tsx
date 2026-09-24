import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Activity,
  Cpu,
  Binary,
  GitFork,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AnalysisLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  patientName: string;
}

const STEPS = [
  {
    title: '1. Patient data received',
    description: 'Demographics, hemodynamic vitals, and family history validated',
    icon: Activity
  },
  {
    title: '2. Data preprocessing',
    description: 'Discretizing continuous metrics & encoding CPD evidence states',
    icon: Binary
  },
  {
    title: '3. p-Value analysis',
    description: "Executing Welch's t-tests and Chi-Square tests against baseline cohort (α = 0.05)",
    icon: Cpu
  },
  {
    title: '4. Bayesian Network analysis',
    description: 'Directed Acyclic Graph exact Variable Elimination on discrete conditional tables',
    icon: GitFork
  },
  {
    title: '5. Generating prediction',
    description: 'Computing posterior conditional probability and risk stratification',
    icon: Sparkles
  },
  {
    title: '6. Prediction completed',
    description: 'Synthesizing evidence weights and biostatistical summary report',
    icon: ShieldCheck
  }
];

export const AnalysisLoadingModal: React.FC<AnalysisLoadingModalProps> = ({
  isOpen,
  onComplete,
  patientName
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    // Step sequence timing (approx 2.4s total for a realistic clinical calculation feel)
    const stepDurations = [350, 450, 500, 550, 450, 350];
    let step = 0;

    const runStep = () => {
      if (step < STEPS.length - 1) {
        step++;
        setCurrentStepIndex(step);
        setTimeout(runStep, stepDurations[step]);
      } else {
        // Final completion timeout
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    const firstTimer = setTimeout(runStep, stepDurations[0]);
    return () => clearTimeout(firstTimer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-cyan-300">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Bayesian Inference Engine</h3>
              <p className="text-xs text-slate-400">Processing: {patientName || 'Anonymous Patient'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-mono text-xs text-cyan-400 font-bold">{progressPercent}%</span>
              <div className="text-[10px] text-slate-400 font-mono">pgmpy v0.1.25</div>
            </div>
            <button
              type="button"
              onClick={onComplete}
              className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
              title="Skip animation and display the direct prediction immediately"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
              <span>Direct Prediction</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <div
            className="bg-sky-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-3.5 bg-slate-50/50">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex || (idx === STEPS.length - 1 && currentStepIndex === STEPS.length - 1);
            const isCurrent = idx === currentStepIndex && currentStepIndex < STEPS.length - 1;
            const isPending = idx > currentStepIndex;

            const StepIcon = step.icon;

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 border ${
                  isCurrent
                    ? 'bg-sky-50/80 border-sky-200 shadow-xs'
                    : isDone
                    ? 'bg-white border-slate-200 opacity-90'
                    : 'bg-transparent border-transparent opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in-50 duration-200" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-sky-950 font-bold'
                          : isDone
                          ? 'text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </span>
                    <StepIcon
                      className={`w-3.5 h-3.5 ${
                        isCurrent ? 'text-sky-600' : isDone ? 'text-emerald-500' : 'text-slate-300'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info notice */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Significance threshold: α = 0.05</span>
            <span>&bull;</span>
            <span className="text-emerald-600 font-medium">Dirichlet Prior active</span>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="text-xs font-sans text-sky-600 hover:text-sky-800 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            Show direct prediction now &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
