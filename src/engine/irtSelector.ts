import { Question } from '../types';

export class DynamicQuestionSelector {
  /**
   * 2-Parameter Logistic (2PL) / 3PL probability of correct response.
   */
  public static calculateProbability(
    theta: number,
    difficulty: number,
    discrimination: number = 1.0,
    guessing: number = 0.0
  ): number {
    const exponent = -discrimination * (theta - difficulty);
    const clampedExp = Math.max(-20, Math.min(20, exponent));
    const p2pl = 1 / (1 + Math.exp(clampedExp));
    return guessing + (1 - guessing) * p2pl;
  }

  /**
   * Calculate Fisher Information for a question at ability theta.
   */
  public static calculateFisherInformation(
    theta: number,
    question: Question
  ): number {
    const P = this.calculateProbability(
      theta,
      question.difficulty,
      question.discrimination,
      question.pseudoGuessing ?? 0.0
    );
    const Q = 1 - P;
    const a = question.discrimination;
    return (a * a * Q * P) / (P + 0.001);
  }

  /**
   * Update student latent ability theta using an adaptive Newton-Raphson / Bayesian update.
   */
  public static updateAbility(
    currentTheta: number,
    question: Question,
    isCorrect: boolean,
    historyCount: number = 5
  ): number {
    const P = this.calculateProbability(
      currentTheta,
      question.difficulty,
      question.discrimination,
      question.pseudoGuessing ?? 0.0
    );
    const outcome = isCorrect ? 1.0 : 0.0;
    const a = question.discrimination;

    // Adaptive step size dampens as history grows (like Elo K-factor)
    const learningRate = Math.max(0.2, 0.7 / (1 + 0.05 * historyCount));
    const delta = learningRate * a * (outcome - P);

    // Keep theta bounded in [-3.0, +3.0]
    return Math.max(-3.0, Math.min(3.0, currentTheta + delta));
  }

  /**
   * Dynamic Question Selector targeting Zone of Proximal Development (ZPD).
   * Targets questions with success probability ~0.70 to 0.75 (Flow state)
   * while prioritizing high Fisher information.
   *
   * @param availableQuestions Candidate questions from current concept or frontier
   * @param studentTheta Current estimated student ability
   * @param targetSuccessRate Ideal challenge probability (default 0.72)
   * @param previouslyAnsweredIds IDs of questions already attempted to prevent immediate repetition
   */
  public static selectOptimalQuestion(
    availableQuestions: Question[],
    studentTheta: number,
    targetSuccessRate: number = 0.72,
    previouslyAnsweredIds: Set<string> = new Set()
  ): { question: Question; predictedSuccess: number; matchScore: number } | null {
    const eligible = availableQuestions.filter((q) => !previouslyAnsweredIds.has(q.id));
    const pool = eligible.length > 0 ? eligible : availableQuestions;

    if (pool.length === 0) return null;

    let bestQuestion = pool[0];
    let bestScore = -Infinity;
    let bestProb = 0.5;

    for (const q of pool) {
      const p = this.calculateProbability(
        studentTheta,
        q.difficulty,
        q.discrimination,
        q.pseudoGuessing ?? 0.0
      );
      const info = this.calculateFisherInformation(studentTheta, q);

      // Score combines proximity to target flow state (0.72) + high diagnostic information
      const distanceToZPD = Math.abs(p - targetSuccessRate);
      const zpdScore = Math.exp(-3 * distanceToZPD); // Higher when close to target rate
      const compositeScore = 0.6 * zpdScore + 0.4 * Math.min(1.0, info);

      if (compositeScore > bestScore) {
        bestScore = compositeScore;
        bestQuestion = q;
        bestProb = p;
      }
    }

    return {
      question: bestQuestion,
      predictedSuccess: bestProb,
      matchScore: bestScore,
    };
  }
}
