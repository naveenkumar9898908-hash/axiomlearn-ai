import React from 'react';
import { DiagnosticResult, ConceptNode } from '../types';
import { PrerequisiteKnowledgeGraph } from '../engine/knowledgeGraph';
import { AlertTriangle, ArrowRight, BrainCircuit, CheckCircle, Sparkles, X, Lightbulb } from 'lucide-react';

interface MisconceptionDiagnosticModalProps {
  diagnostic: DiagnosticResult | null;
  onClose: () => void;
  onLaunchMicroPath: (diagnostic: DiagnosticResult) => void;
  graph: PrerequisiteKnowledgeGraph;
}

export const MisconceptionDiagnosticModal: React.FC<MisconceptionDiagnosticModalProps> = ({
  diagnostic,
  onClose,
  onLaunchMicroPath,
  graph,
}) => {
  if (!diagnostic) return null;

  const rootConcept = graph.getNode(diagnostic.rootCauseConceptId);
  const targetConcept = graph.getNode(diagnostic.failedConceptId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-lg shadow-amber-500/10">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Cognitive Gap Diagnosis
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Confidence: {Math.round(diagnostic.diagnosticConfidence * 100)}%
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Prerequisite Misconception Isolated
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The engine detected that your struggle with <strong className="text-slate-200">{targetConcept?.title}</strong> originates from an unmastered foundational concept.
            </p>
          </div>
        </div>

        {/* Reverse Causal Chain Visualizer */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Prerequisite Dependency Chain Traversed
          </span>
          
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {diagnostic.causalChain.map((cid, idx) => {
              const node = graph.getNode(cid);
              const isRoot = cid === diagnostic.rootCauseConceptId;
              const isTarget = cid === diagnostic.failedConceptId;

              return (
                <React.Fragment key={cid}>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      isRoot
                        ? 'bg-rose-950/50 border-rose-500/70 text-rose-300 ring-1 ring-rose-500/50'
                        : isTarget
                        ? 'bg-amber-950/50 border-amber-500/70 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    {isRoot && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{node?.title ?? cid}</span>
                    {isRoot && (
                      <span className="text-[9px] bg-rose-500/30 text-rose-200 px-1.5 py-0.2 rounded font-mono">
                        Root Bottleneck
                      </span>
                    )}
                  </div>
                  {idx < diagnostic.causalChain.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Identified Misconception Details */}
        {diagnostic.identifiedMisconception ? (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
              <Lightbulb className="w-4 h-4 text-rose-400" />
              <span>Misconception Pattern: {diagnostic.identifiedMisconception.label}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {diagnostic.identifiedMisconception.description}
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/50 text-xs text-rose-200">
              <strong className="text-rose-400">Remedial Fix:</strong> {diagnostic.identifiedMisconception.remedialAdvice}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-300 leading-relaxed">
            {diagnostic.explanation}
          </div>
        )}

        {/* Bottom CTA to Launch Remediation Path */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Remediation Path: 4 focused micro-steps (~3 min)
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Review Later
            </button>
            <button
              onClick={() => {
                onLaunchMicroPath(diagnostic);
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Micro-Practice Path</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
