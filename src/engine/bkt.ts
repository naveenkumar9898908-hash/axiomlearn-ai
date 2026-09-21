/**
 * Bayesian Knowledge Tracing (BKT) Engine
 * Based on Corbett & Anderson (1995) with Latency-Aware Cognitive Modulation.
 */

export interface BKTParameters {
  pL0: number; // Prior knowledge probability P(L_0)
  pT: number;  // Learning transition probability P(T)
  pG: number;  // Guess probability P(G)
  pS: number;  // Slip probability P(S)
}

export interface BKTUpdateResult {
  pL_prior: number;       // P(L_t) before current interaction
  pL_posterior: number;   // P(L_t | obs)
  pL_next: number;        // P(L_{t+1}) after transition
  pCorrect_predicted: number; // P(C_t)
  isMastered: boolean;
  latencyFactor: number;
}

export class BayesianKnowledgeTracer {
  public static readonly DEFAULT_MASTERY_THRESHOLD = 0.85;

  /**
   * Predict the probability of a correct response given current mastery P(L_t).
   * P(C_t) = P(L_t) * (1 - P(S)) + (1 - P(L_t)) * P(G)
   */
  public static predictCorrectness(pL: number, params: BKTParameters): number {
    const clampedPL = Math.max(0.001, Math.min(0.999, pL));
    return clampedPL * (1 - params.pS) + (1 - clampedPL) * params.pG;
  }

  /**
   * Update mastery state based on student's response.
   *
   * @param currentPL Current mastery probability P(L_t)
   * @param isCorrect Whether the student answered correctly
   * @param params BKT parameters (pL0, pT, pG, pS)
   * @param responseTimeMs Actual response time in milliseconds
   * @param expectedTimeMs Expected response time in milliseconds (default 20,000ms)
   * @returns BKTUpdateResult containing posterior and next-step probabilities
   */
  public static update(
    currentPL: number,
    isCorrect: boolean,
    params: BKTParameters,
    responseTimeMs?: number,
    expectedTimeMs: number = 20000
  ): BKTUpdateResult {
    const pL = Math.max(0.001, Math.min(0.999, currentPL));
    let { pS, pG, pT } = params;

    // Latency-Aware Modulation:
    // If answer is incorrect and response time was unusually rapid (< 4s),
    // increase slip probability P(S) (student likely rushed or misread).
    // If answer is incorrect and response time was very slow, slip is low (genuine knowledge gap).
    let latencyFactor = 1.0;
    if (responseTimeMs !== undefined && responseTimeMs > 0) {
      const ratio = responseTimeMs / expectedTimeMs;
      if (!isCorrect && ratio < 0.25) {
        // Fast wrong -> higher chance of slip / careless mistake
        pS = Math.min(0.35, pS * 1.5);
        latencyFactor = 0.7; // Dampened learning regression
      } else if (!isCorrect && ratio > 1.8) {
        // Slow wrong -> confirmed genuine conceptual struggle
        pS = Math.max(0.05, pS * 0.7);
        latencyFactor = 1.2;
      } else if (isCorrect && ratio < 0.3) {
        // Very fast correct -> high confidence, low guess
        pG = Math.max(0.05, pG * 0.7);
        latencyFactor = 1.1;
      }
    }

    // Corbett & Anderson Bayesian Update Formulas:
    let pL_posterior: number;
    if (isCorrect) {
      const num = pL * (1 - pS);
      const denom = num + (1 - pL) * pG;
      pL_posterior = denom > 0 ? num / denom : pL;
    } else {
      const num = pL * pS;
      const denom = num + (1 - pL) * (1 - pG);
      pL_posterior = denom > 0 ? num / denom : pL;
    }

    // Modulate learning transition P(T) by latency factor if applicable
    const effectivePT = Math.max(0.01, Math.min(0.5, pT * latencyFactor));

    // Transition to next state:
    // P(L_{t+1}) = P(L_t | obs) + (1 - P(L_t | obs)) * P(T)
    const pL_next = pL_posterior + (1 - pL_posterior) * effectivePT;
    const clampedNext = Math.max(0.001, Math.min(0.999, pL_next));

    const pCorrect = this.predictCorrectness(pL, params);

    return {
      pL_prior: pL,
      pL_posterior: Math.max(0.001, Math.min(0.999, pL_posterior)),
      pL_next: clampedNext,
      pCorrect_predicted: pCorrect,
      isMastered: clampedNext >= this.DEFAULT_MASTERY_THRESHOLD,
      latencyFactor,
    };
  }

  /**
   * Simulate a learning sequence of binary responses and return the trajectory of P(L).
   */
  public static simulateTrajectory(
    responses: { isCorrect: boolean; responseTimeMs?: number }[],
    params: BKTParameters
  ): number[] {
    const trajectory: number[] = [params.pL0];
    let currentPL = params.pL0;

    for (const resp of responses) {
      const result = this.update(currentPL, resp.isCorrect, params, resp.responseTimeMs);
      currentPL = result.pL_next;
      trajectory.push(currentPL);
    }

    return trajectory;
  }
}
