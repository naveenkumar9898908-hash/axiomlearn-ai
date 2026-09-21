export type MasteryState = 'unmastered' | 'learning' | 'mastered' | 'at_risk';

export interface PrerequisiteEdge {
  from: string; // Prerequisite concept ID
  to: string;   // Target concept ID
  weight: number; // 0.0 to 1.0 dependency strength
  rationale?: string;
}

export interface Misconception {
  id: string;
  label: string;
  description: string;
  remedialAdvice: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  misconceptionId?: string; // If student selects this distractor, which misconception does it indicate?
  explanation: string;
}

export interface Question {
  id: string;
  conceptId: string;
  prompt: string;
  codeSnippet?: string;
  difficulty: number; // b parameter in IRT: [-2.5, +2.5], 0 is average
  discrimination: number; // a parameter in IRT: [0.5, 2.5]
  pseudoGuessing?: number; // c parameter in IRT (default ~0.2 for 4 options)
  bloomsLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
  options: QuestionOption[];
  hint: string;
  fullSolution: string;
}

export interface ConceptNode {
  id: string;
  title: string;
  domain: 'mathematics' | 'computer_science';
  depth: number; // 0: foundational root, 1: intermediate, 2: advanced...
  description: string;
  learningObjectives: string[];
  prerequisites: string[]; // IDs of prerequisite concepts
  misconceptions: Misconception[];
  bktParams: {
    pL0: number; // Prior mastery probability
    pT: number;  // Transition probability (learning rate)
    pG: number;  // Guess probability
    pS: number;  // Slip probability
  };
  remedialRefresher: {
    coreConcept: string;
    keyIntuition: string;
    commonPitfall: string;
    mnemonicOrRule: string;
  };
}

export interface InteractionRecord {
  id: string;
  timestamp: number;
  conceptId: string;
  questionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  selectedOptionId: string;
  detectedMisconceptionId?: string;
  estimatedAbilityBefore: number;
  estimatedAbilityAfter: number;
  bktMasteryBefore: number;
  bktMasteryAfter: number;
  dktMasteryAfter?: number;
}

export interface DiagnosticResult {
  failedConceptId: string;
  questionId: string;
  selectedOptionId: string;
  identifiedMisconception?: Misconception;
  rootCauseConceptId: string;
  rootCauseConceptTitle: string;
  causalChain: string[]; // e.g. ["algebraic-powers", "polynomial-factorization", "chain-rule"]
  diagnosticConfidence: number; // 0 to 1
  explanation: string;
}

export interface MicroPracticeStep {
  stepNumber: number;
  type: 'refresher' | 'prerequisite_check' | 'bridge_scaffold' | 'mastery_verification';
  title: string;
  conceptId: string;
  content?: {
    summary: string;
    keyTakeaway: string;
    warningNote: string;
  };
  question?: Question;
  completed?: boolean;
  userAnswer?: string;
  wasCorrect?: boolean;
}

export interface MicroPracticePath {
  id: string;
  createdAt: number;
  triggerMisconceptionId?: string;
  targetConceptId: string;
  rootCauseConceptId: string;
  steps: MicroPracticeStep[];
  currentStepIndex: number;
  isFinished: boolean;
  masteryGainEstimate: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  unlockedAt?: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  theta: number; // Latent ability parameter in IRT [-3.0 to +3.0]
  conceptMastery: Record<string, number>; // conceptId -> P(L) in [0, 1]
  dktHiddenState?: number[]; // Recurrent model state vector
  interactionHistory: InteractionRecord[];
  activeMicroPath?: MicroPracticePath | null;
  resolvedMisconceptions: string[];
  xp: number;
  level: number;
  streak: number;
  highestStreak: number;
  earnedBadges: Badge[];
}

export interface UserAccount {
  username: string;
  password: string; // unique password
  name: string;
  role: 'student' | 'instructor';
  personaLabel: string;
  profile: StudentProfile;
}

export type ThemeMode = 'cyber_hud' | 'quantum_neon' | 'stealth_dark';
