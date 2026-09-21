import React, { useState, useEffect, useRef } from 'react';
import { MicroPracticePath, MicroPracticeStep, StudentProfile, Question } from '../types';
import { PrerequisiteKnowledgeGraph } from '../engine/knowledgeGraph';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Trophy,
  RotateCcw,
  Check,
  Flame,
  Lightbulb,
  Volume2,
  VolumeX,
  Copy,
  CheckCheck,
  Compass,
  Network,
  BrainCircuit,
  Target,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Award,
  Layers,
  TrendingUp
} from 'lucide-react';

interface MicroPracticeRunnerProps {
  path: MicroPracticePath | null;
  graph: PrerequisiteKnowledgeGraph;
  student: StudentProfile;
  onCompleteStep: (stepIndex: number, wasCorrect: boolean) => void;
  onFinishPath: () => void;
  onCancelPath: () => void;
  onLaunchSamplePath?: () => void;
  onGoToGraph?: () => void;
  onGoToArena?: () => void;
}

// ---------------------------------------------------------------------------
// Synthesized Web Audio Sound Generator (No external files required)
// ---------------------------------------------------------------------------
const playAudioTone = (type: 'select' | 'success' | 'wrong' | 'celebrate' | 'chime') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'chime') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08); // A5
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08); // D6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start(ctx.currentTime + 0.08);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'celebrate') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    }
  } catch (e) {
    // Ignore audio context autoplay errors
  }
};

// ---------------------------------------------------------------------------
// Lightweight Pure Canvas Confetti Component
// ---------------------------------------------------------------------------
const ConfettiCanvas: React.FC<{ trigger: number }> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#38bdf8', '#fbbf24', '#a855f7'];
    const count = 70;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 1.5) * 11,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // gravity
        p.vx *= 0.985; // drag
        p.rotation += p.vRot;
        p.opacity -= 0.012; // fade

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-40 w-full h-full rounded-3xl"
    />
  );
};

// ---------------------------------------------------------------------------
// Main MicroPracticeRunner Component
// ---------------------------------------------------------------------------
export const MicroPracticeRunner: React.FC<MicroPracticeRunnerProps> = ({
  path,
  graph,
  student,
  onCompleteStep,
  onFinishPath,
  onCancelPath,
  onLaunchSamplePath,
  onGoToGraph,
  onGoToArena,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnsweredStep, setHasAnsweredStep] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const [showCelebrationScreen, setShowCelebrationScreen] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copiedMnemonic, setCopiedMnemonic] = useState<boolean>(false);
  const [hasAcknowledgedRefresher, setHasAcknowledgedRefresher] = useState<boolean>(false);
  const [viewStepIndex, setViewStepIndex] = useState<number>(0);
  const [shakeWrongAnswer, setShakeWrongAnswer] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Sync viewStepIndex with path.currentStepIndex
  useEffect(() => {
    if (path) {
      setViewStepIndex(path.currentStepIndex);
      setSelectedOptionId(null);
      setHasAnsweredStep(false);
      setShowHint(false);
      setHasAcknowledgedRefresher(false);
      setShakeWrongAnswer(false);
    }
  }, [path?.currentStepIndex]);

  // Elapsed timer
  useEffect(() => {
    if (!path || showCelebrationScreen) return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [path, showCelebrationScreen]);

  // If no active path, render the modern interactive waiting & demo hub
  if (!path) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pop-in">
        {/* Glowing Radar Hub */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Radar Center Animation */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" />
            <div className="absolute inset-1 rounded-full border border-amber-500/30 animate-pulse" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 z-10">
              <BrainCircuit className="w-7 h-7" />
            </div>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>COGNITIVE DIAGNOSTIC ENGINE STANDING BY</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Targeted Micro-Practice Pathway
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              When the AI diagnostic engine isolates a foundational misconception tripping you up during adaptive practice, it builds a personalized 4-step remediation pathway right here.
            </p>
          </div>

          {/* 4-Step Methodology Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1.5 transition-all hover:border-amber-500/40">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Step 1</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Cognitive Refresher</p>
              <p className="text-[11px] text-slate-400">Restores mental models and rules.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1.5 transition-all hover:border-amber-500/40">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold font-mono">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Step 2</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Prereq Diagnostic</p>
              <p className="text-[11px] text-slate-400">Verifies root-cause foundation.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1.5 transition-all hover:border-amber-500/40">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold font-mono">
                <Layers className="w-3.5 h-3.5" />
                <span>Step 3</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Scaffolded Bridge</p>
              <p className="text-[11px] text-slate-400">Connects old rules to new skills.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1.5 transition-all hover:border-amber-500/40">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                <Target className="w-3.5 h-3.5" />
                <span>Step 4</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Mastery Check</p>
              <p className="text-[11px] text-slate-400">Validates unblocked target mastery.</p>
            </div>
          </div>

          {/* Interactive Demo Action CTA */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3">
            {onLaunchSamplePath && (
              <button
                onClick={() => {
                  if (soundEnabled) playAudioTone('select');
                  onLaunchSamplePath();
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Launch Sample Micro-Practice Demo</span>
              </button>
            )}

            {onGoToArena && (
              <button
                onClick={onGoToArena}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Practice in Adaptive Arena</span>
              </button>
            )}

            {onGoToGraph && (
              <button
                onClick={onGoToGraph}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Network className="w-4 h-4 text-emerald-400" />
                <span>Explore Concept Graph</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const rootConcept = graph.getNode(path.rootCauseConceptId);
  const targetConcept = graph.getNode(path.targetConceptId);
  const currentStep = path.steps[viewStepIndex] || path.steps[path.currentStepIndex];
  const isViewingCurrentStep = viewStepIndex === path.currentStepIndex;

  // Option check helper
  const handleCheckAnswer = () => {
    if (!selectedOptionId || !currentStep.question) return;
    setHasAnsweredStep(true);

    const chosen = currentStep.question.options.find((o) => o.id === selectedOptionId);
    const correct = chosen?.isCorrect ?? false;

    if (correct) {
      if (soundEnabled) playAudioTone('success');
      setConfettiTrigger((prev) => prev + 1);
    } else {
      if (soundEnabled) playAudioTone('wrong');
      setShakeWrongAnswer(true);
      setTimeout(() => setShakeWrongAnswer(false), 500);
    }
  };

  // Step advancement helper
  const handleAdvanceStep = (wasCorrect: boolean = true) => {
    // If we're on the 4th step (last step), trigger celebration screen!
    if (path.currentStepIndex + 1 >= path.steps.length) {
      if (soundEnabled) playAudioTone('celebrate');
      setConfettiTrigger((prev) => prev + 1);
      setShowCelebrationScreen(true);
      return;
    }

    if (soundEnabled) playAudioTone('chime');
    onCompleteStep(path.currentStepIndex, wasCorrect);
  };

  // Option selection
  const handleSelectOption = (optId: string) => {
    if (hasAnsweredStep) return;
    if (soundEnabled) playAudioTone('select');
    setSelectedOptionId(optId);
  };

  // Copy rule mnemonic
  const handleCopyMnemonic = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMnemonic(true);
    if (soundEnabled) playAudioTone('select');
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  // -------------------------------------------------------------------------
  // CELEBRATION & RECAP SCREEN
  // -------------------------------------------------------------------------
  if (showCelebrationScreen) {
    return (
      <div className="relative max-w-3xl mx-auto space-y-6 animate-pop-in">
        <ConfettiCanvas trigger={confettiTrigger} />

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-8 sm:p-12 text-center shadow-2xl space-y-8">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Floating Trophy Badge */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center animate-float-gentle">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/50 animate-celebrate-glow">
              <Trophy className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-xs font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>COGNITIVE MISCONCEPTION REPAIRED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Prerequisite Gap Successfully Healed!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              You rebuilt the foundational bridge from <strong className="text-amber-400">{rootConcept?.title}</strong> to <strong className="text-emerald-400">{targetConcept?.title}</strong>. Your adaptive learning path is fully unlocked!
            </p>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider block">XP Award</span>
              <div className="text-xl font-black text-amber-300 flex items-center justify-center gap-1">
                <span>+200 XP</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[10px] text-amber-200/70">Mega Remediation</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">Root Mastery</span>
              <div className="text-xl font-black text-emerald-300 flex items-center justify-center gap-1">
                <span>+30%</span>
                <Flame className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[10px] text-emerald-200/70">{rootConcept?.title?.split(' ')[0]}</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider block">Target Mastery</span>
              <div className="text-xl font-black text-indigo-300 flex items-center justify-center gap-1">
                <span>+25%</span>
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-[10px] text-indigo-200/70">{targetConcept?.title?.split(' ')[0]}</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider block">Latent Ability</span>
              <div className="text-xl font-black text-purple-300 flex items-center justify-center gap-1">
                <span>+0.35 θ</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-[10px] text-purple-200/70">IRT Ability Boost</span>
            </div>
          </div>

          {/* Before vs After Mastery Comparison */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-xl mx-auto space-y-3 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Remediation Impact on Syllabus Mastery
            </span>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{rootConcept?.title} (Foundational)</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {Math.round(((student.conceptMastery[path.rootCauseConceptId] ?? 0.45) * 100))}% → {Math.min(95, Math.round(((student.conceptMastery[path.rootCauseConceptId] ?? 0.45) * 100) + 30))}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 shimmer-bar"
                    style={{ width: `${Math.min(95, Math.round(((student.conceptMastery[path.rootCauseConceptId] ?? 0.45) * 100) + 30))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{targetConcept?.title} (Target Concept)</span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {Math.round(((student.conceptMastery[path.targetConceptId] ?? 0.35) * 100))}% → {Math.min(95, Math.round(((student.conceptMastery[path.targetConceptId] ?? 0.35) * 100) + 25))}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-1000 shimmer-bar"
                    style={{ width: `${Math.min(95, Math.round(((student.conceptMastery[path.targetConceptId] ?? 0.35) * 100) + 25))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                onFinishPath();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Network className="w-4 h-4" />
              <span>Claim Rewards & Return to Graph</span>
            </button>

            {onGoToArena && (
              <button
                onClick={() => {
                  onFinishPath();
                  onGoToArena();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Continue Adaptive Arena</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // ACTIVE STEP RUNNER VIEW
  // -------------------------------------------------------------------------
  const currentQ = currentStep.question;
  const chosenOpt = currentQ?.options.find((o) => o.id === selectedOptionId);
  const isCorrect = chosenOpt?.isCorrect ?? false;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="relative max-w-3xl mx-auto space-y-6 animate-pop-in">
      <ConfettiCanvas trigger={confettiTrigger} />

      {/* Top HUD & Ambient Banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl backdrop-blur-md space-y-5">
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 flex-shrink-0 animate-ring-ripple">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-extrabold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  Adaptive Remediation Pathway
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span>⏱️ {timeFormatted}</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Rebuilding: <span className="text-amber-400">{rootConcept?.title}</span> → <span className="text-indigo-400">{targetConcept?.title}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Mega Reward Badge */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>+200 XP</span>
            </div>

            {/* Cancel / Exit */}
            <button
              onClick={onCancelPath}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>

        {/* 4-Step Interactive Stepper Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-800/70">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {path.steps.map((step, idx) => {
              const isPassed = idx < path.currentStepIndex;
              const isCurrent = idx === path.currentStepIndex;
              const isViewing = idx === viewStepIndex;

              const stepIcons = [
                <BookOpen className="w-3.5 h-3.5" key="1" />,
                <HelpCircle className="w-3.5 h-3.5" key="2" />,
                <Layers className="w-3.5 h-3.5" key="3" />,
                <Target className="w-3.5 h-3.5" key="4" />
              ];

              return (
                <button
                  key={step.stepNumber}
                  onClick={() => {
                    if (isPassed || isCurrent) {
                      setViewStepIndex(idx);
                      if (soundEnabled) playAudioTone('select');
                    }
                  }}
                  disabled={!isPassed && !isCurrent}
                  className={`text-left transition-all group ${!isPassed && !isCurrent ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                >
                  <div
                    className={`h-2 rounded-full mb-2 transition-all ${
                      isPassed
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40'
                        : isCurrent
                        ? 'bg-amber-500 animate-pulse shimmer-bar'
                        : 'bg-slate-800'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isCurrent
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {stepIcons[idx]}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold hidden sm:inline ${
                          isViewing
                            ? 'text-white underline underline-offset-4 decoration-amber-500'
                            : isCurrent
                            ? 'text-amber-400'
                            : isPassed
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        Step {step.stepNumber}
                      </span>
                    </div>

                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Banner if viewing an earlier step */}
      {!isViewingCurrentStep && (
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Reviewing Step {currentStep.stepNumber}. Click current step to resume active question.</span>
          </div>
          <button
            onClick={() => setViewStepIndex(path.currentStepIndex)}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-[11px] transition-colors cursor-pointer"
          >
            Resume Step {path.currentStepIndex + 1}
          </button>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">

        {/* Step Category Header Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-800/50">
            {currentStep.type === 'refresher' && <BookOpen className="w-4 h-4 text-amber-400" />}
            {currentStep.type === 'prerequisite_check' && <HelpCircle className="w-4 h-4 text-amber-400" />}
            {currentStep.type === 'bridge_scaffold' && <Layers className="w-4 h-4 text-amber-400" />}
            {currentStep.type === 'mastery_verification' && <Target className="w-4 h-4 text-amber-400" />}
            <span>{currentStep.title}</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Step {currentStep.stepNumber} of {path.steps.length}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TYPE 1: COGNITIVE REFRESHER CARD */}
        {/* ----------------------------------------------------------------- */}
        {currentStep.type === 'refresher' && currentStep.content && (
          <div className="space-y-6 animate-pop-in">
            
            {/* Core Intuition Visual Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 space-y-3 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>Core Intuitive Mental Model</span>
              </div>
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                {currentStep.content.summary}
              </p>
            </div>

            {/* Golden Rule vs Common Trap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Golden Rule */}
              <div className="p-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Golden Rule / Mnemonic</span>
                  </span>
                  <button
                    onClick={() => handleCopyMnemonic(currentStep.content?.keyTakeaway || '')}
                    className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/80 hover:text-emerald-200 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-700/50 transition-colors cursor-pointer"
                  >
                    {copiedMnemonic ? <CheckCheck className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMnemonic ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed font-semibold">
                  "{currentStep.content.keyTakeaway}"
                </p>
              </div>

              {/* Common Pitfall */}
              <div className="p-5 rounded-2xl bg-rose-950/25 border border-rose-500/40 space-y-3">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>The Cognitive Pitfall / Trap</span>
                </span>
                <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
                  {currentStep.content.warningNote}
                </p>
              </div>
            </div>

            {/* Interactive Self-Affirmation Check */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAcknowledgedRefresher}
                  onChange={(e) => {
                    setHasAcknowledgedRefresher(e.target.checked);
                    if (e.target.checked && soundEnabled) playAudioTone('select');
                  }}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">
                  I have read, visualized, and internalized this foundational rule.
                </span>
              </label>

              {hasAcknowledgedRefresher && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Ready!</span>
                </span>
              )}
            </div>

            {/* Step 1 Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAdvanceStep(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
                  hasAcknowledgedRefresher
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 hover:scale-[1.02]'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <span>Proceed to Step 2: Foundational Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TYPES 2, 3, 4: INTERACTIVE QUESTION CHECKS */}
        {/* ----------------------------------------------------------------- */}
        {currentStep.question && (
          <div className={`space-y-6 animate-pop-in ${shakeWrongAnswer ? 'animate-shake-soft' : ''}`}>
            
            {/* Question Prompt */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentStep.question.prompt}
              </h3>
              {currentStep.question.codeSnippet && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                  {currentStep.question.codeSnippet}
                </div>
              )}
            </div>

            {/* Hint / Scaffolding Drawer */}
            <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
              <button
                onClick={() => {
                  setShowHint(!showHint);
                  if (!showHint && soundEnabled) playAudioTone('select');
                }}
                className="w-full flex items-center justify-between p-3.5 text-xs text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Need Scaffolding or a Mental Clue?</span>
                </div>
                {showHint ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
              </button>
              {showHint && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-pop-in">
                  <strong className="text-amber-400">Scaffolding Guidance:</strong> Think back to the foundational rule from Step 1. Focus on the core algebraic expansion or traversal invariant before evaluating the options.
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentStep.question.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                let optStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-950/90';

                if (hasAnsweredStep) {
                  if (opt.isCorrect) {
                    optStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500 shadow-md shadow-emerald-500/20';
                  } else if (isSelected && !opt.isCorrect) {
                    optStyle = 'border-rose-500 bg-rose-950/50 text-rose-200 ring-1 ring-rose-500 shadow-md shadow-rose-500/20';
                  } else {
                    optStyle = 'border-slate-800/40 opacity-40 text-slate-400';
                  }
                } else if (isSelected) {
                  optStyle = 'border-amber-500 bg-amber-950/40 text-white ring-1 ring-amber-500 shadow-md shadow-amber-500/10 scale-[1.005]';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${optStyle}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 transition-colors ${
                        hasAnsweredStep && opt.isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : hasAnsweredStep && isSelected && !opt.isCorrect
                          ? 'bg-rose-500 text-white'
                          : isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="text-xs sm:text-sm flex-grow pt-0.5 leading-relaxed">
                      {opt.text}
                    </div>
                    {hasAnsweredStep && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pop-in" />
                    )}
                    {hasAnsweredStep && isSelected && !opt.isCorrect && (
                      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pop-in" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Answer Feedback / Misconception Explanation */}
            {hasAnsweredStep && (
              <div
                className={`p-5 rounded-2xl border text-xs leading-relaxed animate-pop-in ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Excellent! Foundational Intuition Validated</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400">Cognitive Misconception Insight</span>
                    </>
                  )}
                </div>
                <p className="text-slate-200">
                  {chosenOpt?.explanation || currentStep.question.fullSolution}
                </p>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                {currentStep.type === 'prerequisite_check' && 'Validating root foundational prerequisite'}
                {currentStep.type === 'bridge_scaffold' && 'Connecting prerequisite to target concept'}
                {currentStep.type === 'mastery_verification' && 'Final target concept verification challenge'}
              </span>

              {!hasAnsweredStep ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOptionId}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedOptionId
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 cursor-pointer hover:scale-[1.02]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Verify Step Answer
                </button>
              ) : (
                <button
                  onClick={() => handleAdvanceStep(isCorrect)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>
                    {path.currentStepIndex + 1 === path.steps.length
                      ? 'Complete Path & Claim Rewards 🏆'
                      : `Advance to Step ${path.currentStepIndex + 2} →`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

