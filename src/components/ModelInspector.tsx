import React, { useState, useMemo, useEffect } from 'react';
import { StudentProfile, ConceptNode, InteractionRecord } from '../types';
import { PrerequisiteKnowledgeGraph } from '../engine/knowledgeGraph';
import { DeepKnowledgeTracer, DKTState } from '../engine/dkt';
import { BayesianKnowledgeTracer, BKTParameters, BKTUpdateResult } from '../engine/bkt';
import { DynamicQuestionSelector } from '../engine/irtSelector';
import {
  Activity,
  Brain,
  Cpu,
  TrendingUp,
  HelpCircle,
  Layers,
  BarChart3,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  Info,
  Eye,
  Flame,
  Zap,
  Gauge,
  History,
  Target,
  Search,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

interface ModelInspectorProps {
  graph: PrerequisiteKnowledgeGraph;
  student: StudentProfile;
  dktState: DKTState | null;
}

interface BktStepRecord {
  step: number;
  pL_prior: number;
  pL_posterior: number;
  pL_next: number;
  obs: 'correct' | 'incorrect' | 'init';
  latencySec: number;
  formulaNumerator: number;
  formulaDenominator: number;
}

export const ModelInspector: React.FC<ModelInspectorProps> = ({
  graph,
  student,
  dktState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bkt' | 'dkt' | 'irt' | 'timeline'>('bkt');

  const concepts = graph.getAllNodes();

  // -------------------------------------------------------------
  // BKT INTERACTIVE SANDBOX STATE
  // -------------------------------------------------------------
  const [bktConceptId, setBktConceptId] = useState<string>(concepts[0]?.id || 'arithmetic-negatives');
  const activeBktConcept = useMemo(
    () => concepts.find((c) => c.id === bktConceptId) || concepts[0],
    [concepts, bktConceptId]
  );

  const [bktPL0, setBktPL0] = useState<number>(() => activeBktConcept?.bktParams.pL0 ?? 0.5);
  const [bktPT, setBktPT] = useState<number>(() => activeBktConcept?.bktParams.pT ?? 0.15);
  const [bktPG, setBktPG] = useState<number>(() => activeBktConcept?.bktParams.pG ?? 0.2);
  const [bktPS, setBktPS] = useState<number>(() => activeBktConcept?.bktParams.pS ?? 0.1);
  const [bktLatency, setBktLatency] = useState<number>(6); // seconds

  // Update simulator parameters when concept changes
  useEffect(() => {
    if (activeBktConcept) {
      setBktPL0(activeBktConcept.bktParams.pL0);
      setBktPT(activeBktConcept.bktParams.pT);
      setBktPG(activeBktConcept.bktParams.pG);
      setBktPS(activeBktConcept.bktParams.pS);
      setBktTrajectory([
        {
          step: 0,
          pL_prior: activeBktConcept.bktParams.pL0,
          pL_posterior: activeBktConcept.bktParams.pL0,
          pL_next: activeBktConcept.bktParams.pL0,
          obs: 'init',
          latencySec: 0,
          formulaNumerator: activeBktConcept.bktParams.pL0,
          formulaDenominator: 1,
        },
      ]);
    }
  }, [bktConceptId]);

  // BKT Step-by-step history
  const [bktTrajectory, setBktTrajectory] = useState<BktStepRecord[]>(() => [
    {
      step: 0,
      pL_prior: 0.5,
      pL_posterior: 0.5,
      pL_next: 0.5,
      obs: 'init',
      latencySec: 0,
      formulaNumerator: 0.5,
      formulaDenominator: 1,
    },
  ]);

  const currentBktSimPL = bktTrajectory[bktTrajectory.length - 1].pL_next;

  const handleSimulateBktStep = (isCorrect: boolean) => {
    const prior = currentBktSimPL;
    const params: BKTParameters = { pL0: bktPL0, pT: bktPT, pG: bktPG, pS: bktPS };
    const res = BayesianKnowledgeTracer.update(prior, isCorrect, params, bktLatency * 1000);

    // Compute detailed formula breakdown
    const numerator = isCorrect ? prior * (1 - bktPS) : prior * bktPS;
    const denominator = isCorrect
      ? prior * (1 - bktPS) + (1 - prior) * bktPG
      : prior * bktPS + (1 - prior) * (1 - bktPG);

    const record: BktStepRecord = {
      step: bktTrajectory.length,
      pL_prior: prior,
      pL_posterior: res.pL_posterior,
      pL_next: res.pL_next,
      obs: isCorrect ? 'correct' : 'incorrect',
      latencySec: bktLatency,
      formulaNumerator: numerator,
      formulaDenominator: denominator,
    };

    setBktTrajectory((prev) => [...prev, record]);
  };

  const handleResetBktTrajectory = () => {
    setBktTrajectory([
      {
        step: 0,
        pL_prior: bktPL0,
        pL_posterior: bktPL0,
        pL_next: bktPL0,
        obs: 'init',
        latencySec: 0,
        formulaNumerator: bktPL0,
        formulaDenominator: 1,
      },
    ]);
  };

  const applyBktPreset = (preset: 'standard' | 'genius' | 'guesser' | 'slow') => {
    if (preset === 'standard') {
      setBktPL0(0.40); setBktPT(0.18); setBktPG(0.20); setBktPS(0.10);
    } else if (preset === 'genius') {
      setBktPL0(0.75); setBktPT(0.35); setBktPG(0.15); setBktPS(0.28); // High slip due to fast careless mistakes
    } else if (preset === 'guesser') {
      setBktPL0(0.20); setBktPT(0.12); setBktPG(0.38); setBktPS(0.08); // High guess rate
    } else {
      setBktPL0(0.25); setBktPT(0.08); setBktPG(0.15); setBktPS(0.18); // Slower learning velocity
    }
  };

  // -------------------------------------------------------------
  // DKT RECURRENT NEURAL STATE & STEP RUNNER
  // -------------------------------------------------------------
  const conceptIds = useMemo(() => concepts.map((c) => c.id), [concepts]);
  const dktEngine = useMemo(() => new DeepKnowledgeTracer(conceptIds, 32), [conceptIds]);

  const [liveDktState, setLiveDktState] = useState<DKTState>(() => {
    return dktState || dktEngine.getInitialState();
  });

  const [dktInputConceptId, setDktInputConceptId] = useState<string>(concepts[0]?.id || '');
  const [dktInputCorrect, setDktInputCorrect] = useState<boolean>(true);
  const [dktPulseActive, setDktPulseActive] = useState<boolean>(false);
  const [selectedNeuronIdx, setSelectedNeuronIdx] = useState<number>(0);
  const [dktDeltas, setDktDeltas] = useState<Record<string, number>>({});

  const handleStepDktNetwork = () => {
    if (!dktInputConceptId) return;
    const next = dktEngine.step(liveDktState, dktInputConceptId, dktInputCorrect);

    // Calculate delta for each concept to demonstrate cross-skill transfer
    const deltas: Record<string, number> = {};
    concepts.forEach((c) => {
      const prevM = liveDktState.masteryPredictions[c.id] ?? 0.5;
      const nextM = next.masteryPredictions[c.id] ?? 0.5;
      deltas[c.id] = nextM - prevM;
    });

    setDktDeltas(deltas);
    setLiveDktState(next);
    setDktPulseActive(true);
    setTimeout(() => setDktPulseActive(false), 1200);
  };

  const handleResetDktNetwork = () => {
    setLiveDktState(dktEngine.getInitialState());
    setDktDeltas({});
  };

  // -------------------------------------------------------------
  // IRT INTERACTIVE ICC SLIDERS
  // -------------------------------------------------------------
  const [irtTheta, setIrtTheta] = useState<number>(() => student.theta);
  const [irtDifficulty, setIrtDifficulty] = useState<number>(0.0); // b
  const [irtDiscrimination, setIrtDiscrimination] = useState<number>(1.2); // a
  const [irtGuessing, setIrtGuessing] = useState<number>(0.0); // c
  const [showFisherInfo, setShowFisherInfo] = useState<boolean>(true);

  const irtCurrentProb = useMemo(() => {
    return DynamicQuestionSelector.calculateProbability(
      irtTheta,
      irtDifficulty,
      irtDiscrimination,
      irtGuessing
    );
  }, [irtTheta, irtDifficulty, irtDiscrimination, irtGuessing]);

  const irtFisherInfo = useMemo(() => {
    const P = irtCurrentProb;
    const c = irtGuessing;
    const a = irtDiscrimination;
    if (P <= 0 || P >= 1 || (1 - c) <= 0) return 0;
    const term = (P - c) / (1 - c);
    return Math.max(0, a * a * term * term * ((1 - P) / P));
  }, [irtCurrentProb, irtGuessing, irtDiscrimination]);

  // Target difficulty for 72% success probability
  const irtIdealDifficulty = useMemo(() => {
    const pTarget = 0.72;
    const c = irtGuessing;
    if (pTarget <= c) return irtTheta;
    const pAdj = (pTarget - c) / (1 - c);
    return irtTheta - Math.log((1 - pAdj) / pAdj) / irtDiscrimination;
  }, [irtTheta, irtGuessing, irtDiscrimination]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-800/60 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Dynamic Cognitive Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">Current Latent θ = {student.theta.toFixed(2)}</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2.5 tracking-tight">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>AI Knowledge Tracing & Latent Space Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Interact directly with the mathematical engines powering student personalization. Experiment with parameters live in the simulators below.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('bkt')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'bkt'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Bayesian (BKT)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('dkt')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'dkt'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Deep RNN (DKT)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('irt')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'irt'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Difficulty (2PL IRT)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Session Log ({student.interactionHistory.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Bayesian Knowledge Tracing (BKT) */}
      {activeSubTab === 'bkt' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Dynamic BKT Simulator Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Interactive Sandbox
                </span>
                <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>Bayesian Knowledge Tracing (BKT) Live Convergence Simulator</span>
                </h3>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
                <button
                  onClick={() => applyBktPreset('standard')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors cursor-pointer"
                >
                  Standard
                </button>
                <button
                  onClick={() => applyBktPreset('genius')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-300 text-[11px] border border-slate-800 transition-colors cursor-pointer"
                >
                  Careless Genius
                </button>
                <button
                  onClick={() => applyBktPreset('guesser')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 text-[11px] border border-slate-800 transition-colors cursor-pointer"
                >
                  Lucky Guesser
                </button>
                <button
                  onClick={() => applyBktPreset('slow')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-300 text-[11px] border border-slate-800 transition-colors cursor-pointer"
                >
                  Slow Learner
                </button>
              </div>
            </div>

            {/* Parameter Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Prior P(L₀):</span>
                  <span className="font-bold text-indigo-400">{bktPL0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={bktPL0}
                  onChange={(e) => setBktPL0(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Baseline starting mastery</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Learn P(T):</span>
                  <span className="font-bold text-emerald-400">{bktPT.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.50"
                  step="0.02"
                  value={bktPT}
                  onChange={(e) => setBktPT(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Learning transition rate</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Guess P(G):</span>
                  <span className="font-bold text-amber-400">{bktPG.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.05"
                  value={bktPG}
                  onChange={(e) => setBktPG(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Correct while unmastered</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Slip P(S):</span>
                  <span className="font-bold text-rose-400">{bktPS.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.40"
                  step="0.02"
                  value={bktPS}
                  onChange={(e) => setBktPS(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Wrong while mastered</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Latency:</span>
                  <span className="font-bold text-cyan-400">{bktLatency}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  step="1"
                  value={bktLatency}
                  onChange={(e) => setBktLatency(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">
                  {bktLatency < 4 ? '⚡ Quick Slip' : bktLatency > 25 ? '⏳ Deliberative' : 'Normal Paced'}
                </span>
              </div>
            </div>

            {/* Simulation Controls & Current Status */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-400 font-mono block">Current Simulation P(L_t)</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black font-mono ${currentBktSimPL >= 0.85 ? 'text-emerald-400' : currentBktSimPL < 0.45 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {Math.round(currentBktSimPL * 100)}%
                    </span>
                    <span className={`text-xs font-semibold ${currentBktSimPL >= 0.85 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {currentBktSimPL >= 0.85 ? '✓ Concept Mastered (≥85%)' : 'In Progress'}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-800 hidden md:block" />

                <div className="text-xs text-slate-400 font-mono">
                  <span>Steps Taken: <strong className="text-white">{bktTrajectory.length - 1}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateBktStep(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Correct (✓)</span>
                </button>

                <button
                  onClick={() => handleSimulateBktStep(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Simulate Incorrect (✗)</span>
                </button>

                <button
                  onClick={handleResetBktTrajectory}
                  title="Reset trajectory back to prior"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dynamic SVG Convergence Trajectory Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Convergence Trajectory: Probability of Mastery P(L) Across Time Steps</span>
                <span className="text-emerald-400 text-[11px] font-bold">--- Mastery Threshold (85%)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
                <svg viewBox="0 0 700 180" className="w-full h-44 bg-slate-950">
                  {/* Grid Lines */}
                  {[0.2, 0.4, 0.6, 0.85, 1.0].map((val) => {
                    const y = 160 - val * 140;
                    const isThreshold = val === 0.85;
                    return (
                      <g key={val}>
                        <line
                          x1="45"
                          y1={y}
                          x2="680"
                          y2={y}
                          stroke={isThreshold ? '#10b981' : '#1e293b'}
                          strokeWidth={isThreshold ? 1.5 : 1}
                          strokeDasharray={isThreshold ? '4 4' : undefined}
                        />
                        <text x="40" y={y + 3} textAnchor="end" fill={isThreshold ? '#10b981' : '#475569'} fontSize="9" fontFamily="monospace">
                          {Math.round(val * 100)}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw Polyline */}
                  {(() => {
                    const totalPoints = Math.max(8, bktTrajectory.length);
                    const stepWidth = 620 / Math.max(1, totalPoints - 1);
                    const points = bktTrajectory.map((pt, idx) => {
                      const x = 50 + idx * stepWidth;
                      const y = 160 - pt.pL_next * 140;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <g>
                        {/* Area gradient under line */}
                        <polyline
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />

                        {/* Point nodes */}
                        {bktTrajectory.map((pt, idx) => {
                          const x = 50 + idx * stepWidth;
                          const y = 160 - pt.pL_next * 140;
                          const isCorrect = pt.obs === 'correct';
                          const isInit = pt.obs === 'init';

                          return (
                            <g key={idx}>
                              <circle
                                cx={x}
                                cy={y}
                                r={idx === bktTrajectory.length - 1 ? 5 : 3.5}
                                fill={isInit ? '#94a3b8' : isCorrect ? '#10b981' : '#f43f5e'}
                                stroke="#0f172a"
                                strokeWidth="2"
                              />
                              <text x={x} y="172" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                                t={pt.step}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Real-time Evaluated Numerical Formula Breakdown */}
            {bktTrajectory.length > 1 && (
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs font-mono space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Numerical Substitution at Step t={bktTrajectory[bktTrajectory.length - 1].step}:</span>
                </div>
                {(() => {
                  const last = bktTrajectory[bktTrajectory.length - 1];
                  const wasCorrect = last.obs === 'correct';
                  return (
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <p>
                        <strong>Posterior:</strong> P(L_t | {last.obs}) = <span className="text-emerald-400">{last.formulaNumerator.toFixed(3)}</span> / <span className="text-indigo-400">{last.formulaDenominator.toFixed(3)}</span> = <span className="text-white font-bold">{last.pL_posterior.toFixed(4)}</span>
                      </p>
                      <p>
                        <strong>Next Step Transition:</strong> P(L_{`{t+1}`}) = {last.pL_posterior.toFixed(3)} + (1 - {last.pL_posterior.toFixed(3)}) · {bktPT.toFixed(2)} = <span className="text-cyan-300 font-bold">{last.pL_next.toFixed(4)}</span>
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>

          {/* Mathematical Formulation Summary */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Corbett & Anderson (1995) Bayesian Knowledge Tracing Equations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <span className="text-indigo-400 font-bold block">1. Posterior on Correct Observation:</span>
                <p className="text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  P(L_t | correct) = [P(L_t) · (1 - P(S))] / [P(L_t) · (1 - P(S)) + (1 - P(L_t)) · P(G)]
                </p>
                <p className="text-[10px] text-slate-400">
                  Adjusts probability upward, penalizing if the question had high guess probability P(G).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <span className="text-rose-400 font-bold block">2. Posterior on Incorrect Observation:</span>
                <p className="text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  P(L_t | incorrect) = [P(L_t) · P(S)] / [P(L_t) · P(S) + (1 - P(L_t)) · (1 - P(G))]
                </p>
                <p className="text-[10px] text-slate-400">
                  Modulated by latency factor: quick mistakes (&lt;3s) treat error as slip P(S); slow struggles treat as true misconception.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time BKT Parameters Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Class-wide Concept Parameter Matrix & Live Mastery</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                Mastery Threshold: P(L) ≥ 0.85
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Concept</th>
                    <th className="p-3 text-center">Prior P(L₀)</th>
                    <th className="p-3 text-center">Transition P(T)</th>
                    <th className="p-3 text-center">Guess P(G)</th>
                    <th className="p-3 text-center">Slip P(S)</th>
                    <th className="p-3 text-center">Current P(L)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {concepts.map((node) => {
                    const currentPL = student.conceptMastery[node.id] ?? node.bktParams.pL0;
                    const isMastered = currentPL >= 0.85;
                    const isWeak = currentPL < 0.45;

                    return (
                      <tr key={node.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-sans font-medium text-slate-200">
                          {node.title}
                        </td>
                        <td className="p-3 text-center text-slate-400">{node.bktParams.pL0.toFixed(2)}</td>
                        <td className="p-3 text-center text-slate-400">{node.bktParams.pT.toFixed(2)}</td>
                        <td className="p-3 text-center text-slate-400">{node.bktParams.pG.toFixed(2)}</td>
                        <td className="p-3 text-center text-slate-400">{node.bktParams.pS.toFixed(2)}</td>
                        <td className="p-3 text-center font-bold">
                          <span className={isMastered ? 'text-emerald-400' : isWeak ? 'text-rose-400' : 'text-amber-400'}>
                            {Math.round(currentPL * 100)}%
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          {isMastered ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                              Mastered
                            </span>
                          ) : isWeak ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                              At Risk
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                              Learning
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Deep Knowledge Tracing (DKT) */}
      {activeSubTab === 'dkt' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Dynamic DKT Step Runner & Neural Propagator */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                  Neural Sandbox
                </span>
                <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Deep Knowledge Tracing (DKT) Recurrent GRU Step Runner</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDktNetwork}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Recurrent State</span>
                </button>
              </div>
            </div>

            {/* Interactive Step Controls */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Target Concept to Feed:</label>
                  <select
                    value={dktInputConceptId}
                    onChange={(e) => setDktInputConceptId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {concepts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (Depth {c.depth})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Observation Outcome:</label>
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setDktInputCorrect(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        dktInputCorrect ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Correct (✓)
                    </button>
                    <button
                      onClick={() => setDktInputCorrect(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        !dktInputCorrect ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Incorrect (✗)
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStepDktNetwork}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Propagate Through Recurrent Network</span>
              </button>
            </div>

            {/* Recurrent Hidden State Vector Heatmap (32 Neurons) */}
            <div className={`p-5 rounded-2xl bg-slate-950 border transition-all duration-300 ${dktPulseActive ? 'border-indigo-400 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500/30' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-bold">Recurrent Hidden State Vector h_t (Dimension: 32)</span>
                  {dktPulseActive && (
                    <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800 font-semibold animate-pulse">
                      ⚡ Forward Propagation Active
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-[10px]">GRU Activation: tanh(·) ∈ [-1.0, +1.0]</span>
              </div>

              <div className="grid grid-cols-8 sm:grid-cols-16 md:grid-cols-32 gap-1.5 pt-1">
                {(liveDktState?.hiddenVector ?? Array(32).fill(0)).map((val, idx) => {
                  const normalized = Math.max(-1, Math.min(1, val));
                  const isSelected = selectedNeuronIdx === idx;
                  const bg = normalized > 0
                    ? `rgba(99, 102, 241, ${Math.abs(normalized) * 0.85 + 0.15})`
                    : `rgba(244, 63, 94, ${Math.abs(normalized) * 0.85 + 0.15})`;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedNeuronIdx(idx)}
                      title={`Neuron h[${idx}] = ${val.toFixed(3)}`}
                      className={`h-9 rounded-lg border flex items-center justify-center text-[10px] font-mono text-white transition-all cursor-pointer ${
                        isSelected ? 'border-amber-300 ring-2 ring-amber-400/50 scale-110 z-10' : 'border-slate-800 hover:scale-105'
                      }`}
                      style={{ backgroundColor: bg }}
                    >
                      {idx}
                    </button>
                  );
                })}
              </div>

              {/* Selected Neuron Inspector Box */}
              <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">Inspecting Neuron <strong className="text-indigo-300">h[{selectedNeuronIdx}]</strong>:</span>
                  <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {(liveDktState?.hiddenVector?.[selectedNeuronIdx] ?? 0).toFixed(4)}
                  </span>
                  <span className={`text-[10px] ${
                    (liveDktState?.hiddenVector?.[selectedNeuronIdx] ?? 0) >= 0 ? 'text-indigo-400' : 'text-rose-400'
                  }`}>
                    {(liveDktState?.hiddenVector?.[selectedNeuronIdx] ?? 0) >= 0 ? 'Positive Activation' : 'Negative Activation'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Click any neuron cell to inspect its continuous latent activation
                </span>
              </div>
            </div>

            {/* Cross-Concept Knowledge Transfer Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Cross-Concept Knowledge Transfer Vector (ŷ_t = σ(W_out · h_t + b_out))
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Observe how practicing the target concept simultaneously updates predictions across all syllabus topics through recurrent weight sharing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {concepts.map((c) => {
                  const dktPred = liveDktState?.masteryPredictions[c.id] ?? 0.5;
                  const delta = dktDeltas[c.id];
                  const hasDelta = delta !== undefined && Math.abs(delta) > 0.001;
                  const isTarget = c.id === dktInputConceptId;

                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl bg-slate-950 border transition-all ${
                        isTarget ? 'border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30' : 'border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 truncate pr-2">{c.title}</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-indigo-300 font-bold">{Math.round(dktPred * 100)}%</span>
                          {hasDelta && (
                            <span className={`text-[10px] font-bold ${delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({delta > 0 ? `+${Math.round(delta * 100)}%` : `${Math.round(delta * 100)}%`})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dktPred >= 0.75 ? 'bg-emerald-500' : dktPred < 0.45 ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.round(dktPred * 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                        <span>Phase {c.depth}</span>
                        {isTarget ? (
                          <span className="text-indigo-400 font-bold">Targeted Concept</span>
                        ) : hasDelta ? (
                          <span className={delta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            Transfer: {delta > 0 ? 'Positive' : 'Attenuated'}
                          </span>
                        ) : (
                          <span>Contextual State</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* DKT Architecture Equations */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Stanford Deep Knowledge Tracing (DKT) Mathematical Dynamics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold block">1. GRU Gate Activations:</span>
                <p className="text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px]">
                  z_t = σ(W_z · x_t + U_z · h_{`{t-1}`} + b_z) <span className="text-slate-500">[Update Gate]</span><br />
                  r_t = σ(W_r · x_t + U_r · h_{`{t-1}`} + b_r) <span className="text-slate-500">[Reset Gate]</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">2. Recurrent Memory & Output:</span>
                <p className="text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[11px]">
                  h_t = (1 - z_t) ⊙ h_{`{t-1}`} + z_t ⊙ h̃_t<br />
                  ŷ_t = σ(W_out · h_t + b_out)
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: Item Response Theory (2PL / 3PL IRT) */}
      {activeSubTab === 'irt' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Interactive ICC & Fisher Information Simulator */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  Psychometric Engine
                </span>
                <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>2-Parameter / 3-Parameter Logistic (2PL/3PL) IRT Simulator</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFisherInfo(!showFisherInfo)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    showFisherInfo ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {showFisherInfo ? '✓ Fisher Information Active' : '+ Show Fisher Information Curve'}
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Student Ability θ:</span>
                  <span className="font-bold text-cyan-400">{irtTheta > 0 ? `+${irtTheta.toFixed(2)}` : irtTheta.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.05"
                  value={irtTheta}
                  onChange={(e) => setIrtTheta(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Latent trait parameter in [-3, +3]</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Difficulty (b):</span>
                  <span className="font-bold text-amber-400">{irtDifficulty > 0 ? `+${irtDifficulty.toFixed(2)}` : irtDifficulty.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.05"
                  value={irtDifficulty}
                  onChange={(e) => setIrtDifficulty(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Question difficulty location</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Discrimination (a):</span>
                  <span className="font-bold text-indigo-400">{irtDiscrimination.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={irtDiscrimination}
                  onChange={(e) => setIrtDiscrimination(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Slope steepness (separating abilities)</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Pseudo-Guessing (c):</span>
                  <span className="font-bold text-rose-400">{irtGuessing.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.35"
                  step="0.05"
                  value={irtGuessing}
                  onChange={(e) => setIrtGuessing(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-slate-500 block">Lower asymptote floor</span>
              </div>
            </div>

            {/* Real-time Diagnostics & ZPD Flow Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Predicted Probability P(Correct)</span>
                <span className={`text-2xl font-black font-mono mt-0.5 block ${
                  irtCurrentProb >= 0.70 && irtCurrentProb <= 0.80 ? 'text-emerald-400' :
                  irtCurrentProb > 0.80 ? 'text-blue-400' : 'text-rose-400'
                }`}>
                  {Math.round(irtCurrentProb * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {irtCurrentProb >= 0.70 && irtCurrentProb <= 0.80 ? '⚡ Flow Zone: optimal challenge' :
                   irtCurrentProb > 0.80 ? '💤 Low challenge: risk of boredom' :
                   '⚠️ High challenge: risk of frustration'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Fisher Information I(θ)</span>
                <span className="text-2xl font-black font-mono text-cyan-400 mt-0.5 block">
                  {irtFisherInfo.toFixed(3)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Measurement precision peak at θ ≈ b ({irtDifficulty.toFixed(2)})
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">AI Recommended Difficulty b*</span>
                <span className="text-2xl font-black font-mono text-purple-400 mt-0.5 block">
                  {irtIdealDifficulty > 0 ? `+${irtIdealDifficulty.toFixed(2)}` : irtIdealDifficulty.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Calibrated for Zone of Proximal Development (72% flow)
                </span>
              </div>
            </div>

            {/* Dynamic Responsive SVG Graph */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Item Characteristic Curve P(θ) vs Latent Ability</span>
                <span className="text-emerald-400 text-[11px] font-bold">--- ZPD Flow Zone (70% - 80%)</span>
              </div>

              <svg viewBox="0 0 700 240" className="w-full h-56 bg-slate-950 rounded-xl">
                {/* Axes */}
                <line x1="55" y1="200" x2="660" y2="200" stroke="#334155" strokeWidth="1.5" />
                <line x1="55" y1="20" x2="55" y2="200" stroke="#334155" strokeWidth="1.5" />

                {/* ZPD Target Band (P in [0.70, 0.80]) */}
                <rect x="55" y="60" width="605" height="20" fill="#10b981" fillOpacity="0.12" />
                <line x1="55" y1="70" x2="660" y2="70" stroke="#10b981" strokeDasharray="4 4" opacity="0.6" />
                <text x="665" y="74" fill="#10b981" fontSize="9" fontFamily="monospace">ZPD Flow</text>

                {/* Y-axis labels */}
                <text x="45" y="204" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">0.0</text>
                <text x="45" y="115" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">0.5</text>
                <text x="45" y="25" textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">1.0</text>

                {/* X-axis labels theta */}
                {[-3, -2, -1, 0, 1, 2, 3].map((t) => {
                  const x = 55 + ((t + 3) / 6) * 605;
                  return (
                    <g key={t}>
                      <line x1={x} y1="200" x2={x} y2="205" stroke="#475569" />
                      <text x={x} y="218" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">{t}</text>
                    </g>
                  );
                })}

                {/* Dynamic SVG polyline for ICC curve */}
                {(() => {
                  const points: string[] = [];
                  for (let i = 0; i <= 80; i++) {
                    const thetaVal = -3 + (i / 80) * 6;
                    const p = DynamicQuestionSelector.calculateProbability(
                      thetaVal,
                      irtDifficulty,
                      irtDiscrimination,
                      irtGuessing
                    );
                    const x = 55 + ((thetaVal + 3) / 6) * 605;
                    const y = 200 - p * 175;
                    points.push(`${x},${y}`);
                  }
                  return (
                    <polyline
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="3"
                      strokeLinecap="round"
                      points={points.join(' ')}
                    />
                  );
                })()}

                {/* Fisher Information Curve (Optional) */}
                {showFisherInfo && (() => {
                  const infoPoints: string[] = [];
                  const maxPossibleInfo = irtDiscrimination * irtDiscrimination * 0.25;
                  for (let i = 0; i <= 80; i++) {
                    const thetaVal = -3 + (i / 80) * 6;
                    const p = DynamicQuestionSelector.calculateProbability(
                      thetaVal,
                      irtDifficulty,
                      irtDiscrimination,
                      irtGuessing
                    );
                    const c = irtGuessing;
                    let info = 0;
                    if (p > c && p < 1 && (1 - c) > 0) {
                      const term = (p - c) / (1 - c);
                      info = irtDiscrimination * irtDiscrimination * term * term * ((1 - p) / p);
                    }
                    const normalizedY = (info / Math.max(0.1, maxPossibleInfo * 1.2)) * 140;
                    const x = 55 + ((thetaVal + 3) / 6) * 605;
                    const y = 200 - Math.min(180, normalizedY);
                    infoPoints.push(`${x},${y}`);
                  }
                  return (
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      opacity="0.85"
                      points={infoPoints.join(' ')}
                    />
                  );
                })()}

                {/* Student Ability Crosshair Line & Point */}
                {(() => {
                  const studentX = 55 + ((irtTheta + 3) / 6) * 605;
                  const currentY = 200 - irtCurrentProb * 175;
                  return (
                    <g>
                      <line x1={studentX} y1="20" x2={studentX} y2="200" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" />
                      <line x1="55" y1={currentY} x2={studentX} y2={currentY} stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx={studentX} cy={currentY} r="6" fill="#06b6d4" stroke="#0f172a" strokeWidth="2" />
                      <text x={studentX} y="15" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold" fontFamily="monospace">
                        θ = {irtTheta.toFixed(2)}
                      </text>
                      <text x={studentX + 8} y={currentY - 6} fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        P = {Math.round(irtCurrentProb * 100)}%
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* IRT Formulation Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
            <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Three-Parameter Logistic (3PL) Item Response Model Equation</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              P(correct | θ, a, b, c) = c + (1 - c) / [1 + e^{`{-a · (θ - b)}`}]
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: Real-time Session Log & Telemetry Timeline */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <span>Student Session Interaction Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Live record of adaptive responses, latency timings, and state shifts recorded during this user session.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                Total Interactions: <strong className="text-indigo-400">{student.interactionHistory.length}</strong>
              </span>
            </div>

            {student.interactionHistory.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No live interactions recorded yet in this session</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Take a quick quiz in the <strong>Adaptive Arena</strong> or use the <strong>Bayesian Sandbox</strong> to simulate learning telemetry!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Concept</th>
                      <th className="p-3 text-center">Outcome</th>
                      <th className="p-3 text-center">Response Latency</th>
                      <th className="p-3 text-center">BKT Shift P(L)</th>
                      <th className="p-3 text-center">Ability θ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {[...student.interactionHistory].reverse().map((rec) => {
                      const concept = graph.getNode(rec.conceptId);
                      const deltaBkt = rec.bktMasteryAfter - rec.bktMasteryBefore;
                      const latencySec = (rec.responseTimeMs / 1000).toFixed(1);

                      return (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-slate-400 text-[11px]">
                            {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3 font-sans font-semibold text-slate-200">
                            {concept?.title || rec.conceptId}
                          </td>
                          <td className="p-3 text-center">
                            {rec.isCorrect ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                Correct ✓
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                                Incorrect ✗
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={parseFloat(latencySec) < 3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                              {latencySec}s
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">
                            <span className="text-slate-400">{Math.round(rec.bktMasteryBefore * 100)}%</span>
                            <span className="text-slate-600 mx-1">→</span>
                            <span className={deltaBkt >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {Math.round(rec.bktMasteryAfter * 100)}%
                            </span>
                          </td>
                          <td className="p-3 text-center text-indigo-400">
                            {rec.estimatedAbilityAfter > 0 ? `+${rec.estimatedAbilityAfter.toFixed(2)}` : rec.estimatedAbilityAfter.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
