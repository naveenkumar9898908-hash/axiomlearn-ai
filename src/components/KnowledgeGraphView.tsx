import React, { useMemo, useState, useRef } from 'react';
import { ConceptNode, PrerequisiteEdge, StudentProfile } from '../types';
import { PrerequisiteKnowledgeGraph } from '../engine/knowledgeGraph';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Play,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ArrowRight,
  BookOpen,
  X,
  Target,
  ChevronRight,
  Lightbulb,
  Crosshair,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

interface KnowledgeGraphViewProps {
  graph: PrerequisiteKnowledgeGraph;
  student: StudentProfile;
  onSelectConcept: (conceptId: string) => void;
  onStartPracticeConcept: (conceptId: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  graph,
  student,
  onSelectConcept,
  onStartPracticeConcept,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'frontier' | 'bottlenecks' | 'mastered'>('all');
  
  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const concepts = useMemo(() => graph.getAllNodes(), [graph]);
  const edges = useMemo(() => graph.getAllEdges(), [graph]);

  // Compute Frontier nodes and Bottleneck nodes
  const frontierNodeIds = useMemo(
    () => new Set(graph.computeLearningFrontier(student.conceptMastery, 0.8)),
    [graph, student.conceptMastery]
  );

  const bottleneckNodeIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of concepts) {
      const mastery = student.conceptMastery[c.id] ?? c.bktParams.pL0;
      const dependents = graph.getDirectDependents(c.id);
      if (mastery < 0.5 && dependents.length > 0) {
        set.add(c.id);
      }
    }
    return set;
  }, [concepts, graph, student.conceptMastery]);

  const masteredNodeIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of concepts) {
      const mastery = student.conceptMastery[c.id] ?? c.bktParams.pL0;
      if (mastery >= 0.8) {
        set.add(c.id);
      }
    }
    return set;
  }, [concepts, student.conceptMastery]);

  // Compute Ancestors & Dependents for Hover highlighting
  const highlightedNodeIds = useMemo(() => {
    if (!hoveredNodeId && !selectedNodeId) return null;
    const focusId = hoveredNodeId || selectedNodeId;
    if (!focusId) return null;

    const ancestors = new Set(graph.getAllAncestors(focusId).map((a) => a.id));
    const dependents = new Set(graph.getDirectDependents(focusId).map((d) => d.id));
    return {
      focusId,
      ancestors,
      dependents,
      allConnected: new Set([focusId, ...ancestors, ...dependents]),
    };
  }, [hoveredNodeId, selectedNodeId, graph]);

  // Group concepts by depth level to layout horizontally
  const depthGroups = useMemo(() => {
    const map = new Map<number, ConceptNode[]>();
    for (const c of concepts) {
      const list = map.get(c.depth) ?? [];
      list.push(c);
      map.set(c.depth, list);
    }
    return map;
  }, [concepts]);

  // Calculate layout coordinates for rectangular cards
  const maxDepth = Math.max(...concepts.map((c) => c.depth), 0);
  const cardWidth = 190;
  const cardHeight = 84;
  const svgWidth = 1250;
  const svgHeight = 680;
  const paddingX = 110;
  const paddingY = 80;

  const layout = useMemo(() => {
    const coords = new Map<string, { x: number; y: number }>();
    const xSpacing = maxDepth > 0 ? (svgWidth - 2 * paddingX) / maxDepth : 0;

    for (let d = 0; d <= maxDepth; d++) {
      const columnNodes = depthGroups.get(d) ?? [];
      const colCount = columnNodes.length;
      const ySpacing = (svgHeight - 2 * paddingY) / (colCount + 1);

      columnNodes.forEach((node, index) => {
        const x = paddingX + d * xSpacing;
        const y = paddingY + (index + 1) * ySpacing;
        coords.set(node.id, { x, y });
      });
    }

    return coords;
  }, [depthGroups, maxDepth, svgWidth, svgHeight]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-canvas-bg') {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Selected node details
  const selectedNode = selectedNodeId ? graph.getNode(selectedNodeId) : null;
  const selectedMastery = selectedNodeId ? (student.conceptMastery[selectedNodeId] ?? 0.5) : 0.5;

  return (
    <div className="relative w-full rounded-3xl bg-[#020e1f]/90 border border-cyan-500/40 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col">
      {/* Tactical Corner Brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
      
      {/* Top Controls Bar */}
      <div className="p-4 sm:p-6 border-b border-cyan-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#031326]/80">
        
        {/* Title & Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Interactive Concept Mastery Map</span>
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              DAG Network
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Hover any concept card to trace its prerequisite learning path. Glow shows optimal Zone of Proximal Development.
          </p>
        </div>

        {/* Quick Filter Buttons & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({concepts.length})
            </button>
            <button
              onClick={() => setActiveFilter('frontier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'frontier'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-indigo-400 hover:text-indigo-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Frontier ZPD ({frontierNodeIds.size})</span>
            </button>
            <button
              onClick={() => setActiveFilter('bottlenecks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'bottlenecks'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Bottlenecks ({bottleneckNodeIds.size})</span>
            </button>
            <button
              onClick={() => setActiveFilter('mastered')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFilter === 'mastered'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mastered ({masteredNodeIds.size})</span>
            </button>
          </div>

          {/* Zoom Toolbar */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-slate-400">
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              title="Zoom In"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              title="Zoom Out"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              title="Reset View"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-800 ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Viewport Container */}
      <div
        className="relative w-full h-[580px] bg-[#020b18] cyber-scanlines overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          id="graph-canvas-bg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Cyber Grid Pattern */}
            <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f5ff" strokeWidth="0.75" opacity="0.12" />
              <circle cx="40" cy="40" r="1.2" fill="#00f5ff" opacity="0.4" />
            </pattern>

            {/* Glowing Gradients */}
            <linearGradient id="edge-active-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id="edge-prereq-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            <linearGradient id="edge-blocked-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>

            {/* Arrowhead Markers */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#475569" />
            </marker>

            <marker
              id="arrow-highlight"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#06b6d4" />
            </marker>

            <marker
              id="arrow-blocked-marker"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width={svgWidth} height={svgHeight} fill="url(#graph-grid)" />

          {/* Phase Column Guides */}
          {Array.from({ length: maxDepth + 1 }).map((_, d) => {
            const x = paddingX + (maxDepth > 0 ? (d * (svgWidth - 2 * paddingX)) / maxDepth : 0);
            const phaseTitles = [
              'Phase 0: Core Foundations',
              'Phase 1: Basic Manipulation',
              'Phase 2: Composite Structures',
              'Phase 3: Rate of Change & Decomp',
              'Phase 4: Intermediate Calculus / Pointers',
              'Phase 5: Advanced Rules & BST',
              'Phase 6: Optimization & High-Level DP',
            ];

            return (
              <g key={`phase-${d}`}>
                <line
                  x1={x}
                  y1={25}
                  x2={x}
                  y2={svgHeight - 20}
                  stroke="#1e293b"
                  strokeDasharray="6 6"
                  strokeWidth="1.5"
                />
                <rect
                  x={x - 70}
                  y={12}
                  width="140"
                  height="22"
                  rx="6"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={26}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {phaseTitles[d] || `Phase ${d}`}
                </text>
              </g>
            );
          })}

          {/* Render Prerequisite Edges */}
          {edges.map((edge) => {
            const fromCoord = layout.get(edge.from);
            const toCoord = layout.get(edge.to);
            if (!fromCoord || !toCoord) return null;

            const fromMastery = student.conceptMastery[edge.from] ?? 0.5;
            const isBlocked = fromMastery < 0.5;

            // Connection highlighting logic
            const isConnectedToHover =
              highlightedNodeIds?.focusId === edge.from && highlightedNodeIds?.dependents.has(edge.to);
            const isPrereqOfHover =
              highlightedNodeIds?.focusId === edge.to && highlightedNodeIds?.ancestors.has(edge.from);
            const isHighlighted = isConnectedToHover || isPrereqOfHover;
            const isDimmed = highlightedNodeIds && !isHighlighted;

            // Smooth cubic bezier connection
            const startX = fromCoord.x + cardWidth / 2;
            const startY = fromCoord.y;
            const endX = toCoord.x - cardWidth / 2;
            const endY = toCoord.y;

            const dx = Math.abs(endX - startX);
            const cp1x = startX + dx * 0.45;
            const cp1y = startY;
            const cp2x = endX - dx * 0.45;
            const cp2y = endY;

            const pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

            let strokeColor = '#334155';
            let strokeWidth = 1.8;
            let marker = 'url(#arrow-default)';

            if (isHighlighted) {
              strokeColor = isPrereqOfHover ? 'url(#edge-prereq-grad)' : 'url(#edge-active-grad)';
              strokeWidth = 3.5;
              marker = 'url(#arrow-highlight)';
            } else if (isBlocked) {
              strokeColor = '#f43f5e';
              strokeWidth = 2.0;
              marker = 'url(#arrow-blocked-marker)';
            }

            return (
              <g
                key={`edge-${edge.from}-${edge.to}`}
                style={{ opacity: isDimmed ? 0.15 : isHighlighted ? 1 : 0.65, transition: 'all 0.25s ease' }}
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isBlocked ? '6 4' : isHighlighted ? '8 4' : undefined}
                  className={isHighlighted ? 'edge-flow' : undefined}
                  markerEnd={marker}
                />
                
                {/* Weight badge mid-curve */}
                {isHighlighted && (
                  <g transform={`translate(${(startX + endX) / 2}, ${(startY + endY) / 2})`}>
                    <circle r={10} fill="#0b0f19" stroke={strokeColor} strokeWidth="1.5" />
                    <text
                      textAnchor="middle"
                      y={3.5}
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {Math.round(edge.weight * 100)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Modern Card Nodes */}
          {concepts.map((node) => {
            const coord = layout.get(node.id);
            if (!coord) return null;

            const mastery = student.conceptMastery[node.id] ?? node.bktParams.pL0;
            const isFrontier = frontierNodeIds.has(node.id);
            const isBottleneck = bottleneckNodeIds.has(node.id);
            const isMastered = mastery >= 0.8;
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;

            // Filtering visibility
            let matchesFilter = true;
            if (activeFilter === 'frontier') matchesFilter = isFrontier;
            if (activeFilter === 'bottlenecks') matchesFilter = isBottleneck;
            if (activeFilter === 'mastered') matchesFilter = isMastered;

            // Dimming when hovering another node
            const isRelated = highlightedNodeIds ? highlightedNodeIds.allConnected.has(node.id) : true;
            const opacity = !matchesFilter ? 0.2 : !isRelated ? 0.2 : 1.0;

            // Color Themes for Card Border & Background
            let borderColor = '#334155';
            let glowFilter = '';
            let statusBadge = { label: 'Learning', bg: 'bg-slate-800 text-slate-300' };

            if (isMastered) {
              borderColor = '#10b981';
              glowFilter = isHovered || isSelected ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))' : '';
              statusBadge = { label: 'Mastered', bg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' };
            } else if (isBottleneck) {
              borderColor = '#f43f5e';
              glowFilter = isHovered || isSelected ? 'drop-shadow(0 0 14px rgba(244, 63, 94, 0.7))' : '';
              statusBadge = { label: 'Bottleneck', bg: 'bg-rose-500/20 text-rose-300 border border-rose-500/40' };
            } else if (isFrontier) {
              borderColor = '#6366f1';
              glowFilter = isHovered || isSelected ? 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.8))' : 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))';
              statusBadge = { label: 'Ready (ZPD)', bg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' };
            }

            return (
              <g
                key={node.id}
                transform={`translate(${coord.x - cardWidth / 2}, ${coord.y - cardHeight / 2})`}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  onSelectConcept(node.id);
                }}
                className="cursor-pointer transition-all duration-200"
                style={{ opacity, filter: glowFilter }}
              >
                {/* Card Background Plate */}
                <rect
                  width={cardWidth}
                  height={cardHeight}
                  rx="14"
                  fill="#0b0f19"
                  stroke={isSelected ? '#818cf8' : borderColor}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2.0 : 1.5}
                />

                {/* Top Header Row inside Node */}
                <g transform="translate(10, 16)">
                  {/* Status Indicator Dot */}
                  <circle
                    cx="4"
                    cy="0"
                    r="4"
                    fill={isMastered ? '#10b981' : isBottleneck ? '#f43f5e' : isFrontier ? '#6366f1' : '#f59e0b'}
                    className={isFrontier ? 'animate-pulse' : undefined}
                  />
                  
                  {/* Status Pill Text */}
                  <text
                    x="14"
                    y="3.5"
                    fill={isMastered ? '#34d399' : isBottleneck ? '#fb7185' : isFrontier ? '#a5b4fc' : '#fbbf24'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {statusBadge.label.toUpperCase()}
                  </text>

                  {/* Phase Tag */}
                  <text
                    x={cardWidth - 26}
                    y="3.5"
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    Phase {node.depth}
                  </text>
                </g>

                {/* Concept Title */}
                <text
                  x="12"
                  y="40"
                  fill="#ffffff"
                  fontSize="11.5"
                  fontWeight="bold"
                  className="select-none"
                >
                  {node.title.length > 21 ? `${node.title.substring(0, 20)}...` : node.title}
                </text>

                {/* Mastery Progress Bar Container */}
                <g transform="translate(12, 54)">
                  {/* Background Bar */}
                  <rect
                    width={cardWidth - 24}
                    height="6"
                    rx="3"
                    fill="#1e293b"
                  />
                  {/* Filled Progress Bar */}
                  <rect
                    width={Math.max(4, (cardWidth - 24) * mastery)}
                    height="6"
                    rx="3"
                    fill={isMastered ? '#10b981' : isBottleneck ? '#f43f5e' : '#6366f1'}
                  />
                </g>

                {/* Bottom Row: P(L) score & Prerequisite Count */}
                <g transform="translate(12, 73)">
                  <text
                    x="0"
                    y="0"
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    P(L): <tspan fill="#ffffff" fontWeight="bold">{Math.round(mastery * 100)}%</tspan>
                  </text>

                  <text
                    x={cardWidth - 24}
                    y="0"
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="8.5"
                  >
                    {node.prerequisites.length > 0 ? `${node.prerequisites.length} Prereqs` : 'Root'}
                  </text>
                </g>

                {/* Frontier Glow Badge Icon */}
                {isFrontier && (
                  <g transform={`translate(${cardWidth - 14}, -4)`}>
                    <circle r="7" fill="#6366f1" className="animate-ping" opacity="0.6" />
                    <circle r="6" fill="#6366f1" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">★</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Canvas Quick Navigation Help */}
        <div className="absolute bottom-3 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center gap-2">
          <span>💡 Click & drag to pan • Scroll / +/- to zoom</span>
        </div>
      </div>

      {/* Slide-over Detailed Concept Inspector Drawer */}
      {selectedNode && (
        <div className="p-6 bg-slate-950 border-t border-slate-800/90 flex flex-col md:flex-row md:items-start justify-between gap-6 animate-in slide-in-from-bottom-3 duration-300 shadow-2xl">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{selectedNode.title}</span>
              </h3>

              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                selectedMastery >= 0.8
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : selectedMastery < 0.5
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                Mastery P(L): {Math.round(selectedMastery * 100)}%
              </span>

              {frontierNodeIds.has(selectedNode.id) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Ready to Practice (ZPD)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Learning Objectives Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Key Learning Objectives:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedNode.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites & Misconceptions row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Prerequisites:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.prerequisites.length > 0 ? (
                    selectedNode.prerequisites.map((p) => {
                      const pNode = graph.getNode(p);
                      const pMastery = student.conceptMastery[p] ?? 0.5;
                      return (
                        <button
                          key={p}
                          onClick={() => setSelectedNodeId(p)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono border hover:scale-105 transition-transform ${
                            pMastery >= 0.8
                              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {pNode?.title ?? p} ({Math.round(pMastery * 100)}%)
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-slate-300 font-mono">None (Foundational Root)</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500">Known Pitfalls:</span>{' '}
                <strong className="text-rose-300">{selectedNode.misconceptions.length} documented</strong>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => onStartPracticeConcept(selectedNode.id)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Practice This Concept</span>
            </button>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors text-center"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
