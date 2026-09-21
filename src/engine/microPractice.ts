import { ConceptNode, DiagnosticResult, MicroPracticePath, MicroPracticeStep, Question } from '../types';
import { PrerequisiteKnowledgeGraph } from './knowledgeGraph';

export class MicroPracticeGenerator {
  private graph: PrerequisiteKnowledgeGraph;
  private allQuestions: Map<string, Question[]> = new Map(); // conceptId -> questions

  constructor(graph: PrerequisiteKnowledgeGraph, questions: Question[]) {
    this.graph = graph;
    for (const q of questions) {
      if (!this.allQuestions.has(q.conceptId)) {
        this.allQuestions.set(q.conceptId, []);
      }
      this.allQuestions.get(q.conceptId)!.push(q);
    }
  }

  /**
   * Generates a 4-step customized micro-practice remediation path.
   */
  public generatePath(diagnostic: DiagnosticResult): MicroPracticePath {
    const rootNode = this.graph.getNode(diagnostic.rootCauseConceptId);
    const targetNode = this.graph.getNode(diagnostic.failedConceptId);

    const steps: MicroPracticeStep[] = [];

    // Step 1: Cognitive Refresher Card
    const refresher = rootNode?.remedialRefresher ?? targetNode?.remedialRefresher ?? {
      coreConcept: 'Foundational review',
      keyIntuition: 'Breaking complex problems into fundamental rules restores intuitive clarity.',
      commonPitfall: 'Rushing through intermediate algebraic or logical derivations.',
      mnemonicOrRule: 'Verify each transformation step before combining operations.'
    };

    steps.push({
      stepNumber: 1,
      type: 'refresher',
      title: `Step 1: Cognitive Refresher — ${rootNode?.title ?? 'Core Foundation'}`,
      conceptId: diagnostic.rootCauseConceptId,
      content: {
        summary: refresher.keyIntuition,
        keyTakeaway: refresher.mnemonicOrRule,
        warningNote: refresher.commonPitfall,
      },
    });

    // Step 2: Foundational Check (easy question from root-cause concept)
    const rootQuestions = this.allQuestions.get(diagnostic.rootCauseConceptId) ?? [];
    // Sort by easiest difficulty first
    const sortedRootQ = [...rootQuestions].sort((a, b) => a.difficulty - b.difficulty);
    const foundationalQ = sortedRootQ[0] ?? rootQuestions[0];

    if (foundationalQ) {
      steps.push({
        stepNumber: 2,
        type: 'prerequisite_check',
        title: `Step 2: Foundational Check — ${rootNode?.title ?? 'Prerequisite'}`,
        conceptId: diagnostic.rootCauseConceptId,
        question: foundationalQ,
      });
    }

    // Step 3: Scaffolded Bridge Question (intermediate question from prerequisite or bridge concept)
    let bridgeQ: Question | undefined;
    if (diagnostic.rootCauseConceptId !== diagnostic.failedConceptId) {
      // Pick a moderate question from intermediate or root
      bridgeQ = sortedRootQ[1] || sortedRootQ[0];
    } else {
      const targetQuestions = this.allQuestions.get(diagnostic.failedConceptId) ?? [];
      const sortedTargetQ = [...targetQuestions].sort((a, b) => a.difficulty - b.difficulty);
      bridgeQ = sortedTargetQ.find((q) => q.id !== diagnostic.questionId) || sortedTargetQ[0];
    }

    if (bridgeQ) {
      steps.push({
        stepNumber: 3,
        type: 'bridge_scaffold',
        title: `Step 3: Scaffolded Bridge — Connecting Concepts`,
        conceptId: bridgeQ.conceptId,
        question: bridgeQ,
      });
    }

    // Step 4: Mastery Verification Challenge (target concept question)
    const targetQuestions = this.allQuestions.get(diagnostic.failedConceptId) ?? [];
    const verificationQ = targetQuestions.find((q) => q.id !== diagnostic.questionId) ?? targetQuestions[0];

    if (verificationQ) {
      steps.push({
        stepNumber: 4,
        type: 'mastery_verification',
        title: `Step 4: Mastery Verification — ${targetNode?.title ?? 'Target Concept'}`,
        conceptId: diagnostic.failedConceptId,
        question: verificationQ,
      });
    }

    return {
      id: `micro-path-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      triggerMisconceptionId: diagnostic.identifiedMisconception?.id,
      targetConceptId: diagnostic.failedConceptId,
      rootCauseConceptId: diagnostic.rootCauseConceptId,
      steps,
      currentStepIndex: 0,
      isFinished: false,
      masteryGainEstimate: 0.28,
    };
  }
}
