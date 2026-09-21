import { ConceptNode, PrerequisiteEdge, Question } from '../types';

export const csConcepts: ConceptNode[] = [
  {
    id: 'cs-vars-types',
    title: 'Variables, Types & Memory',
    domain: 'computer_science',
    depth: 0,
    description: 'Data primitives, assignment versus equality, type coercion, and variable scope.',
    learningObjectives: [
      'Distinguish assignment (=) from comparison (== / ===)',
      'Understand integer vs floating point division',
      'Trace variable state mutations through execution steps',
    ],
    prerequisites: [],
    bktParams: { pL0: 0.78, pT: 0.25, pG: 0.2, pS: 0.08 },
    misconceptions: [
      {
        id: 'misc-cs-assign-vs-eq',
        label: 'Confusing assignment (=) with equality (==)',
        description: 'Using = inside conditional check which accidentally overwrites the variable.',
        remedialAdvice: '= assigns value to a variable; == or === compares two values.'
      },
      {
        id: 'misc-cs-int-div',
        label: 'Truncating integer division surprise',
        description: 'Expecting 5 / 2 to equal 2.5 in integer context without explicit float cast.',
        remedialAdvice: 'In typed languages (C/Java), integer divided by integer yields a truncated integer.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Variables as Named Storage Locations',
      keyIntuition: 'A variable is a labeled container. Single = pours a new value into the box. Double == asks whether two boxes have identical contents.',
      commonPitfall: 'Writing if (x = 5) which always sets x to 5 and evaluates to truthy.',
      mnemonicOrRule: 'Single = sets, Double == checks.'
    }
  },
  {
    id: 'cs-conditionals',
    title: 'Boolean Logic & Branching',
    domain: 'computer_science',
    depth: 1,
    description: 'Truth tables, short-circuit evaluation, nested conditionals, and De Morgan’s laws.',
    learningObjectives: [
      'Apply De Morgan\'s laws to invert compound conditionals',
      'Understand short-circuit evaluation in AND/OR expressions',
      'Avoid dead code branches in chained if-else blocks',
    ],
    prerequisites: ['cs-vars-types'],
    bktParams: { pL0: 0.68, pT: 0.22, pG: 0.18, pS: 0.1 },
    misconceptions: [
      {
        id: 'misc-cs-demorgan',
        label: 'Failing to negate operator in De Morgan inversion',
        description: 'Negating !(A && B) as (!A && !B) instead of (!A || !B).',
        remedialAdvice: 'De Morgan\'s Law flips both the conditions AND the conjunction: !(A && B) = !A || !B.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Boolean Logic & De Morgan Inversion',
      keyIntuition: 'If it\'s not true that "I have eggs AND milk", then either "I don\'t have eggs OR I don\'t have milk".',
      commonPitfall: 'Forgetting to flip AND into OR when distributing NOT.',
      mnemonicOrRule: 'Break the line, change the sign: !(A && B) == !A || !B.'
    }
  },
  {
    id: 'cs-loops',
    title: 'Loops & Iteration Bounds',
    domain: 'computer_science',
    depth: 2,
    description: 'For-loops, while-loops, loop invariants, termination conditions, and index bounds.',
    learningObjectives: [
      'Prevent off-by-one errors in array indexing (0 to n - 1)',
      'Construct guaranteed loop termination proofs',
      'Trace multi-pass nested loop iterations and step counts',
    ],
    prerequisites: ['cs-conditionals'],
    bktParams: { pL0: 0.55, pT: 0.2, pG: 0.15, pS: 0.1 },
    misconceptions: [
      {
        id: 'misc-cs-off-by-one',
        label: 'Fencepost / Off-by-one error with <= array.length',
        description: 'Iterating up to i <= array.length causing ArrayIndexOutOfBounds exception.',
        remedialAdvice: 'Arrays are 0-indexed: valid indices for length N are 0 through N-1. Use i < length.'
      }
    ],
    remedialRefresher: {
      coreConcept: '0-Indexed Bound Invariants',
      keyIntuition: 'If you have 5 items in a row, the 5th item is at index 4 because counting begins at zero.',
      commonPitfall: 'Using <= arr.length which accesses one element past the allocated memory.',
      mnemonicOrRule: 'Length N means indices 0 to N-1: always iterate with `i < n`.'
    }
  },
  {
    id: 'cs-functions',
    title: 'Functions, Scope & Call Stack',
    domain: 'computer_science',
    depth: 2,
    description: 'Function parameters, return values, call stack frames, variable shadowing, and pass-by-value vs pass-by-reference.',
    learningObjectives: [
      'Trace execution across stack activation frames',
      'Distinguish pass-by-value from mutable reference passing',
      'Identify variable scope boundaries and closures',
    ],
    prerequisites: ['cs-vars-types', 'cs-conditionals'],
    bktParams: { pL0: 0.6, pT: 0.22, pG: 0.16, pS: 0.1 },
    misconceptions: [
      {
        id: 'misc-cs-pass-by-value',
        label: 'Expecting primitive argument modification to persist outside function',
        description: 'Believing that reassigning a primitive parameter inside a function alters caller variable.',
        remedialAdvice: 'Primitive arguments are passed by value: the function receives an independent copy.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Stack Activation Frames and Local Scope',
      keyIntuition: 'Each function call creates an isolated chalkboard frame. Erasing numbers on that frame does not alter the caller\'s board.',
      commonPitfall: 'Assuming `x = 10` inside a helper modifies the caller\'s primitive `x`.',
      mnemonicOrRule: 'Primitives are copies; object references share the target.'
    }
  },
  {
    id: 'cs-arrays-pointers',
    title: 'Arrays, Pointers & Memory Allocation',
    domain: 'computer_science',
    depth: 3,
    description: 'Contiguous memory layout, pointer arithmetic, dereferencing, dynamic heap allocation, and shallow copies.',
    learningObjectives: [
      'Understand contiguous memory address calculation: base + i * sizeof(T)',
      'Safely dereference pointer addresses and manage heap life cycles',
      'Differentiate shallow address alias from deep cloning',
    ],
    prerequisites: ['cs-loops', 'cs-functions'],
    bktParams: { pL0: 0.4, pT: 0.18, pG: 0.15, pS: 0.12 },
    misconceptions: [
      {
        id: 'misc-cs-shallow-copy',
        label: 'Confusing pointer / reference copy with deep clone',
        description: 'Assuming b = a creates a separate copy of the array instead of pointing to the exact same memory.',
        remedialAdvice: 'Assigning an array reference creates an alias! Modifying b[0] directly mutates a[0].'
      },
      {
        id: 'misc-cs-dangling-pointer',
        label: 'Dereferencing freed or stack-allocated pointer',
        description: 'Returning pointer to a local stack variable that becomes invalid when frame unwinds.',
        remedialAdvice: 'Stack memory is reclaimed upon function return. Use heap allocation (new/malloc) for persistent data.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'References as Memory Addresses',
      keyIntuition: 'A reference is like a house address written on a card. Copying the card doesn\'t build a new house—both cards point to the same house.',
      commonPitfall: 'Believing `arr2 = arr1` clones the data. It just copies the address.',
      mnemonicOrRule: 'To duplicate data, allocate new memory and copy elements individually.'
    }
  },
  {
    id: 'cs-recursion',
    title: 'Recursion & Inductive Decomposition',
    domain: 'computer_science',
    depth: 3,
    description: 'Base cases, recursive step, call stack growth, reduction towards base case, and divide-and-conquer.',
    learningObjectives: [
      'Formulate mathematically rigorous base cases',
      'Ensure recursive parameters strictly decrease/advance towards base condition',
      'Visualize call stack expansion and rewind winding',
    ],
    prerequisites: ['cs-functions'],
    bktParams: { pL0: 0.38, pT: 0.18, pG: 0.12, pS: 0.14 },
    misconceptions: [
      {
        id: 'misc-cs-missing-base-case',
        label: 'Missing or unreachable base case causing StackOverflow',
        description: 'Writing recursive call without decreasing problem size or missing return on base condition.',
        remedialAdvice: 'Every recursive function MUST have an un-recursive base case that halts the branch!'
      },
      {
        id: 'misc-cs-recursive-return',
        label: 'Forgetting to return the result of recursive call',
        description: 'Calling helper(n-1) without returning its value: `helper(n-1)` instead of `return helper(n-1)`.',
        remedialAdvice: 'A recursive function must return the value yielded by sub-calls, otherwise undefined is propagated.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Induction: Base Case + Reduction Step',
      keyIntuition: 'Like dominoes: you need the first domino grounded (base case), and a rule that each domino knocks down the next smaller one.',
      commonPitfall: 'Omitting the `return` statement in front of the recursive call.',
      mnemonicOrRule: 'Check base case first, ensure progress toward base case, always return the recursive result.'
    }
  },
  {
    id: 'cs-linked-lists',
    title: 'Linked Lists & Pointer Manipulation',
    domain: 'computer_science',
    depth: 4,
    description: 'Singly and doubly linked lists, node pointer rewiring, sentinel dummy nodes, and cycle detection.',
    learningObjectives: [
      'Rewire next pointers without losing track of downstream list',
      'Use dummy head nodes to simplify boundary corner cases (deleting head)',
      'Detect cycles using Floyd\'s two-pointer algorithm',
    ],
    prerequisites: ['cs-arrays-pointers', 'cs-recursion'],
    bktParams: { pL0: 0.3, pT: 0.16, pG: 0.14, pS: 0.14 },
    misconceptions: [
      {
        id: 'misc-cs-lost-list-pointer',
        label: 'Overwriting pointer before saving next node, losing rest of list',
        description: 'Doing curr.next = prev before saving curr.next in a temporary variable, severing the list.',
        remedialAdvice: 'Always stash next pointer before overwriting: temp = curr.next; curr.next = prev; curr = temp.'
      },
      {
        id: 'misc-cs-null-pointer-deref',
        label: 'Accessing .next on null pointer',
        description: 'Writing while (curr.next != null) when curr itself could be null.',
        remedialAdvice: 'Always guard against null head: `while (curr != null && curr.next != null)`.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Pointer Chains: Holding Hands',
      keyIntuition: 'A linked list is a chain of people holding hands. Before you let go of the next person\'s hand to grab someone else, someone must hold their hand or they drift away into memory void.',
      commonPitfall: 'Overwriting `curr.next` without saving it into a temp variable first.',
      mnemonicOrRule: 'Save next, rewire, advance.'
    }
  },
  {
    id: 'cs-trees-bst',
    title: 'Binary Search Trees & Traversals',
    domain: 'computer_science',
    depth: 5,
    description: 'BST property (left < root < right), in-order traversal, tree height, insertion, search, and deletion.',
    learningObjectives: [
      'Verify the global BST property across subtrees',
      'Perform in-order, pre-order, and post-order depth-first traversals',
      'Implement O(log N) search and node removal',
    ],
    prerequisites: ['cs-linked-lists'],
    bktParams: { pL0: 0.22, pT: 0.15, pG: 0.12, pS: 0.15 },
    misconceptions: [
      {
        id: 'misc-cs-local-bst-flaw',
        label: 'Checking only immediate children instead of full subtree bounds for BST validity',
        description: 'Assuming a tree is a BST if each node is greater than its immediate left child and less than right child.',
        remedialAdvice: 'BST property is GLOBAL: ALL nodes in left subtree must be less than root; pass min/max range down recursion.'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Binary Search Tree Global Invariant',
      keyIntuition: 'Every node in the entire left subtree must be strictly smaller than the root, not just the immediate child.',
      commonPitfall: 'Validating BST with only `root.left.val < root.val`. You must enforce valid min/max interval bounds.',
      mnemonicOrRule: 'In-order traversal of a valid BST always yields strictly sorted values.'
    }
  },
  {
    id: 'cs-dynamic-programming',
    title: 'Dynamic Programming & Memoization',
    domain: 'computer_science',
    depth: 6,
    description: 'Overlapping subproblems, optimal substructure, top-down memoization, and bottom-up tabulation.',
    learningObjectives: [
      'Identify overlapping subproblems in recursive call graphs',
      'Formulate state definition and recurrence relations',
      'Transform exponential brute-force algorithms into polynomial dynamic programs',
    ],
    prerequisites: ['cs-recursion', 'cs-trees-bst'],
    bktParams: { pL0: 0.15, pT: 0.12, pG: 0.1, pS: 0.16 },
    misconceptions: [
      {
        id: 'misc-cs-memo-key-flaw',
        label: 'Missing state dimension in memoization table key',
        description: 'Memoizing only 1 variable when recurrence depends on 2 changing parameters (e.g. index AND remaining capacity).',
        remedialAdvice: 'The memo key MUST contain all variables that define the distinct subproblem state!'
      }
    ],
    remedialRefresher: {
      coreConcept: 'Memoization: Remembering Past Computations',
      keyIntuition: 'Those who cannot remember the past are condemned to recompute it. Store solved subproblems in a lookup table.',
      commonPitfall: 'Forgetting to include all state parameters in the memo cache key.',
      mnemonicOrRule: 'State = what changes between recursive calls. Check cache before computing, save before returning.'
    }
  }
];

export const csEdges: PrerequisiteEdge[] = [
  { from: 'cs-vars-types', to: 'cs-conditionals', weight: 0.9, rationale: 'Conditions evaluate variable expressions and comparisons.' },
  { from: 'cs-vars-types', to: 'cs-functions', weight: 0.85, rationale: 'Functions pass and return typed variables.' },
  { from: 'cs-conditionals', to: 'cs-loops', weight: 0.9, rationale: 'Loops evaluate conditional loop invariant conditions.' },
  { from: 'cs-conditionals', to: 'cs-functions', weight: 0.8, rationale: 'Branching logic inside routines.' },
  { from: 'cs-loops', to: 'cs-arrays-pointers', weight: 0.9, rationale: 'Array processing is conducted via index loops.' },
  { from: 'cs-functions', to: 'cs-arrays-pointers', weight: 0.85, rationale: 'Passing arrays and buffers to procedures.' },
  { from: 'cs-functions', to: 'cs-recursion', weight: 0.95, rationale: 'Recursion is self-referential function invocation.' },
  { from: 'cs-arrays-pointers', to: 'cs-linked-lists', weight: 0.95, rationale: 'Linked list nodes are connected via pointers.' },
  { from: 'cs-recursion', to: 'cs-linked-lists', weight: 0.75, rationale: 'Recursive traversal of linked structures.' },
  { from: 'cs-linked-lists', to: 'cs-trees-bst', weight: 0.9, rationale: 'Trees generalize single next pointers to multiple child pointers.' },
  { from: 'cs-recursion', to: 'cs-dynamic-programming', weight: 0.95, rationale: 'Dynamic programming optimizes recursive overlapping branches.' },
  { from: 'cs-trees-bst', to: 'cs-dynamic-programming', weight: 0.8, rationale: 'Tree DP and topological DAG state spaces.' }
];

export const csQuestions: Question[] = [
  // --- cs-vars-types questions ---
  {
    id: 'q-cs-var-1',
    conceptId: 'cs-vars-types',
    prompt: 'What will the following code output?',
    codeSnippet: 'int x = 7;\nint y = 2;\nfloat result = x / y;\nprint(result);',
    difficulty: -1.5,
    discrimination: 1.2,
    bloomsLevel: 'Understand',
    hint: 'Both x and y are declared as integers.',
    fullSolution: 'In typed languages like C/Java, integer division 7 / 2 performs truncation to 3. Assigning 3 to float yields 3.0.',
    options: [
      { id: 'opt-cs-var-1b', text: '3.5', isCorrect: false, misconceptionId: 'misc-cs-int-div', explanation: 'Expected floating point division, but both operands were integers.' },
      { id: 'opt-cs-var-1a', text: '3.0', isCorrect: true, explanation: 'Correct! Integer division 7 / 2 truncates to 3, then converts to 3.0.' },
      { id: 'opt-cs-var-1c', text: '4.0', isCorrect: false, explanation: 'Integer division truncates towards zero; it does not round up.' },
      { id: 'opt-cs-var-1d', text: 'Compilation Error', isCorrect: false, explanation: 'Implicit widening cast from int to float is valid.' }
    ]
  },

  // --- cs-conditionals questions ---
  {
    id: 'q-cs-cond-1',
    conceptId: 'cs-conditionals',
    prompt: 'According to De Morgan\'s Laws, which expression is logically equivalent to !(x > 5 && y <= 10)?',
    difficulty: -0.6,
    discrimination: 1.4,
    bloomsLevel: 'Apply',
    hint: 'Negate each comparison and change the AND (&&) to OR (||).',
    fullSolution: '!(A && B) = !A || !B. Here !A is (x <= 5) and !B is (y > 10). So (x <= 5 || y > 10).',
    options: [
      { id: 'opt-cs-cond-1b', text: 'x <= 5 && y > 10', isCorrect: false, misconceptionId: 'misc-cs-demorgan', explanation: 'Failed to flip && to || when distributing negation.' },
      { id: 'opt-cs-cond-1c', text: 'x < 5 || y >= 10', isCorrect: false, explanation: 'Incorrect boundary negation (> negates to <=, not <).' },
      { id: 'opt-cs-cond-1d', text: 'x > 5 || y <= 10', isCorrect: false, explanation: 'Did not negate inner terms.' },
      { id: 'opt-cs-cond-1a', text: 'x <= 5 || y > 10', isCorrect: true, explanation: 'Correct! Negated conditions and flipped AND to OR.' }
    ]
  },

  // --- cs-loops questions ---
  {
    id: 'q-cs-loop-1',
    conceptId: 'cs-loops',
    prompt: 'Given an array int[] nums = {10, 20, 30}; what happens when running this loop?',
    codeSnippet: 'for (int i = 0; i <= nums.length; i++) {\n    print(nums[i]);\n}',
    difficulty: -0.2,
    discrimination: 1.5,
    bloomsLevel: 'Analyze',
    hint: 'Notice the termination condition i <= nums.length and the valid index range.',
    fullSolution: 'nums has length 3 with valid indices 0, 1, 2. When i reaches 3, nums[3] causes ArrayIndexOutOfBoundsException.',
    options: [
      { id: 'opt-cs-loop-1a', text: 'Prints 10, 20, 30 then throws IndexOutOfBoundsException', isCorrect: true, explanation: 'Correct! The condition i <= nums.length attempts to access index 3, which is out of bounds.' },
      { id: 'opt-cs-loop-1b', text: 'Prints 10, 20, 30 normally and finishes', isCorrect: false, misconceptionId: 'misc-cs-off-by-one', explanation: 'Off-by-one misconception: forgot that length 3 only has indices 0, 1, and 2.' },
      { id: 'opt-cs-loop-1c', text: 'Prints only 10 and 20', isCorrect: false, explanation: 'Loop starts at 0 and iterates beyond valid length.' },
      { id: 'opt-cs-loop-1d', text: 'Infinite loop', isCorrect: false, explanation: 'i increments on each step so loop does not run infinitely.' }
    ]
  },

  // --- cs-arrays-pointers questions ---
  {
    id: 'q-cs-ptr-1',
    conceptId: 'cs-arrays-pointers',
    prompt: 'What will be printed by the following code?',
    codeSnippet: 'int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nprint(a[0]);',
    difficulty: 0.1,
    discrimination: 1.4,
    bloomsLevel: 'Analyze',
    hint: 'Does b = a create a new copy of the array or copy the reference address?',
    fullSolution: 'In Java/JS/C#, array variables store references. b = a copies the memory pointer, so modifying b[0] directly changes a[0]. Result is 99.',
    options: [
      { id: 'opt-cs-ptr-1b', text: '1', isCorrect: false, misconceptionId: 'misc-cs-shallow-copy', explanation: 'Assumed b = a cloned the array into independent memory.' },
      { id: 'opt-cs-ptr-1c', text: '0', isCorrect: false, explanation: 'Incorrect default value assumption.' },
      { id: 'opt-cs-ptr-1a', text: '99', isCorrect: true, explanation: 'Correct! b and a reference the same contiguous memory array in heap.' },
      { id: 'opt-cs-ptr-1d', text: 'NullPointerException', isCorrect: false, explanation: 'Both pointers are non-null.' }
    ]
  },

  // --- cs-recursion questions ---
  {
    id: 'q-cs-rec-1',
    conceptId: 'cs-recursion',
    prompt: 'What is the issue with this recursive factorial function?',
    codeSnippet: 'int factorial(int n) {\n    if (n == 1) return 1;\n    factorial(n - 1) * n;\n}',
    difficulty: 0.3,
    discrimination: 1.5,
    bloomsLevel: 'Analyze',
    hint: 'Look closely at the recursive call line.',
    fullSolution: 'The recursive step computes factorial(n - 1) * n, but forgets the return keyword! Without return, value is not returned.',
    options: [
      { id: 'opt-cs-rec-1b', text: 'The base case should be n == 0 instead', isCorrect: false, explanation: 'While n == 0 is often used for 0! = 1, the immediate fatal bug is missing return.' },
      { id: 'opt-cs-rec-1a', text: 'Missing return keyword in the recursive call statement', isCorrect: true, explanation: 'Correct! It computes the value but fails to return it to the caller.' },
      { id: 'opt-cs-rec-1c', text: 'The parameter should be n + 1', isCorrect: false, misconceptionId: 'misc-cs-missing-base-case', explanation: 'Recursion must reduce towards base case (n - 1).' },
      { id: 'opt-cs-rec-1d', text: 'No issue, works as expected', isCorrect: false, misconceptionId: 'misc-cs-recursive-return', explanation: 'Without return, compiler errors or undefined is returned.' }
    ]
  },

  // --- cs-linked-lists questions ---
  {
    id: 'q-cs-ll-1',
    conceptId: 'cs-linked-lists',
    prompt: 'To insert a newNode after an existing node prevNode in a singly linked list, which order of operations is required?',
    codeSnippet: '// Option 1: prevNode.next = newNode; newNode.next = prevNode.next;\n// Option 2: newNode.next = prevNode.next; prevNode.next = newNode;',
    difficulty: 0.7,
    discrimination: 1.6,
    bloomsLevel: 'Analyze',
    hint: 'If you overwrite prevNode.next first, you lose the reference to the rest of the list.',
    fullSolution: 'Must link newNode.next = prevNode.next first so the remainder of list is preserved, then point prevNode.next = newNode.',
    options: [
      { id: 'opt-cs-ll-1b', text: 'prevNode.next = newNode; then newNode.next = prevNode.next;', isCorrect: false, misconceptionId: 'misc-cs-lost-list-pointer', explanation: 'Overwriting prevNode.next first creates a self-loop and detaches the entire remaining list.' },
      { id: 'opt-cs-ll-1c', text: 'Order does not matter in singly linked lists', isCorrect: false, explanation: 'Pointer overwrites are destructive and strictly order-dependent.' },
      { id: 'opt-cs-ll-1d', text: 'prevNode = newNode; newNode.next = prevNode;', isCorrect: false, explanation: 'Incorrect pointer variable reassignment.' },
      { id: 'opt-cs-ll-1a', text: 'newNode.next = prevNode.next; then prevNode.next = newNode;', isCorrect: true, explanation: 'Correct! Preserves downstream pointer chain before repointing.' }
    ]
  },

  // --- cs-trees-bst questions ---
  {
    id: 'q-cs-bst-1',
    conceptId: 'cs-trees-bst',
    prompt: 'Consider a binary tree: Root is 10. Left child is 5. Right child of 5 is 12. Right child of 10 is 20. Is this a valid Binary Search Tree (BST)?',
    difficulty: 0.9,
    discrimination: 1.5,
    bloomsLevel: 'Analyze',
    hint: 'Check if 12 satisfies the BST property with respect to the root (10).',
    fullSolution: 'No. In a BST, ALL nodes in root 10\'s left subtree must be < 10. Node 12 is in the left subtree of 10, violating the global BST invariant.',
    options: [
      { id: 'opt-cs-bst-1b', text: 'Yes, because 5 < 10 and 12 > 5 locally', isCorrect: false, misconceptionId: 'misc-cs-local-bst-flaw', explanation: 'Checked only immediate local parent/child relations instead of the global subtree bounds.' },
      { id: 'opt-cs-bst-1c', text: 'Yes, because 12 < 20', isCorrect: false, explanation: 'Comparing with right sibling does not validate left subtree.' },
      { id: 'opt-cs-bst-1a', text: 'No, because 12 is in 10\'s left subtree but 12 > 10', isCorrect: true, explanation: 'Correct! The BST property is global across all descendants, not just immediate parents.' },
      { id: 'opt-cs-bst-1d', text: 'No, because root must be an even number', isCorrect: false, explanation: 'Parity has no bearing on BST validity.' }
    ]
  },

  // --- cs-dynamic-programming questions ---
  {
    id: 'q-cs-dp-1',
    conceptId: 'cs-dynamic-programming',
    prompt: 'In the 0/1 Knapsack problem with weights W and values V, what is the minimum required state tuple for memoization?',
    difficulty: 1.4,
    discrimination: 1.6,
    bloomsLevel: 'Evaluate',
    hint: 'Can the answer for item i change if remaining capacity differs?',
    fullSolution: 'At any decision point, we need both the current item index i and the remaining knapsack capacity c. State must be memo[i][c].',
    options: [
      { id: 'opt-cs-dp-1a', text: '(itemIndex, remainingCapacity)', isCorrect: true, explanation: 'Correct! Subproblem depends on both which items remain and how much space is left.' },
      { id: 'opt-cs-dp-1b', text: 'Only itemIndex', isCorrect: false, misconceptionId: 'misc-cs-memo-key-flaw', explanation: 'Memoizing only itemIndex loses the remaining capacity dimension, returning invalid cached values.' },
      { id: 'opt-cs-dp-1c', text: 'Only totalAccumulatedValue', isCorrect: false, explanation: 'Accumulated value is the objective to maximize, not the state descriptor.' },
      { id: 'opt-cs-dp-1d', text: '(itemIndex, totalItems)', isCorrect: false, explanation: 'totalItems is a constant parameter, not a dynamic state variable.' }
    ]
  }
];
