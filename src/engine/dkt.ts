/**
 * Deep Knowledge Tracing (DKT) Recurrent Model
 * Based on Piech et al. (2015), Stanford University.
 * Implements a Recurrent Cognitive State Network with GRU dynamics
 * predicting cross-concept mastery transfer vectors simultaneously.
 */

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, x))));
}

function tanh(x: number): number {
  return Math.tanh(Math.max(-15, Math.min(15, x)));
}

export interface DKTState {
  hiddenVector: number[]; // h_t
  masteryPredictions: Record<string, number>; // conceptId -> P(C) in [0, 1]
}

export class DeepKnowledgeTracer {
  private readonly numConcepts: number;
  private readonly hiddenDim: number;
  private readonly inputDim: number; // 2 * numConcepts (concept + correctness)
  private readonly conceptList: string[];
  private readonly conceptToIndex: Map<string, number>;

  // Model Weights:
  // GRU Gates: Reset Gate (r), Update Gate (z), Candidate Hidden (n)
  private W_z: number[][]; // [hiddenDim x inputDim]
  private U_z: number[][]; // [hiddenDim x hiddenDim]
  private b_z: number[];

  private W_r: number[][];
  private U_r: number[][];
  private b_r: number[];

  private W_h: number[][];
  private U_h: number[][];
  private b_h: number[];

  // Output Projection
  private W_out: number[][]; // [numConcepts x hiddenDim]
  private b_out: number[];

  constructor(conceptList: string[], hiddenDim: number = 32) {
    this.conceptList = conceptList;
    this.numConcepts = conceptList.length;
    this.hiddenDim = hiddenDim;
    this.inputDim = 2 * this.numConcepts;

    this.conceptToIndex = new Map();
    this.conceptList.forEach((id, idx) => {
      this.conceptToIndex.set(id, idx);
    });

    // Deterministic pseudo-random initialization (Xavier / He)
    let seed = 42;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const initMatrix = (rows: number, cols: number, scale: number) => {
      return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (rng() * 2 - 1) * scale)
      );
    };
    const initVector = (dim: number, val: number = 0) => Array(dim).fill(val);

    const inScale = Math.sqrt(2 / (this.inputDim + this.hiddenDim));
    const hidScale = Math.sqrt(2 / (2 * this.hiddenDim));
    const outScale = Math.sqrt(2 / (this.hiddenDim + this.numConcepts));

    this.W_z = initMatrix(this.hiddenDim, this.inputDim, inScale);
    this.U_z = initMatrix(this.hiddenDim, this.hiddenDim, hidScale);
    this.b_z = initVector(this.hiddenDim, 0);

    this.W_r = initMatrix(this.hiddenDim, this.inputDim, inScale);
    this.U_r = initMatrix(this.hiddenDim, this.hiddenDim, hidScale);
    this.b_r = initVector(this.hiddenDim, 0);

    this.W_h = initMatrix(this.hiddenDim, this.inputDim, inScale);
    this.U_h = initMatrix(this.hiddenDim, this.hiddenDim, hidScale);
    this.b_h = initVector(this.hiddenDim, 0);

    this.W_out = initMatrix(this.numConcepts, this.hiddenDim, outScale);
    this.b_out = initVector(this.numConcepts, -0.5); // Slight unmastered bias
  }

  /**
   * Initializes initial zero hidden state.
   */
  public getInitialState(): DKTState {
    const hiddenVector = Array(this.hiddenDim).fill(0);
    const masteryPredictions: Record<string, number> = {};
    for (let i = 0; i < this.numConcepts; i++) {
      masteryPredictions[this.conceptList[i]] = sigmoid(this.b_out[i]);
    }
    return { hiddenVector, masteryPredictions };
  }

  /**
   * Step the GRU cell forward with an interaction (conceptId, isCorrect).
   *
   * @param prevState Previous hidden state
   * @param conceptId Concept ID of the attempted question
   * @param isCorrect Whether the answer was correct
   * @returns Updated DKTState with new hidden vector and mastery vector
   */
  public step(
    prevState: DKTState,
    conceptId: string,
    isCorrect: boolean
  ): DKTState {
    const conceptIdx = this.conceptToIndex.get(conceptId) ?? 0;
    // Interaction encoding: index = conceptIdx if incorrect, conceptIdx + numConcepts if correct
    const activeInputIndex = isCorrect ? conceptIdx + this.numConcepts : conceptIdx;

    const h_prev = prevState.hiddenVector;
    const h_next: number[] = new Array(this.hiddenDim);

    // GRU Gate computations:
    // z_t = sigmoid(W_z * x_t + U_z * h_{t-1} + b_z)
    // r_t = sigmoid(W_r * x_t + U_r * h_{t-1} + b_r)
    // \tilde{h}_t = tanh(W_h * x_t + U_h * (r_t \odot h_{t-1}) + b_h)
    // h_t = (1 - z_t) \odot h_{t-1} + z_t \odot \tilde{h}_t

    for (let i = 0; i < this.hiddenDim; i++) {
      let u_z_dot = 0;
      let u_r_dot = 0;
      for (let j = 0; j < this.hiddenDim; j++) {
        u_z_dot += this.U_z[i][j] * h_prev[j];
        u_r_dot += this.U_r[i][j] * h_prev[j];
      }
      const z = sigmoid(this.W_z[i][activeInputIndex] + u_z_dot + this.b_z[i]);
      const r = sigmoid(this.W_r[i][activeInputIndex] + u_r_dot + this.b_r[i]);

      let u_h_dot = 0;
      for (let j = 0; j < this.hiddenDim; j++) {
        u_h_dot += this.U_h[i][j] * (r * h_prev[j]);
      }
      const h_tilde = tanh(this.W_h[i][activeInputIndex] + u_h_dot + this.b_h[i]);

      h_next[i] = (1 - z) * h_prev[i] + z * h_tilde;
    }

    // Output projection: y_k = sigmoid(W_out_k * h_t + b_out_k)
    const masteryPredictions: Record<string, number> = {};
    for (let k = 0; k < this.numConcepts; k++) {
      let dot = 0;
      for (let i = 0; i < this.hiddenDim; i++) {
        dot += this.W_out[k][i] * h_next[i];
      }
      masteryPredictions[this.conceptList[k]] = sigmoid(dot + this.b_out[k]);
    }

    return {
      hiddenVector: h_next,
      masteryPredictions,
    };
  }

  /**
   * Process a batch / sequence of interactions.
   */
  public forwardSequence(
    interactions: { conceptId: string; isCorrect: boolean }[]
  ): DKTState {
    let state = this.getInitialState();
    for (const inter of interactions) {
      state = this.step(state, inter.conceptId, inter.isCorrect);
    }
    return state;
  }
}
