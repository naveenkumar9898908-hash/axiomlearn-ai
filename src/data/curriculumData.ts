import { ConceptNode, PrerequisiteEdge, Question } from '../types';
import { mathConcepts, mathEdges, mathQuestions } from './mathCurriculum';
import { csConcepts, csEdges, csQuestions } from './csCurriculum';

export interface CurriculumPackage {
  id: string;
  name: string;
  description: string;
  concepts: ConceptNode[];
  edges: PrerequisiteEdge[];
  questions: Question[];
}

export const curricula: Record<string, CurriculumPackage> = {
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics & Calculus Track',
    description: 'Foundational Algebra to Limits, Differential Calculus, Chain Rule & Optimization.',
    concepts: mathConcepts,
    edges: mathEdges,
    questions: mathQuestions,
  },
  computer_science: {
    id: 'computer_science',
    name: 'Computer Science & Algorithms Track',
    description: 'Core Programming, Memory Pointers, Recursion, Trees & Dynamic Programming.',
    concepts: csConcepts,
    edges: csEdges,
    questions: csQuestions,
  }
};

export function getCurriculum(domain: string = 'mathematics'): CurriculumPackage {
  return curricula[domain] || curricula.mathematics;
}
