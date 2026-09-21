import { ConceptNode, PrerequisiteEdge } from '../types';

export interface GraphNodeWithMeta extends ConceptNode {
  isFrontier: boolean; // Ready to learn (prereqs mastered)
  isBlocked: boolean;  // Has unmastered prereq
  masteryScore: number;
}

export class PrerequisiteKnowledgeGraph {
  private nodes: Map<string, ConceptNode> = new Map();
  private edges: PrerequisiteEdge[] = [];
  private prereqMap: Map<string, Array<{ id: string; weight: number }>> = new Map();
  private dependentMap: Map<string, Array<{ id: string; weight: number }>> = new Map();

  constructor(concepts: ConceptNode[], edges: PrerequisiteEdge[]) {
    this.edges = edges;
    for (const c of concepts) {
      this.nodes.set(c.id, c);
      this.prereqMap.set(c.id, []);
      this.dependentMap.set(c.id, []);
    }

    for (const edge of edges) {
      if (this.nodes.has(edge.from) && this.nodes.has(edge.to)) {
        this.prereqMap.get(edge.to)?.push({ id: edge.from, weight: edge.weight });
        this.dependentMap.get(edge.from)?.push({ id: edge.to, weight: edge.weight });
      }
    }

    this.validateDAG();
  }

  public getNode(id: string): ConceptNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): ConceptNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): PrerequisiteEdge[] {
    return this.edges;
  }

  public getDirectPrerequisites(conceptId: string): Array<{ id: string; weight: number }> {
    return this.prereqMap.get(conceptId) ?? [];
  }

  public getDirectDependents(conceptId: string): Array<{ id: string; weight: number }> {
    return this.dependentMap.get(conceptId) ?? [];
  }

  /**
   * Topological Sort to verify acyclicity. Throws if a cycle is detected.
   */
  public validateDAG(): string[] {
    const inDegree = new Map<string, number>();
    for (const id of this.nodes.keys()) {
      inDegree.set(id, 0);
    }

    for (const edge of this.edges) {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      sorted.push(u);

      const dependents = this.dependentMap.get(u) ?? [];
      for (const dep of dependents) {
        const newDeg = (inDegree.get(dep.id) ?? 1) - 1;
        inDegree.set(dep.id, newDeg);
        if (newDeg === 0) {
          queue.push(dep.id);
        }
      }
    }

    if (sorted.length !== this.nodes.size) {
      console.warn("Cycle detected in prerequisite graph! Fallback to non-strict sorting.");
    }

    return sorted;
  }

  /**
   * Recursively get all ancestral prerequisites of a concept in reverse topological order.
   * Returns ancestor IDs along with the minimum/cumulative dependency weight.
   */
  public getAllAncestors(conceptId: string): Array<{ id: string; cumulativeWeight: number; depth: number }> {
    const visited = new Map<string, { cumulativeWeight: number; depth: number }>();
    const queue: Array<{ id: string; currentWeight: number; currentDepth: number }> = [
      { id: conceptId, currentWeight: 1.0, currentDepth: 0 }
    ];

    while (queue.length > 0) {
      const { id, currentWeight, currentDepth } = queue.shift()!;
      const prereqs = this.getDirectPrerequisites(id);

      for (const p of prereqs) {
        const nextWeight = currentWeight * p.weight;
        const nextDepth = currentDepth + 1;

        if (!visited.has(p.id) || (visited.get(p.id)?.cumulativeWeight ?? 0) < nextWeight) {
          visited.set(p.id, { cumulativeWeight: nextWeight, depth: nextDepth });
          queue.push({ id: p.id, currentWeight: nextWeight, currentDepth: nextDepth });
        }
      }
    }

    return Array.from(visited.entries()).map(([id, info]) => ({
      id,
      cumulativeWeight: info.cumulativeWeight,
      depth: info.depth,
    }));
  }

  /**
   * Compute Learning Frontier (Zone of Proximal Development):
   * Concepts where all prerequisites are mastered (or concept is root with 0 prereqs),
   * but the concept itself is NOT yet mastered.
   */
  public computeLearningFrontier(
    masteryMap: Record<string, number>,
    masteryThreshold: number = 0.80
  ): string[] {
    const frontier: string[] = [];

    for (const [id, node] of this.nodes.entries()) {
      const currentMastery = masteryMap[id] ?? node.bktParams.pL0;
      if (currentMastery >= masteryThreshold) {
        // Already mastered
        continue;
      }

      const prereqs = this.getDirectPrerequisites(id);
      const allPrereqsMastered = prereqs.every(
        (p) => (masteryMap[p.id] ?? 0.5) >= masteryThreshold
      );

      if (allPrereqsMastered) {
        frontier.push(id);
      }
    }

    return frontier;
  }
}
