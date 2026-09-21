import React, { useState, useEffect, useRef } from 'react';
import { Question, StudentProfile, ConceptNode } from '../types';
import { DynamicQuestionSelector } from '../engine/irtSelector';
import { BayesianKnowledgeTracer, BKTUpdateResult } from '../engine/bkt';
import { PrerequisiteKnowledgeGraph } from '../engine/knowledgeGraph';
import {
  Clock,
  Target,
  Zap,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  SearchCode
} from 'lucide-react';

interface AdaptivePracticeArenaProps {
  graph: PrerequisiteKnowledgeGraph;
  questions: Question[];
  student: StudentProfile;
  onRecordInteraction: (
    question: Question,
    selectedOptionId: string,
    isCorrect: boolean,
    responseTimeMs: number,
    bktResult: BKTUpdateResult,
    newTheta: number
  ) => void;
  onTriggerDiagnostic: (question: Question, selectedOptionId: string) => void;
  targetConceptId?: string | null;
}

export const AdaptivePracticeArena: React.FC<AdaptivePracticeArenaProps> = ({
  graph,
  questions,
  student,
  onRecordInteraction,
  onTriggerDiagnostic,
  targetConceptId,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastBktResult, setLastBktResult] = useState<BKTUpdateResult | null>(null);

  const timerRef = useRef<any>(null);

  // Set of questions answered in current session
  const answeredQuestionIds = useRef(new Set<string>());

  // Select next adaptive question using 2PL IRT + ZPD targeting
  const selectNextQuestion = () => {
    setHasSubmitted(false);
    setSelectedOptionId(null);
    setShowHint(false);
    setLastBktResult(null);

    // Candidates pool
    let candidates = questions;
    if (targetConceptId) {
      const filtered = questions.filter((q) => q.conceptId === targetConceptId);
      if (filtered.length > 0) candidates = filtered;
    } else {
      // Prioritize frontier concepts or in-progress concepts
      const frontier = graph.computeLearningFrontier(student.conceptMastery, 0.85);
      if (frontier.length > 0) {
        const frontierQuestions = questions.filter((q) => frontier.includes(q.conceptId));
        if (frontierQuestions.length > 0) {
          candidates = frontierQuestions;
        }
      }
    }

    const selection = DynamicQuestionSelector.selectOptimalQuestion(
      candidates,
      student.theta,
      0.72, // Flow state optimal challenge probability
      answeredQuestionIds.current
    );

    if (selection) {
      setCurrentQuestion(selection.question);
      setStartTime(Date.now());
      setElapsedSeconds(0);
    } else {
      // Fallback reset answered set if exhausted
      answeredQuestionIds.current.clear();
      if (candidates.length > 0) {
        setCurrentQuestion(candidates[Math.floor(Math.random() * candidates.length)]);
        setStartTime(Date.now());
        setElapsedSeconds(0);
      }
    }
  };

  useEffect(() => {
    selectNextQuestion();
  }, [targetConceptId, questions]);

  // Elapsed timer ticker
  useEffect(() => {
    if (!hasSubmitted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasSubmitted, currentQuestion]);

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        <p>No questions available for current concept criteria.</p>
        <button
          onClick={selectNextQuestion}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Reset Question Pool
        </button>
      </div>
    );
  }

  const concept = graph.getNode(currentQuestion.conceptId);
  const currentPL = student.conceptMastery[currentQuestion.conceptId] ?? concept?.bktParams.pL0 ?? 0.5;

  // IRT metrics for current question
  const predictedSuccess = DynamicQuestionSelector.calculateProbability(
    student.theta,
    currentQuestion.difficulty,
    currentQuestion.discrimination,
    currentQuestion.pseudoGuessing ?? 0.0
  );

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || hasSubmitted) return;

    const responseTimeMs = Date.now() - startTime;
    const selectedOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
    const isCorrect = selectedOption?.isCorrect ?? false;

    // 1. Update BKT state with Corbett-Anderson Bayesian logic & latency modulation
    const bktParams = concept?.bktParams ?? { pL0: 0.5, pT: 0.2, pG: 0.2, pS: 0.1 };
    const bktResult = BayesianKnowledgeTracer.update(
      currentPL,
      isCorrect,
      bktParams,
      responseTimeMs
    );
    setLastBktResult(bktResult);

    // 2. Update IRT Ability theta
    const newTheta = DynamicQuestionSelector.updateAbility(
      student.theta,
      currentQuestion,
      isCorrect,
      student.interactionHistory.length
    );

    answeredQuestionIds.current.add(currentQuestion.id);
    setHasSubmitted(true);

    onRecordInteraction(
      currentQuestion,
      selectedOptionId,
      isCorrect,
      responseTimeMs,
      bktResult,
      newTheta
    );
  };

  const selectedOpt = currentQuestion.options.find((o) => o.id === selectedOptionId);
  const isCorrectAnswer = selectedOpt?.isCorrect ?? false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pop-in">
      
      {/* Dynamic Cyber Telemetry Banner */}
      <div className="relative overflow-hidden flex flex-wrap items-center justify-between gap-3 bg-[#021226]/90 border border-cyan-500/40 rounded-2xl p-4 backdrop-blur-md shadow-lg">
        {/* Subtle corner brackets */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-cyan-400" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-cyan-400" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-cyan-400" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-cyan-400" />

        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white text-glow-cyan">{concept?.title ?? 'Target Concept'}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/40">
                {currentQuestion.bloomsLevel}
              </span>
            </div>
            <p className="text-xs text-cyan-400/70 font-mono">Adaptive Dynamic Selector (2PL IRT + ZPD Flow)</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          {/* Calibrated Difficulty (b) */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/30">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Difficulty b:</span>
            <span className={`font-bold ${currentQuestion.difficulty > 0.5 ? 'text-rose-400' : currentQuestion.difficulty < -0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentQuestion.difficulty > 0 ? `+${currentQuestion.difficulty.toFixed(2)}` : currentQuestion.difficulty.toFixed(2)}
            </span>
          </div>

          {/* Expected Probability P(Success) */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">P(Success):</span>
            <span className="font-bold text-cyan-300">{Math.round(predictedSuccess * 100)}%</span>
          </div>

          {/* Response Latency Timer */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{elapsedSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Main Question Card Container */}
      <div className="relative rounded-3xl bg-[#020f21]/90 border border-cyan-500/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
        {/* Tactical Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-10 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-10 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-10 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-10 pointer-events-none" />

        {/* Prompt */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQuestion.prompt}
          </h2>

          {/* Optional Code Snippet */}
          {currentQuestion.codeSnippet && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
              {currentQuestion.codeSnippet}
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            let optStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-950/70';

            if (hasSubmitted) {
              if (opt.isCorrect) {
                optStyle = 'border-emerald-500/90 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500 shadow-md shadow-emerald-500/20';
              } else if (isSelected && !opt.isCorrect) {
                optStyle = 'border-rose-500/90 bg-rose-950/50 text-rose-200 ring-1 ring-rose-500 shadow-md shadow-rose-500/20';
              } else {
                optStyle = 'border-slate-800/40 bg-slate-950/20 text-slate-500 opacity-50';
              }
            } else if (isSelected) {
              optStyle = 'border-cyan-400 bg-cyan-950/60 text-white ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.008]';
            }

            return (
              <div
                key={opt.id}
                onClick={() => {
                  if (!hasSubmitted) setSelectedOptionId(opt.id);
                }}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${optStyle}`}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-grow text-sm leading-relaxed">
                  {opt.text}
                </div>
                {hasSubmitted && opt.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {hasSubmitted && isSelected && !opt.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls & Hint */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-cyan-500/20">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>{showHint ? 'Hide Diagnostic Hint' : 'Show Scaffolding Hint'}</span>
          </button>

          {!hasSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOptionId}
              className={`px-7 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                selectedOptionId
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-500/30 hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Submit Response
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {!isCorrectAnswer && (
                <button
                  onClick={() => onTriggerDiagnostic(currentQuestion, selectedOptionId!)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/30 transition-all animate-pulse cursor-pointer"
                >
                  <SearchCode className="w-4 h-4 text-slate-950" />
                  <span>Pinpoint Root Cause Gap</span>
                </button>
              )}
              <button
                onClick={selectNextQuestion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Hint Accordion */}
        {showHint && (
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed animate-in fade-in">
            <strong>Hint:</strong> {currentQuestion.hint}
          </div>
        )}

        {/* Post-Submission Feedback Panel */}
        {hasSubmitted && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-200">
            {/* Outcome Banner with XP Rewards */}
            <div className={`p-4 rounded-xl border ${isCorrectAnswer ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {isCorrectAnswer ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {isCorrectAnswer ? 'Correct! Concept Reinforced.' : 'Incorrect Response Detected'}
                      </h4>
                      {isCorrectAnswer ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                          +{50 + student.streak * 15 + Math.max(0, Math.round(currentQuestion.difficulty * 25))} XP Earned!
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          +10 Effort XP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      {selectedOpt?.explanation}
                    </p>
                  </div>
                </div>

                {/* Streak Badge */}
                {isCorrectAnswer && student.streak > 0 && (
                  <div className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 rounded-xl flex-shrink-0">
                    <span>🔥 Streak:</span>
                    <span>{student.streak + 1}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cognitive Telemetry Delta Card */}
            {lastBktResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">BKT Mastery $P(L)$</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-400">{Math.round(lastBktResult.pL_prior * 100)}%</span>
                    <span className="text-slate-600">→</span>
                    <span className={`font-bold ${lastBktResult.pL_next >= lastBktResult.pL_prior ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Math.round(lastBktResult.pL_next * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Latency Modulation</span>
                  <span className="font-semibold text-indigo-300 mt-0.5 block">
                    {lastBktResult.latencyFactor > 1.0 ? 'High Deliberation (x1.2)' : lastBktResult.latencyFactor < 1.0 ? 'Hurried / Slip Dampened' : 'Standard Pacing'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Full Solution</span>
                  <p className="text-slate-300 truncate mt-0.5 font-sans" title={currentQuestion.fullSolution}>
                    {currentQuestion.fullSolution}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
