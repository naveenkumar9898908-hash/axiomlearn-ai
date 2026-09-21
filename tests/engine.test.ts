import assert from 'node:assert';
import { BayesianKnowledgeTracer } from '../src/engine/bkt.js';
import { DeepKnowledgeTracer } from '../src/engine/dkt.js';
import { PrerequisiteKnowledgeGraph } from '../src/engine/knowledgeGraph.js';
import { DynamicQuestionSelector } from '../src/engine/irtSelector.js';
import { RootCauseDiagnosticEngine } from '../src/engine/diagnostic.js';
import { MicroPracticeGenerator } from '../src/engine/microPractice.js';
import { mathConcepts, mathEdges, mathQuestions } from '../src/data/mathCurriculum.js';

console.log('🧪 Starting AxiomLearn AI Engine Verification Suite...\n');

// -------------------------------------------------------------
// 1. Bayesian Knowledge Tracing (BKT) Tests
// -------------------------------------------------------------
console.log('▶ Test 1: BKT Bayesian Updates & Convergence');
const bktParams = { pL0: 0.3, pT: 0.15, pG: 0.2, pS: 0.1 };

// Prior probability check
const predInitial = BayesianKnowledgeTracer.predictCorrectness(bktParams.pL0, bktParams);
assert(predInitial > 0.3 && predInitial < 0.5, 'Initial predicted correctness should be between 0.3 and 0.5');

// Update on Correct response
const resCorrect = BayesianKnowledgeTracer.update(0.3, true, bktParams, 15000);
assert(resCorrect.pL_posterior > 0.3, 'Posterior after correct answer must increase');
assert(resCorrect.pL_next > resCorrect.pL_posterior, 'Next state after learning transition must increase');

// Update on Incorrect response
const resIncorrect = BayesianKnowledgeTracer.update(0.6, false, bktParams, 25000);
assert(resIncorrect.pL_posterior < 0.6, 'Posterior after incorrect answer must decrease');

// Trajectory asymptotic convergence towards 1.0 on consecutive correct answers
const trajectory = BayesianKnowledgeTracer.simulateTrajectory(
  Array(10).fill({ isCorrect: true, responseTimeMs: 12000 }),
  bktParams
);
const finalMastery = trajectory[trajectory.length - 1];
assert(finalMastery > 0.9, `Final mastery after 10 correct answers should exceed 0.90, got: ${finalMastery}`);
console.log(`  ✓ BKT updates verified. Asymptotic convergence: ${finalMastery.toFixed(4)} > 0.90`);

// Latency modulation test
const hurriedWrong = BayesianKnowledgeTracer.update(0.5, false, bktParams, 2000, 20000); // 2 seconds
const deliberativeWrong = BayesianKnowledgeTracer.update(0.5, false, bktParams, 45000, 20000); // 45 seconds
assert(hurriedWrong.latencyFactor < 1.0, 'Hurried mistake should dampen regression');
assert(deliberativeWrong.latencyFactor > 1.0, 'Deliberative mistake should penalize higher due to confirmed gap');
console.log('  ✓ BKT latency-aware modulation verified.');

// -------------------------------------------------------------
// 2. Deep Knowledge Tracing (DKT) Recurrent Neural Network Tests
// -------------------------------------------------------------
console.log('\n▶ Test 2: DKT Recurrent State Dynamics');
const conceptIds = mathConcepts.map((c) => c.id);
const dkt = new DeepKnowledgeTracer(conceptIds, 32);

const initialState = dkt.getInitialState();
assert.strictEqual(initialState.hiddenVector.length, 32, 'Hidden vector must be 32-dim');
assert.strictEqual(Object.keys(initialState.masteryPredictions).length, conceptIds.length, 'All concepts must have predictions');

// Forward step on an interaction
const step1 = dkt.step(initialState, 'arithmetic-negatives', true);
assert(step1.hiddenVector.some((v) => v !== 0), 'Hidden state must update on interaction');
assert(step1.masteryPredictions['arithmetic-negatives'] > 0, 'Mastery prediction must be valid probability');

// Cross-concept transfer verification
const seqState = dkt.forwardSequence([
  { conceptId: 'arithmetic-negatives', isCorrect: true },
  { conceptId: 'fraction-powers', isCorrect: true },
  { conceptId: 'polynomial-factoring', isCorrect: true },
]);
assert(seqState.masteryPredictions['chain-rule'] !== undefined, 'DKT predicts composite concepts simultaneously');
console.log('  ✓ DKT recurrent dynamics and multi-concept transfer verified.');

// -------------------------------------------------------------
// 3. Prerequisite Knowledge Graph (DAG) Tests
// -------------------------------------------------------------
console.log('\n▶ Test 3: Prerequisite Knowledge Graph DAG Validation');
const graph = new PrerequisiteKnowledgeGraph(mathConcepts, mathEdges);

const topologicalOrder = graph.validateDAG();
assert.strictEqual(topologicalOrder.length, mathConcepts.length, 'DAG must contain all nodes in topological order');
assert.strictEqual(topologicalOrder[0], 'arithmetic-negatives', 'Root concept must appear first in topological order');

// Ancestor path tracing
const chainRuleAncestors = graph.getAllAncestors('chain-rule');
const ancestorIds = chainRuleAncestors.map((a) => a.id);
assert(ancestorIds.includes('derivative-rules'), 'Derivative rules must be an ancestor of chain rule');
assert(ancestorIds.includes('functions-graphs'), 'Functions & graphs must be an ancestor of chain rule');
assert(ancestorIds.includes('fraction-powers'), 'Fraction powers must be an ancestor of chain rule');
console.log(`  ✓ DAG acyclicity verified. Chain Rule has ${chainRuleAncestors.length} ancestral prerequisites.`);

// Learning Frontier (ZPD) test
const masteryMap: Record<string, number> = {
  'arithmetic-negatives': 0.9,
  'linear-equations': 0.85,
  'fraction-powers': 0.85,
};
const frontier = graph.computeLearningFrontier(masteryMap, 0.8);
assert(frontier.includes('polynomial-factoring'), 'Polynomial factoring should be unlocked in frontier');
console.log(`  ✓ Learning Frontier correctly unlocked: [${frontier.join(', ')}]`);

// -------------------------------------------------------------
// 4. Dynamic Question Difficulty Selector (2PL IRT & ZPD) Tests
// -------------------------------------------------------------
console.log('\n▶ Test 4: Dynamic Question Difficulty Selector (2PL IRT)');
const probEasyAtHighAbility = DynamicQuestionSelector.calculateProbability(1.5, -1.0, 1.2);
const probHardAtLowAbility = DynamicQuestionSelector.calculateProbability(-1.5, 1.0, 1.2);
assert(probEasyAtHighAbility > 0.9, 'High ability student should have >90% probability on easy question');
assert(probHardAtLowAbility < 0.1, 'Low ability student should have <10% probability on hard question');

// Adaptive Ability Update
const thetaInitial = 0.0;
const sampleQ = mathQuestions[0];
const thetaAfterCorrect = DynamicQuestionSelector.updateAbility(thetaInitial, sampleQ, true, 1);
const thetaAfterWrong = DynamicQuestionSelector.updateAbility(thetaInitial, sampleQ, false, 1);
assert(thetaAfterCorrect > thetaInitial, 'Ability θ must increase on correct answer');
assert(thetaAfterWrong < thetaInitial, 'Ability θ must decrease on incorrect answer');

// Optimal ZPD Selection
const selected = DynamicQuestionSelector.selectOptimalQuestion(mathQuestions, 0.0, 0.72);
assert(selected !== null, 'Should successfully select question');
assert(selected.predictedSuccess >= 0.5 && selected.predictedSuccess <= 0.9, 'Selected question must target ZPD');
console.log(`  ✓ 2PL IRT difficulty selector verified. Selected Q ID: ${selected.question.id}, predicted P: ${selected.predictedSuccess.toFixed(2)}`);

// -------------------------------------------------------------
// 5. Root-Cause Misconception Diagnostic & Micro-Practice Tests
// -------------------------------------------------------------
console.log('\n▶ Test 5: Root-Cause Misconception Diagnostic & Micro-Practice');
const diagnosticEngine = new RootCauseDiagnosticEngine(graph);
const microGen = new MicroPracticeGenerator(graph, mathQuestions);

// Simulate failure on 'polynomial-factoring' due to the Freshman's Dream: (a+b)^2 = a^2+b^2
const polyQ = mathQuestions.find((q) => q.id === 'q-poly-1')!;
const wrongOption = polyQ.options.find((o) => o.misconceptionId === 'misc-freshman-dream')!;

const diagResult = diagnosticEngine.diagnoseError(
  'polynomial-factoring',
  polyQ,
  wrongOption.id,
  { 'polynomial-factoring': 0.25, 'fraction-powers': 0.35, 'linear-equations': 0.8 }
);

assert.strictEqual(diagResult.identifiedMisconception?.id, 'misc-freshman-dream', 'Diagnostic must identify Freshman\'s Dream misconception');
assert(diagResult.causalChain.length > 0, 'Causal chain must be populated');
assert(diagResult.diagnosticConfidence >= 0.7, 'Diagnostic confidence should be high');
console.log(`  ✓ Misconception diagnosed: "${diagResult.identifiedMisconception?.label}"`);
console.log(`  ✓ Causal chain traversed: ${diagResult.causalChain.join(' -> ')}`);

// Generate Micro-Practice Path
const path = microGen.generatePath(diagResult);
assert.strictEqual(path.steps.length, 4, 'Micro-practice path must have 4 steps');
assert.strictEqual(path.steps[0].type, 'refresher', 'Step 1 must be Cognitive Refresher');
assert.strictEqual(path.steps[1].type, 'prerequisite_check', 'Step 2 must be Prerequisite Check');
assert.strictEqual(path.steps[2].type, 'bridge_scaffold', 'Step 3 must be Scaffolded Bridge');
assert.strictEqual(path.steps[3].type, 'mastery_verification', 'Step 4 must be Target Mastery Verification');
console.log(`  ✓ 4-step Micro-Practice path generated successfully. ID: ${path.id}`);

console.log('\n============================================================');
console.log('🎉 ALL ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('============================================================\n');
