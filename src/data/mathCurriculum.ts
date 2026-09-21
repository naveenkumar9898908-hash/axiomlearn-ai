import { ConceptNode, PrerequisiteEdge, Question } from '../types';

export const mathConcepts: ConceptNode[] = [
  {
    id: 'arithmetic-negatives',
    title: 'Signed Numbers & Negatives',
    domain: 'mathematics',
    depth: 0,
    description: 'Fundamental rules of positive and negative numbers, additive inverses, and double negatives.',
    learningObjectives: [
      'Understand subtraction as addition of opposite',
      'Apply sign rules when multiplying and dividing',
      'Avoid sign errors in compound expressions',
    ],
    prerequisites: [],
    bktParams: { pL0: 0.75, pT: 0.25, pG: 0.2, pS: 0.08 },
    misconceptions: [
      {
        id: 'misc-double-negative',
        label: 'Subtracting a negative becomes negative',
        description: 'Believing that a - (-b) equals a - b instead of a + b.',
        remedialAdvice: 'Remember: subtracting a negative is removing a debt, which increases your total (a - (-b) = a + b).'
      },
      {
        id: 'misc-order-sign',
        label: 'Confusing (-x)^2 with -x^2',
        description: 'Evaluating -3^2 as +9 instead of -9 because of order of operations with exponents.',
        remedialAdvice: '-x^2 means -(x^2). Exponentiation takes precedence over unary negation unless enclosed in parentheses like (-x)^2.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Sign propagation and precedence',
      keyIntuition: 'Parentheses group terms. Two negatives facing each other without an intervening number cancel into a positive.',
      commonPitfall: 'Treating -4^2 as (-4)^2 = 16. In standard algebra, -4^2 = -16.',
      mnemonicOrRule: 'PEMDAS: Parentheses first, then Exponents, then Multiplication/Negation.'
    }
  },
  {
    id: 'fraction-powers',
    title: 'Fractions & Exponent Laws',
    domain: 'mathematics',
    depth: 1,
    description: 'Manipulating fractions, fractional exponents (radicals), negative powers, and quotient exponent rules.',
    learningObjectives: [
      'Convert radical forms to rational exponents: sqrt[n]{x^m} = x^{m/n}',
      'Simplify negative exponents: x^{-k} = 1 / x^k',
      'Combine fractions with unlike denominators',
    ],
    prerequisites: ['arithmetic-negatives'],
    bktParams: { pL0: 0.6, pT: 0.2, pG: 0.18, pS: 0.12 },
    misconceptions: [
      {
        id: 'misc-negative-exp-value',
        label: 'Negative exponent makes the whole term negative',
        description: 'Assuming x^{-2} equals -x^2 or -2x instead of 1/x^2.',
        remedialAdvice: 'Negative exponents denote reciprocity (inversion), never sign negation! x^{-n} = 1 / x^n.'
      },
      {
        id: 'misc-fractional-exp-flip',
        label: 'Inverting root and power in rational exponents',
        description: 'Interpreting x^{3/2} as the cube root of x squared instead of square root of x cubed.',
        remedialAdvice: 'The denominator is always the ROOT index (in the ground like plant roots), numerator is the power: x^{power / root}.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Reciprocal and Radical Exponent Laws',
      keyIntuition: 'An exponent describes repeated multiplication. A negative exponent describes repeated division (moving across fraction bar).',
      commonPitfall: 'Confusing 2^{-3} with -8 or -6. It is 1 / 2^3 = 1/8.',
      mnemonicOrRule: 'Power over Root: x^{p/r} = r-th root of x^p. Negative sends it downstairs: x^{-n} = 1 / x^n.'
    }
  },
  {
    id: 'linear-equations',
    title: 'Linear Equations & Transformations',
    domain: 'mathematics',
    depth: 1,
    description: 'Balancing algebraic equations, isolating variables across equality, and distributive property.',
    learningObjectives: [
      'Apply distributive property correctly over signed binomials',
      'Isolate unknown variables systematically',
      'Recognize inconsistent and identity equations',
    ],
    prerequisites: ['arithmetic-negatives'],
    bktParams: { pL0: 0.65, pT: 0.22, pG: 0.2, pS: 0.1 },
    misconceptions: [
      {
        id: 'misc-distributive-sign',
        label: 'Distributing negative over only the first term',
        description: 'Expanding -(3x - 5) as -3x - 5 instead of -3x + 5.',
        remedialAdvice: 'A negative outside parentheses must multiply every single term inside: -(a - b) = -a + b.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Symmetric Equation Invariance',
      keyIntuition: 'An equation is a balanced scale. Whatever operation you apply to one side, you must apply identically to the other side.',
      commonPitfall: 'Failing to distribute negative signs across every term in parentheses.',
      mnemonicOrRule: 'Distribute before you combine: -1 * (a - b) = -a + b.'
    }
  },
  {
    id: 'polynomial-factoring',
    title: 'Polynomials & Binomial Factoring',
    domain: 'mathematics',
    depth: 2,
    description: 'Factoring quadratic expressions, difference of squares, and expanding binomials.',
    learningObjectives: [
      'Expand binomials using FOIL or distributive law',
      'Factor quadratic trinomials into linear factors',
      'Recognize special products: difference of squares',
    ],
    prerequisites: ['linear-equations', 'fraction-powers'],
    bktParams: { pL0: 0.45, pT: 0.18, pG: 0.15, pS: 0.12 },
    misconceptions: [
      {
        id: 'misc-freshman-dream',
        label: "The Freshman's Dream: (a + b)^2 = a^2 + b^2",
        description: 'Distributing power over addition without the middle cross-product 2ab.',
        remedialAdvice: '(a + b)^2 = (a + b)(a + b) = a^2 + 2ab + b^2. The middle term 2ab cannot be omitted!'
      },
      {
        id: 'misc-factoring-signs',
        label: 'Sign error in quadratic factoring with negative constant',
        description: 'Factoring x^2 - x - 6 as (x + 3)(x - 2) instead of (x - 3)(x + 2).',
        remedialAdvice: 'Verify by expanding: the sum of the roots must equal the linear coefficient (-1).'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Binomial Expansion and Factorization',
      keyIntuition: 'Geometric area model: a square of side (a + b) decomposes into four regions: a^2, ab, ab, and b^2.',
      commonPitfall: 'Writing (a + b)^2 = a^2 + b^2. You must never forget the middle 2ab term!',
      mnemonicOrRule: 'FOIL: First, Outer, Inner, Last. Check by re-multiplying.'
    }
  },
  {
    id: 'functions-graphs',
    title: 'Functions & Composite Functions',
    domain: 'mathematics',
    depth: 2,
    description: 'Function mapping notation, domain and range, evaluating compositions f(g(x)), and inverse functions.',
    learningObjectives: [
      'Evaluate composite functions f(g(x)) from inside-out',
      'Identify domain restrictions (radicands >= 0, denominators != 0)',
      'Interpret slope and rate of change graphically',
    ],
    prerequisites: ['linear-equations'],
    bktParams: { pL0: 0.5, pT: 0.2, pG: 0.16, pS: 0.1 },
    misconceptions: [
      {
        id: 'misc-composition-multiplication',
        label: 'Treating f(g(x)) as f(x) * g(x)',
        description: 'Multiplying two functions together instead of substituting g(x) as the input variable of f.',
        remedialAdvice: 'Composite function f(g(x)) means evaluating f where the variable x is replaced entirely by the expression g(x).'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Function as an Input-Output Machine',
      keyIntuition: 'In f(g(x)), g computes an output first, and that result becomes the food (input) fed into f.',
      commonPitfall: 'Multiplying f and g together rather than substituting inside.',
      mnemonicOrRule: 'Inside-Out Rule: Calculate inner function g(x) first, substitute into outer f.'
    }
  },
  {
    id: 'limits-continuity',
    title: 'Limits & Continuity',
    domain: 'mathematics',
    depth: 3,
    description: 'Concept of approaching a point, algebraic limit techniques, indeterminate forms 0/0, and continuity criteria.',
    learningObjectives: [
      'Evaluate limits algebraically using factoring and rationalization',
      'Resolve 0/0 indeterminate forms',
      'Determine one-sided limits and continuity',
    ],
    prerequisites: ['functions-graphs', 'polynomial-factoring'],
    bktParams: { pL0: 0.35, pT: 0.16, pG: 0.15, pS: 0.14 },
    misconceptions: [
      {
        id: 'misc-indeterminate-zero',
        label: 'Assuming 0/0 equals 0, 1, or undefined without simplifying',
        description: 'Concluding limit is 0 or does not exist immediately upon seeing 0/0 indeterminate form.',
        remedialAdvice: '0/0 is indeterminate! It means there is a removable hole that can be canceled by factoring numerator and denominator.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Limits as Local Behavior near a Hole',
      keyIntuition: 'A limit asks what height a function approaches as x gets arbitrarily close to a value, even if the point is missing.',
      commonPitfall: 'Stopping at 0/0. You must factor and cancel common terms first.',
      mnemonicOrRule: 'Indeterminate 0/0 means: Factor, Cancel, and Re-evaluate!'
    }
  },
  {
    id: 'derivative-rules',
    title: 'Derivatives & Power Rule',
    domain: 'mathematics',
    depth: 4,
    description: 'Instantaneous rate of change, limit definition of derivative, power rule d/dx(x^n) = n*x^{n-1}, and sum/difference rules.',
    learningObjectives: [
      'Apply power rule to positive, negative, and fractional exponents',
      'Differentiate sums and constant multiples',
      'Convert radical and reciprocal functions into power forms before differentiating',
    ],
    prerequisites: ['limits-continuity', 'fraction-powers'],
    bktParams: { pL0: 0.3, pT: 0.18, pG: 0.14, pS: 0.12 },
    misconceptions: [
      {
        id: 'misc-power-rule-subtraction',
        label: 'Adding instead of subtracting 1 in power rule for negative/fraction powers',
        description: 'Differentiating x^{-3} as -3x^{-2} instead of -3x^{-4}.',
        remedialAdvice: 'Power rule subtracts 1: n - 1. For negative numbers: -3 - 1 = -4. For fractions: 1/2 - 1 = -1/2.'
      },
      {
        id: 'misc-constant-derivative',
        label: 'Treating derivative of constant as constant itself',
        description: 'Differentiating f(x) = 5 as 5 instead of 0.',
        remedialAdvice: 'A constant does not change (slope is flat zero). The derivative of any standalone constant is 0.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'The Power Rule for Differentiation',
      keyIntuition: 'Bring the current exponent down front as a multiplier, then drop the exponent power by exactly 1.',
      commonPitfall: 'Calculating -3 - 1 as -2 instead of -4 when working with negative exponents.',
      mnemonicOrRule: 'Multiply by power, subtract 1: d/dx(x^n) = n * x^{n-1}.'
    }
  },
  {
    id: 'chain-rule',
    title: 'Chain Rule for Composite Functions',
    domain: 'mathematics',
    depth: 5,
    description: 'Differentiating composite functions: d/dx[f(g(x))] = f\'(g(x)) * g\'(x), peeling inner layers.',
    learningObjectives: [
      'Identify outer and inner functions correctly',
      'Multiply by the derivative of the inner function (g\'(x))',
      'Apply chain rule repeatedly for multi-layered functions',
    ],
    prerequisites: ['derivative-rules', 'functions-graphs'],
    bktParams: { pL0: 0.2, pT: 0.15, pG: 0.12, pS: 0.15 },
    misconceptions: [
      {
        id: 'misc-forgot-inner-derivative',
        label: 'Forgetting to multiply by derivative of inside function',
        description: 'Differentiating (3x + 1)^4 as 4(3x + 1)^3 and neglecting the * 3 factor.',
        remedialAdvice: 'Chain rule demands: derivative of outside (keeping inside intact) TIMES the derivative of inside! Don\'t leave inner rate behind.'
      },
      {
        id: 'misc-differentiating-inside-prematurely',
        label: 'Differentiating both inside and outside simultaneously',
        description: 'Differentiating (3x + 1)^4 as 4(3)^3.',
        remedialAdvice: 'Leave the inside unchanged while taking the derivative of the outside: f\'(g(x)) * g\'(x).'
      }
    ],
    remedialRefresher: {
      coreConcept: 'The Chain Rule: Peeling the Onion',
      keyIntuition: 'If car speed changes twice as fast as bike, and bike changes 3 times as fast as walking, car changes 2 * 3 = 6 times as fast as walking.',
      commonPitfall: 'Forgetting the multiplier g\'(x) from the inner layer.',
      mnemonicOrRule: 'Outside prime of inside, times inside prime: d/dx [f(g(x))] = f\'(g(x)) * g\'(x).'
    }
  },
  {
    id: 'curve-optimization',
    title: 'Curve Optimization & Extrema',
    domain: 'mathematics',
    depth: 6,
    description: 'Finding critical points where f\'(x) = 0 or undefined, first and second derivative tests, and applied extrema.',
    learningObjectives: [
      'Find critical points by setting derivative to zero',
      'Classify local maxima and minima using test intervals',
      'Optimize real-world objective functions under constraints',
    ],
    prerequisites: ['chain-rule'],
    bktParams: { pL0: 0.15, pT: 0.14, pG: 0.1, pS: 0.14 },
    misconceptions: [
      {
        id: 'misc-critical-point-guarantee',
        label: 'Assuming f\'(x) = 0 always guarantees a local max or min',
        description: 'Classifying x = 0 in f(x) = x^3 as an extremum rather than an inflection saddle point.',
        remedialAdvice: 'f\'(x) = 0 is a candidate. You MUST test sign changes (First Derivative Test) to prove an extremum exists.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Extrema as Zero Slope Transition Points',
      keyIntuition: 'At the peak of a mountain or bottom of a valley, the slope momentarily becomes zero before reversing direction.',
      commonPitfall: 'Assuming every zero derivative is an extremum without checking sign change.',
      mnemonicOrRule: 'Set f\'(x) = 0 to find critical numbers, then verify sign change of f\'(x).'
    }
  }
];

export const mathEdges: PrerequisiteEdge[] = [
  { from: 'arithmetic-negatives', to: 'fraction-powers', weight: 0.9, rationale: 'Negative signs are vital for negative exponent rules.' },
  { from: 'arithmetic-negatives', to: 'linear-equations', weight: 0.85, rationale: 'Balancing equations requires signed arithmetic operations.' },
  { from: 'linear-equations', to: 'polynomial-factoring', weight: 0.8, rationale: 'Distributive property underlies binomial expansion.' },
  { from: 'fraction-powers', to: 'polynomial-factoring', weight: 0.75, rationale: 'Degree manipulation and radical coefficients.' },
  { from: 'linear-equations', to: 'functions-graphs', weight: 0.85, rationale: 'Slope and variable relations map to functions.' },
  { from: 'functions-graphs', to: 'limits-continuity', weight: 0.9, rationale: 'Limits analyze behavior of functions at values.' },
  { from: 'polynomial-factoring', to: 'limits-continuity', weight: 0.85, rationale: 'Factoring cancels 0/0 removable discontinuities.' },
  { from: 'limits-continuity', to: 'derivative-rules', weight: 0.95, rationale: 'Derivative is defined as the limit of difference quotient.' },
  { from: 'fraction-powers', to: 'derivative-rules', weight: 0.85, rationale: 'Radicals must be written as fractional powers to use power rule.' },
  { from: 'derivative-rules', to: 'chain-rule', weight: 0.95, rationale: 'Power and product derivatives are components of chain rule.' },
  { from: 'functions-graphs', to: 'chain-rule', weight: 0.9, rationale: 'Composite functions f(g(x)) are the core subject of chain rule.' },
  { from: 'chain-rule', to: 'curve-optimization', weight: 0.85, rationale: 'Differentiating real-world composite models to find stationary points.' }
];

export const mathQuestions: Question[] = [
  // --- arithmetic-negatives questions ---
  {
    id: 'q-neg-1',
    conceptId: 'arithmetic-negatives',
    prompt: 'Evaluate the expression: -(-7) + (-12)',
    difficulty: -1.8,
    discrimination: 1.1,
    bloomsLevel: 'Remember',
    hint: 'A double negative -(-a) equals +a.',
    fullSolution: '-(-7) = 7. Then 7 + (-12) = 7 - 12 = -5.',
    options: [
      { id: 'opt-neg-1b', text: '-19', isCorrect: false, misconceptionId: 'misc-double-negative', explanation: 'Treated -(-7) as negative: -7 + (-12) = -19.' },
      { id: 'opt-neg-1c', text: '5', isCorrect: false, explanation: 'Incorrect sign arithmetic.' },
      { id: 'opt-neg-1a', text: '-5', isCorrect: true, explanation: 'Correct! -(-7) is 7, and 7 - 12 = -5.' },
      { id: 'opt-neg-1d', text: '19', isCorrect: false, explanation: 'Ignored both negative signs.' }
    ]
  },
  {
    id: 'q-neg-2',
    conceptId: 'arithmetic-negatives',
    prompt: 'Evaluate: -4^2 + (-2)^3',
    difficulty: -0.9,
    discrimination: 1.4,
    bloomsLevel: 'Understand',
    hint: 'Remember: -4^2 means -(4^2), whereas (-2)^3 means (-2)*(-2)*(-2).',
    fullSolution: '-4^2 = -16. (-2)^3 = -8. -16 + (-8) = -24.',
    options: [
      { id: 'opt-neg-2b', text: '8', isCorrect: false, misconceptionId: 'misc-order-sign', explanation: 'Assumed -4^2 = +16, so 16 - 8 = 8.' },
      { id: 'opt-neg-2a', text: '-24', isCorrect: true, explanation: 'Correct: -16 + (-8) = -24.' },
      { id: 'opt-neg-2c', text: '-8', isCorrect: false, explanation: 'Arithmetic calculation error.' },
      { id: 'opt-neg-2d', text: '24', isCorrect: false, explanation: 'All negatives incorrectly negated.' }
    ]
  },

  // --- fraction-powers questions ---
  {
    id: 'q-frac-1',
    conceptId: 'fraction-powers',
    prompt: 'Simplify the expression: 4^{-3/2}',
    difficulty: -0.4,
    discrimination: 1.5,
    bloomsLevel: 'Apply',
    hint: 'Separate the negative exponent and the rational exponent: (4^{1/2})^{-3}.',
    fullSolution: '4^{1/2} = sqrt(4) = 2. Then 2^{-3} = 1 / 2^3 = 1/8.',
    options: [
      { id: 'opt-frac-1b', text: '-8', isCorrect: false, misconceptionId: 'misc-negative-exp-value', explanation: 'Assumed the negative exponent produces a negative result: -8.' },
      { id: 'opt-frac-1c', text: '-1/8', isCorrect: false, misconceptionId: 'misc-negative-exp-value', explanation: 'Combined negative sign and reciprocal incorrectly.' },
      { id: 'opt-frac-1d', text: '8', isCorrect: false, explanation: 'Ignored the negative exponent.' },
      { id: 'opt-frac-1a', text: '1/8', isCorrect: true, explanation: 'Correct! 4^{-3/2} = 1 / (sqrt(4)^3) = 1/8.' }
    ]
  },
  {
    id: 'q-frac-2',
    conceptId: 'fraction-powers',
    prompt: 'Express sqrt[3]{x^5} in rational exponent notation.',
    difficulty: -1.2,
    discrimination: 1.2,
    bloomsLevel: 'Remember',
    hint: 'Root index is in the denominator; power is in the numerator.',
    fullSolution: 'sqrt[n]{x^m} = x^{m/n}. Here root is 3 and power is 5, so x^{5/3}.',
    options: [
      { id: 'opt-frac-2a', text: 'x^{5/3}', isCorrect: true, explanation: 'Correct! Power 5 divided by root 3.' },
      { id: 'opt-frac-2b', text: 'x^{3/5}', isCorrect: false, misconceptionId: 'misc-fractional-exp-flip', explanation: 'Inverted the root and power (placed root in numerator).' },
      { id: 'opt-frac-2c', text: 'x^{15}', isCorrect: false, explanation: 'Multiplied power and root.' },
      { id: 'opt-frac-2d', text: 'x^{-5/3}', isCorrect: false, explanation: 'Injected unnecessary negative sign.' }
    ]
  },

  // --- polynomial-factoring questions ---
  {
    id: 'q-poly-1',
    conceptId: 'polynomial-factoring',
    prompt: 'Expand and simplify: (2x - 3)^2',
    difficulty: -0.2,
    discrimination: 1.3,
    bloomsLevel: 'Apply',
    hint: '(a - b)^2 = a^2 - 2ab + b^2.',
    fullSolution: '(2x)^2 - 2*(2x)*3 + 3^2 = 4x^2 - 12x + 9.',
    options: [
      { id: 'opt-poly-1b', text: '4x^2 + 9', isCorrect: false, misconceptionId: 'misc-freshman-dream', explanation: 'Freshman\'s dream: dropped middle term -12x.' },
      { id: 'opt-poly-1a', text: '4x^2 - 12x + 9', isCorrect: true, explanation: 'Correct! Applied full FOIL binomial expansion.' },
      { id: 'opt-poly-1c', text: '4x^2 - 9', isCorrect: false, misconceptionId: 'misc-freshman-dream', explanation: 'Treated (a - b)^2 as a difference of squares a^2 - b^2.' },
      { id: 'opt-poly-1d', text: '4x^2 - 6x + 9', isCorrect: false, explanation: 'Forgot factor of 2 in middle term.' }
    ]
  },
  {
    id: 'q-poly-2',
    conceptId: 'polynomial-factoring',
    prompt: 'Factor the quadratic trinomial: x^2 - 5x - 14',
    difficulty: 0.1,
    discrimination: 1.2,
    bloomsLevel: 'Apply',
    hint: 'Find two numbers that multiply to -14 and add to -5.',
    fullSolution: '-7 and +2 multiply to -14 and add to -5. So (x - 7)(x + 2).',
    options: [
      { id: 'opt-poly-2b', text: '(x + 7)(x - 2)', isCorrect: false, misconceptionId: 'misc-factoring-signs', explanation: 'Reversed signs: would expand to x^2 + 5x - 14.' },
      { id: 'opt-poly-2c', text: '(x - 14)(x + 1)', isCorrect: false, explanation: 'Incorrect factor pair.' },
      { id: 'opt-poly-2d', text: '(x - 7)(x - 2)', isCorrect: false, explanation: 'Two negatives would give +14.' },
      { id: 'opt-poly-2a', text: '(x - 7)(x + 2)', isCorrect: true, explanation: 'Correct! -7 + 2 = -5 and -7 * 2 = -14.' }
    ]
  },

  // --- functions-graphs questions ---
  {
    id: 'q-func-1',
    conceptId: 'functions-graphs',
    prompt: 'If f(x) = x^2 + 3 and g(x) = 2x - 1, find the composite function f(g(x)).',
    difficulty: 0.3,
    discrimination: 1.4,
    bloomsLevel: 'Apply',
    hint: 'Replace every instance of x in f(x) with the entire expression (2x - 1).',
    fullSolution: 'f(g(x)) = (2x - 1)^2 + 3 = 4x^2 - 4x + 1 + 3 = 4x^2 - 4x + 4.',
    options: [
      { id: 'opt-func-1b', text: '2x^3 - x^2 + 6x - 3', isCorrect: false, misconceptionId: 'misc-composition-multiplication', explanation: 'Multiplied f(x) * g(x) instead of evaluating composition f(g(x)).' },
      { id: 'opt-func-1c', text: '4x^2 + 4', isCorrect: false, misconceptionId: 'misc-freshman-dream', explanation: 'Expanded (2x - 1)^2 as 4x^2 + 1, dropping -4x.' },
      { id: 'opt-func-1a', text: '4x^2 - 4x + 4', isCorrect: true, explanation: 'Correct! Substituted g(x) into f and expanded properly.' },
      { id: 'opt-func-1d', text: '2x^2 + 5', isCorrect: false, explanation: 'Evaluated g(f(x)) incorrectly.' }
    ]
  },

  // --- limits-continuity questions ---
  {
    id: 'q-lim-1',
    conceptId: 'limits-continuity',
    prompt: 'Evaluate: lim_{x -> 3} (x^2 - 9) / (x - 3)',
    difficulty: 0.2,
    discrimination: 1.5,
    bloomsLevel: 'Analyze',
    hint: 'Direct substitution yields 0/0. Factor the numerator as a difference of squares.',
    fullSolution: '(x^2 - 9) = (x - 3)(x + 3). Cancel (x - 3) to get lim_{x -> 3} (x + 3) = 6.',
    options: [
      { id: 'opt-lim-1a', text: '6', isCorrect: true, explanation: 'Correct! Factored (x - 3)(x + 3)/(x - 3) = x + 3 -> 6.' },
      { id: 'opt-lim-1b', text: 'Does not exist (undefined)', isCorrect: false, misconceptionId: 'misc-indeterminate-zero', explanation: 'Saw 0/0 and incorrectly concluded limit does not exist without simplifying.' },
      { id: 'opt-lim-1c', text: '0', isCorrect: false, misconceptionId: 'misc-indeterminate-zero', explanation: 'Assumed numerator 0 dominates indeterminate form.' },
      { id: 'opt-lim-1d', text: '3', isCorrect: false, explanation: 'Plugged in 3 without factoring properly.' }
    ]
  },

  // --- derivative-rules questions ---
  {
    id: 'q-der-1',
    conceptId: 'derivative-rules',
    prompt: 'Find the derivative of f(x) = 1 / x^3',
    difficulty: 0.4,
    discrimination: 1.4,
    bloomsLevel: 'Apply',
    hint: 'Rewrite 1 / x^3 as x^{-3} before applying the power rule: d/dx(x^n) = n*x^{n-1}.',
    fullSolution: 'f(x) = x^{-3}. f\'(x) = -3 * x^{-3 - 1} = -3 * x^{-4} = -3 / x^4.',
    options: [
      { id: 'opt-der-1b', text: '-3 / x^2', isCorrect: false, misconceptionId: 'misc-power-rule-subtraction', explanation: 'Added 1 instead of subtracting: -3 + 1 = -2.' },
      { id: 'opt-der-1c', text: '1 / (3x^2)', isCorrect: false, explanation: 'Differentiated denominator in place without quotient/power rules.' },
      { id: 'opt-der-1a', text: '-3 / x^4', isCorrect: true, explanation: 'Correct! -3 * x^{-4} = -3 / x^4.' },
      { id: 'opt-der-1d', text: '3 / x^4', isCorrect: false, misconceptionId: 'misc-order-sign', explanation: 'Lost the negative sign in the power rule.' }
    ]
  },
  {
    id: 'q-der-2',
    conceptId: 'derivative-rules',
    prompt: 'Find the derivative of f(x) = 5 * sqrt(x) - 7',
    difficulty: 0.5,
    discrimination: 1.3,
    bloomsLevel: 'Apply',
    hint: 'Rewrite sqrt(x) as x^{1/2}. The derivative of constant -7 is 0.',
    fullSolution: 'f(x) = 5x^{1/2} - 7. f\'(x) = 5*(1/2)*x^{-1/2} - 0 = 5 / (2*sqrt(x)).',
    options: [
      { id: 'opt-der-2b', text: '5 / (2*sqrt(x)) - 7', isCorrect: false, misconceptionId: 'misc-constant-derivative', explanation: 'Kept the -7 instead of recognizing the derivative of a constant is 0.' },
      { id: 'opt-der-2c', text: '5 * sqrt(x)', isCorrect: false, explanation: 'Failed to apply power rule.' },
      { id: 'opt-der-2d', text: '(5/2) * x^{3/2}', isCorrect: false, misconceptionId: 'misc-power-rule-subtraction', explanation: 'Added 1 to exponent: 1/2 + 1 = 3/2.' },
      { id: 'opt-der-2a', text: '5 / (2*sqrt(x))', isCorrect: true, explanation: 'Correct! Power 1/2 gives (5/2)*x^{-1/2}.' }
    ]
  },

  // --- chain-rule questions ---
  {
    id: 'q-chain-1',
    conceptId: 'chain-rule',
    prompt: 'Find the derivative of y = (4x^2 - 5)^3',
    difficulty: 0.9,
    discrimination: 1.6,
    bloomsLevel: 'Analyze',
    hint: 'Use the chain rule: dy/dx = 3*(4x^2 - 5)^2 * d/dx(4x^2 - 5).',
    fullSolution: 'Outer derivative is 3(4x^2 - 5)^2. Inner derivative is 8x. Multiplying: 24x*(4x^2 - 5)^2.',
    options: [
      { id: 'opt-chain-1b', text: '3(4x^2 - 5)^2', isCorrect: false, misconceptionId: 'misc-forgot-inner-derivative', explanation: 'Forgot to multiply by the derivative of the inner function (8x).' },
      { id: 'opt-chain-1a', text: '24x(4x^2 - 5)^2', isCorrect: true, explanation: 'Correct! 3(4x^2 - 5)^2 * (8x) = 24x(4x^2 - 5)^2.' },
      { id: 'opt-chain-1c', text: '3(8x)^2', isCorrect: false, misconceptionId: 'misc-differentiating-inside-prematurely', explanation: 'Differentiated inside prematurely while applying outer power.' },
      { id: 'opt-chain-1d', text: '8x(4x^2 - 5)^3', isCorrect: false, explanation: 'Applied inner derivative without differentiating outer power.' }
    ]
  },
  {
    id: 'q-chain-2',
    conceptId: 'chain-rule',
    prompt: 'Find dy/dx for y = sqrt{3x - 1}',
    difficulty: 1.2,
    discrimination: 1.5,
    bloomsLevel: 'Analyze',
    hint: 'Rewrite as (3x - 1)^{1/2}. Apply power rule and multiply by inner derivative.',
    fullSolution: 'y = (3x - 1)^{1/2}. y\' = (1/2)(3x - 1)^{-1/2} * 3 = 3 / (2*sqrt{3x - 1}).',
    options: [
      { id: 'opt-chain-2b', text: '1 / (2*sqrt{3x - 1})', isCorrect: false, misconceptionId: 'misc-forgot-inner-derivative', explanation: 'Forgot the inner derivative multiplier * 3.' },
      { id: 'opt-chain-2c', text: '-3 / (2*(3x - 1)^{3/2})', isCorrect: false, misconceptionId: 'misc-negative-exp-value', explanation: 'Misapplied negative exponent and fraction subtraction.' },
      { id: 'opt-chain-2a', text: '3 / (2*sqrt{3x - 1})', isCorrect: true, explanation: 'Correct! (1/2)*(3x - 1)^{-1/2} * 3 = 3 / (2*sqrt{3x - 1}).' },
      { id: 'opt-chain-2d', text: '3 / sqrt{3x - 1}', isCorrect: false, explanation: 'Missed factor of 1/2 from square root exponent.' }
    ]
  },

  // --- curve-optimization questions ---
  {
    id: 'q-opt-1',
    conceptId: 'curve-optimization',
    prompt: 'Find the x-coordinate of the local minimum for f(x) = x^2 - 6x + 11',
    difficulty: 0.8,
    discrimination: 1.3,
    bloomsLevel: 'Apply',
    hint: 'Set f\'(x) = 0 and solve for x.',
    fullSolution: 'f\'(x) = 2x - 6 = 0 => 2x = 6 => x = 3. Since f\'\'(x) = 2 > 0, this is a local minimum.',
    options: [
      { id: 'opt-opt-1a', text: 'x = 3', isCorrect: true, explanation: 'Correct! 2x - 6 = 0 gives x = 3.' },
      { id: 'opt-opt-1b', text: 'x = -3', isCorrect: false, misconceptionId: 'misc-order-sign', explanation: 'Sign error when solving 2x - 6 = 0.' },
      { id: 'opt-opt-1c', text: 'x = 6', isCorrect: false, explanation: 'Forgot to divide by 2.' },
      { id: 'opt-opt-1d', text: 'x = 2', isCorrect: false, explanation: 'Computed minimum y-value instead of x.' }
    ]
  }
];
