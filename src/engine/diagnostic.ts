import { PrerequisiteKnowledgeGraph } from './knowledgeGraph';
import { DiagnosticResult, Question, Misconception } from '../types';

export class RootCauseDiagnosticEngine {
  private graph: PrerequisiteKnowledgeGraph;

  constructor(graph: PrerequisiteKnowledgeGraph) {
    this.graph = graph;
  }

  /**
   * Diagnose why a student failed a question on concept targetConceptId.
   * Traverses backward through the prerequisite DAG, computes ancestral bottleneck scores,
   * inspects the chosen distractor's misconception metadata, and pinpoints the root cause.
   */
  public diagnoseError(
    targetConceptId: string,
    question: Question,
    selectedOptionId: string,
    currentMasteryMap: Record<string, number>
  ): DiagnosticResult {
    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    const targetNode = this.graph.getNode(targetConceptId);

    // 1. Identify specific misconception from selected distractor (if mapped)
    let identifiedMisconception: Misconception | undefined;
    if (selectedOption?.misconceptionId) {
      // Look in target node first
      identifiedMisconception = targetNode?.misconceptions.find(
        (m) => m.id === selectedOption.misconceptionId
      );

      // If not in target, look in ancestors
      if (!identifiedMisconception) {
        const ancestors = this.graph.getAllAncestors(targetConceptId);
        for (const anc of ancestors) {
          const ancNode = this.graph.getNode(anc.id);
          const found = ancNode?.misconceptions.find((m) => m.id === selectedOption.misconceptionId);
          if (found) {
            identifiedMisconception = found;
            break;
          }
        }
      }
    }

    // 2. Backward DAG traversal to evaluate ancestral bottleneck risk
    const ancestors = this.graph.getAllAncestors(targetConceptId);
    // Sort ancestors by depth descending (deepest / most foundational first)
    ancestors.sort((a, b) => b.depth - a.depth);

    let rootCauseId = targetConceptId;
    let maxRiskScore = 0;
    const causalChain: string[] = [];

    for (const anc of ancestors) {
      const ancMastery = currentMasteryMap[anc.id] ?? 0.5;
      const masteryDeficit = Math.max(0, 1.0 - ancMastery);
      // Risk combines deficit, dependency strength, and foundational depth
      const riskScore = masteryDeficit * anc.cumulativeWeight * (1 + 0.2 * anc.depth);

      if (masteryDeficit > 0.25 && riskScore > maxRiskScore) {
        maxRiskScore = riskScore;
        rootCauseId = anc.id;
      }
    }

    // Build the diagnostic causal chain path from rootCauseId to targetConceptId
    if (rootCauseId !== targetConceptId) {
      causalChain.push(rootCauseId);
      // Find intermediate hops
      const directPrereqs = this.graph.getDirectPrerequisites(targetConceptId);
      for (const dp of directPrereqs) {
        if (dp.id !== rootCauseId && !causalChain.includes(dp.id)) {
          causalChain.push(dp.id);
        }
      }
      causalChain.push(targetConceptId);
    } else {
      causalChain.push(targetConceptId);
    }

    const rootNode = this.graph.getNode(rootCauseId) ?? targetNode;
    const rootTitle = rootNode?.title ?? rootCauseId;

    // Confidence estimation
    const diagnosticConfidence = Math.min(
      0.95,
      0.5 + (identifiedMisconception ? 0.3 : 0.1) + maxRiskScore * 0.2
    );

    let explanation: string;
    if (rootCauseId !== targetConceptId) {
      explanation = `You struggled with ${targetNode?.title ?? targetConceptId}, but the true bottleneck traces back to ${rootTitle}. Because your mastery in ${rootTitle} is currently at ${Math.round((currentMasteryMap[rootCauseId] ?? 0.5) * 100)}%, higher-level derivations broke down.`;
    } else if (identifiedMisconception) {
      explanation = `Your answer triggered a classic misconception in ${targetNode?.title}: "${identifiedMisconception.label}". ${identifiedMisconception.remedialAdvice}`;
    } else {
      explanation = `You made an error on ${targetNode?.title}. We have identified an opportunity to reinforce this concept before advancing to higher complexity.`;
    }

    return {
      failedConceptId: targetConceptId,
      questionId: question.id,
      selectedOptionId,
      identifiedMisconception,
      rootCauseConceptId: rootCauseId,
      rootCauseConceptTitle: rootTitle,
      causalChain,
      diagnosticConfidence: Math.round(diagnosticConfidence * 100) / 100,
      explanation,
    };
  }
}
