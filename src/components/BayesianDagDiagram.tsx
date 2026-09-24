import React, { useState } from 'react';
import { GitFork, Info, Sparkles, Layers } from 'lucide-react';
import { PatientInput } from '../types';

interface BayesianDagDiagramProps {
  patient: PatientInput;
  probability: number;
}

interface NodeInfo {
  id: string;
  name: string;
  category: 'demographic' | 'hemodynamic' | 'lifestyle' | 'target';
  x: number;
  y: number;
  value: string;
  cptFormula: string;
  role: string;
}

export const BayesianDagDiagram: React.FC<BayesianDagDiagramProps> = ({
  patient,
  probability
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('heart_disease');

  const nodes: NodeInfo[] = [
    {
      id: 'age',
      name: 'Age',
      category: 'demographic',
      x: 100,
      y: 60,
      value: `${patient.age} yrs`,
      cptFormula: 'P(Age) = Dirichlet prior across age brackets (Young, Mid, Senior)',
      role: 'Root demographic parent node conditioning BP & Cholesterol distributions'
    },
    {
      id: 'bp',
      name: 'Blood Pressure',
      category: 'hemodynamic',
      x: 270,
      y: 40,
      value: `${patient.bp} mmHg`,
      cptFormula: 'P(BP | Age) = Conditional probability matrix given demographic cohort',
      role: 'Hemodynamic pressure mediator directly connected to coronary target'
    },
    {
      id: 'chol',
      name: 'Cholesterol',
      category: 'hemodynamic',
      x: 270,
      y: 110,
      value: `${patient.chol} mg/dL`,
      cptFormula: 'P(Chol | Age) = Lipoprotein accumulation conditional on vascular aging',
      role: 'Atheromatous plaque precursor node conditioned on Age'
    },
    {
      id: 'bs',
      name: 'Blood Sugar',
      category: 'hemodynamic',
      x: 270,
      y: 180,
      value: `${patient.bs} mg/dL`,
      cptFormula: 'P(BS) = Binary indicator (Fasting >120 mg/dL)',
      role: 'Metabolic glucose marker (SciPy p=0.6481, weaker Bayesian CPD weight)'
    },
    {
      id: 'smoking',
      name: 'Smoking',
      category: 'lifestyle',
      x: 270,
      y: 250,
      value: patient.smoking,
      cptFormula: 'P(Smoking) = Prior frequency (Active / Former / Never)',
      role: 'Lifestyle endothelial stressor (Chi-Sq p=0.0003, strong positive CPD weight)'
    },
    {
      id: 'chest_pain',
      name: 'Chest Pain',
      category: 'lifestyle',
      x: 270,
      y: 320,
      value: patient.chestPain.split(' ')[0],
      cptFormula: 'P(Chest Pain | Disease) = Multi-state CPD (Typical, Atypical, Non-Anginal, Asymptomatic)',
      role: 'Primary clinical symptom node with highest Odds Ratio in DAG'
    },
    {
      id: 'fam_hist',
      name: 'Family History',
      category: 'lifestyle',
      x: 270,
      y: 390,
      value: patient.familyHistory,
      cptFormula: 'P(Family History) = First-degree hereditary genetic risk prior',
      role: 'Genetic background node modulating intrinsic likelihood baseline'
    },
    {
      id: 'heart_disease',
      name: 'Heart Disease',
      category: 'target',
      x: 520,
      y: 215,
      value: `${probability}%`,
      cptFormula: 'P(CAD | BP, Chol, BS, Smoking, CP, FamHx) = Exact Variable Elimination',
      role: 'Target diagnostic node computing posterior conditional disease probability'
    }
  ];

  // Edges definition: from -> to
  const edges = [
    { from: 'age', to: 'bp' },
    { from: 'age', to: 'chol' },
    { from: 'bp', to: 'heart_disease' },
    { from: 'chol', to: 'heart_disease' },
    { from: 'bs', to: 'heart_disease' },
    { from: 'smoking', to: 'heart_disease' },
    { from: 'chest_pain', to: 'heart_disease' },
    { from: 'fam_hist', to: 'heart_disease' }
  ];

  const activeNodeInfo = nodes.find(n => n.id === selectedNode) || nodes[nodes.length - 1];

  return (
    <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                Directed Acyclic Graph (DAG) Bayesian Architecture
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                pgmpy.inference.VariableElimination &bull; Click any node to inspect CPD
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800 px-2.5 py-1 rounded-md font-semibold">
            Exact Inference
          </span>
        </div>

        {/* SVG Diagram Canvas */}
        <div className="relative w-full bg-slate-950/70 rounded-xl border border-slate-800 p-2 overflow-x-auto">
          <svg
            viewBox="0 0 640 440"
            className="w-full min-w-[540px] h-[340px] select-none"
          >
            <defs>
              <marker
                id="dag-arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker
                id="dag-arrow-active"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
              <linearGradient id="grad-target" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>

            {/* Directed Relationship Edges (Arrows) */}
            {edges.map((edge) => {
              const src = nodes.find(n => n.id === edge.from)!;
              const dst = nodes.find(n => n.id === edge.to)!;
              const isConnectedToSelected = selectedNode === edge.from || selectedNode === edge.to;

              return (
                <path
                  key={`${edge.from}->${edge.to}`}
                  d={`M ${src.x + 35} ${src.y + 16} C ${src.x + 100} ${src.y + 16}, ${dst.x - 70} ${dst.y + 16}, ${dst.x - 40} ${dst.y + 16}`}
                  fill="none"
                  stroke={isConnectedToSelected ? '#38bdf8' : '#334155'}
                  strokeWidth={isConnectedToSelected ? '2' : '1.5'}
                  strokeDasharray={isConnectedToSelected ? 'none' : 'none'}
                  markerEnd={isConnectedToSelected ? 'url(#dag-arrow-active)' : 'url(#dag-arrow)'}
                  className="transition-colors duration-200"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isTarget = node.category === 'target';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - 45}, ${node.y - 12})`}
                  onClick={() => setSelectedNode(node.id)}
                  className="cursor-pointer transition-all duration-200"
                >
                  {/* Node outer glowing rect */}
                  <rect
                    width={isTarget ? 115 : 92}
                    height={isTarget ? 56 : 38}
                    rx="8"
                    className={`transition-all duration-200 ${
                      isTarget
                        ? 'fill-rose-950/80 stroke-rose-500 stroke-2 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : isSelected
                        ? 'fill-slate-800 stroke-cyan-400 stroke-2 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                        : 'fill-slate-900/90 stroke-slate-700 hover:stroke-slate-500'
                    }`}
                  />

                  {/* Node label */}
                  <text
                    x={isTarget ? 57 : 46}
                    y={isTarget ? 20 : 16}
                    textAnchor="middle"
                    className={`text-[10px] font-bold ${
                      isTarget ? 'fill-rose-200' : isSelected ? 'fill-cyan-300' : 'fill-slate-200'
                    }`}
                  >
                    {node.name}
                  </text>

                  {/* Node patient value badge */}
                  <text
                    x={isTarget ? 57 : 46}
                    y={isTarget ? 40 : 30}
                    textAnchor="middle"
                    className={`text-[10px] font-mono font-semibold ${
                      isTarget
                        ? 'fill-white text-xs font-extrabold'
                        : isSelected
                        ? 'fill-cyan-400'
                        : 'fill-slate-400'
                    }`}
                  >
                    {node.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Node CPD & Mathematical Detail Drawer */}
      <div className="mt-4 p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Info className="w-3.5 h-3.5" />
            Selected Node: {activeNodeInfo.name} ({activeNodeInfo.value})
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            Category: {activeNodeInfo.category}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 font-sans mt-1">
          {activeNodeInfo.role}
        </p>
        <div className="mt-2 text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto">
          <code className="text-emerald-400">{activeNodeInfo.cptFormula}</code>
        </div>
      </div>

      {/* Prior vs Posterior Comparison Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-center text-[10px] font-mono">
        <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
          <div className="text-slate-400">Prior P(Disease = 1)</div>
          <div className="text-xs font-bold text-white mt-0.5">45.8% (Cohort Baseline)</div>
        </div>
        <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
          <div className="text-slate-400">Posterior P(Disease | Evidence)</div>
          <div className="text-xs font-bold text-rose-400 mt-0.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            {probability}%
          </div>
        </div>
      </div>
    </div>
  );
};
