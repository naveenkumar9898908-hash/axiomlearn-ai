import React, { useState, useMemo, useEffect } from 'react';
import { PrerequisiteKnowledgeGraph } from '../engine/knowledgeGraph';
import { ConceptNode } from '../types';
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Sliders,
  RotateCcw,
  Check,
  Zap,
  ArrowUpDown,
  LayoutGrid,
  List,
  ShieldAlert,
  GraduationCap,
  HeartPulse,
  Award,
  ChevronRight
} from 'lucide-react';

export interface CohortStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  persona: 'fast_pacer' | 'steady' | 'prereq_blocked' | 'struggling';
  theta: number; // IRT ability [-2.5, +2.5]
  mastery: Record<string, number>;
  blockedByConceptId?: string;
  notes?: string;
  joinedDate: string;
}

interface TeacherCohortDashboardProps {
  graph: PrerequisiteKnowledgeGraph;
}

const STORAGE_KEY_COHORT = 'axiom_cohort_students_v2';

export const TeacherCohortDashboard: React.FC<TeacherCohortDashboardProps> = ({ graph }) => {
  const concepts = graph.getAllNodes();

  // Helper to generate seed students calibrated to the active syllabus concepts
  const generateInitialStudents = (): CohortStudent[] => {
    const seedData: Array<{
      name: string;
      email: string;
      persona: 'fast_pacer' | 'steady' | 'prereq_blocked' | 'struggling';
      theta: number;
      blockedIdx?: number;
      notes?: string;
    }> = [
      { name: 'Alex Vance', email: 'alex.vance@axiom.edu', persona: 'fast_pacer', theta: 1.85, notes: 'Excels across all syllabus tracks; candidate for advanced Olympiad challenges.' },
      { name: 'Maya Rodriguez', email: 'maya.rodriguez@axiom.edu', persona: 'prereq_blocked', theta: -0.35, blockedIdx: 1, notes: 'Struggles with foundational polynomial manipulation, causing blockage in higher calculus.' },
      { name: 'Liam Chen', email: 'liam.chen@axiom.edu', persona: 'struggling', theta: -1.15, blockedIdx: 0, notes: 'Needs scaffolding in basic arithmetic and algebraic signs.' },
      { name: 'Sophia Patel', email: 'sophia.patel@axiom.edu', persona: 'steady', theta: 0.45, notes: 'Consistent pacing; reviews hints and solutions thoughtfully.' },
      { name: 'Aarav Sharma', email: 'aarav.sharma@axiom.edu', persona: 'fast_pacer', theta: 1.60, notes: 'Rapid solver with high discrimination on Blooms Apply questions.' },
      { name: 'Noah Kim', email: 'noah.kim@axiom.edu', persona: 'steady', theta: 0.30, notes: 'Good grasp on linear equations; currently tackling limits.' },
      { name: 'Lucas Silva', email: 'lucas.silva@axiom.edu', persona: 'prereq_blocked', theta: -0.20, blockedIdx: 2, notes: 'Prerequisite gap in linear slope forms impeding derivative rules.' },
      { name: 'Isabella Rossi', email: 'isabella.rossi@axiom.edu', persona: 'steady', theta: 0.55, notes: 'Steady velocity; maintains high response accuracy.' },
      { name: 'Ethan Davis', email: 'ethan.davis@axiom.edu', persona: 'struggling', theta: -0.90, blockedIdx: 0, notes: 'Requires slow-paced micro-refresher sessions.' },
      { name: 'Olivia Taylor', email: 'olivia.taylor@axiom.edu', persona: 'steady', theta: 0.40, notes: 'Active in practice sessions; receptive to remediation paths.' },
      { name: 'Chloe Martin', email: 'chloe.martin@axiom.edu', persona: 'prereq_blocked', theta: -0.45, blockedIdx: 1, notes: 'Confuses binomial expansion with Freshman dream identity.' },
      { name: 'Daniel Brown', email: 'daniel.brown@axiom.edu', persona: 'fast_pacer', theta: 1.40, notes: 'Fast conceptual leap from algebra to calculus curves.' },
    ];

    return seedData.map((item, idx) => {
      const mastery: Record<string, number> = {};
      concepts.forEach((c, cIdx) => {
        if (item.persona === 'fast_pacer') {
          mastery[c.id] = Math.min(0.98, 0.78 + (idx % 3) * 0.06);
        } else if (item.persona === 'steady') {
          mastery[c.id] = c.depth <= 1 ? 0.82 : c.depth === 2 ? 0.62 : 0.42;
        } else if (item.persona === 'prereq_blocked') {
          const isBlockedConcept = item.blockedIdx !== undefined && cIdx === item.blockedIdx;
          const isDownstream = item.blockedIdx !== undefined && cIdx > item.blockedIdx;
          mastery[c.id] = isBlockedConcept ? 0.34 : isDownstream ? 0.22 : 0.76;
        } else {
          mastery[c.id] = Math.max(0.18, 0.42 - c.depth * 0.08);
        }
      });

      const initials = item.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

      return {
        id: `stu-${idx + 1}-${Date.now().toString(36)}`,
        name: item.name,
        email: item.email,
        avatar: initials,
        persona: item.persona,
        theta: item.theta,
        mastery,
        blockedByConceptId: item.blockedIdx !== undefined && concepts[item.blockedIdx] ? concepts[item.blockedIdx].id : undefined,
        notes: item.notes,
        joinedDate: '2026-09-01',
      };
    });
  };

  // State: Cohort student list loaded from localStorage or initialized
  const [students, setStudents] = useState<CohortStudent[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_COHORT);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse cohort from localStorage', err);
    }
    return generateInitialStudents();
  });

  // Save changes to localStorage whenever students array updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COHORT, JSON.stringify(students));
    } catch (err) {
      console.warn('Failed to save cohort to localStorage', err);
    }
  }, [students]);

  // UI Navigation & CRUD States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [personaFilter, setPersonaFilter] = useState<'all' | 'fast_pacer' | 'steady' | 'prereq_blocked' | 'struggling' | 'at_risk'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'mastery_desc' | 'mastery_asc' | 'theta_desc' | 'theta_asc'>('mastery_desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<CohortStudent | null>(null);
  const [inspectingStudent, setInspectingStudent] = useState<CohortStudent | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Create / Edit Student
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPersona, setFormPersona] = useState<'fast_pacer' | 'steady' | 'prereq_blocked' | 'struggling'>('steady');
  const [formTheta, setFormTheta] = useState<number>(0.15);
  const [formBlockedConceptId, setFormBlockedConceptId] = useState<string>('');
  const [formMastery, setFormMastery] = useState<Record<string, number>>({});
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pre-fill form when editing
  const handleOpenEdit = (student: CohortStudent) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormPersona(student.persona);
    setFormTheta(student.theta);
    setFormBlockedConceptId(student.blockedByConceptId || '');
    setFormMastery({ ...student.mastery });
    setFormNotes(student.notes || '');
    setFormError(null);
  };

  // Pre-fill form for new student
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormName('');
    setFormEmail('');
    setFormPersona('steady');
    setFormTheta(0.0);
    setFormBlockedConceptId('');
    const defaultMastery: Record<string, number> = {};
    concepts.forEach((c) => {
      defaultMastery[c.id] = c.depth === 0 ? 0.70 : c.depth === 1 ? 0.50 : 0.30;
    });
    setFormMastery(defaultMastery);
    setFormNotes('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Save student (Create or Update)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a valid student name.');
      return;
    }

    const initials = formName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'ST';

    if (editingStudent) {
      // UPDATE operation
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === editingStudent.id) {
            return {
              ...s,
              name: formName.trim(),
              email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@axiom.edu`,
              avatar: initials,
              persona: formPersona,
              theta: formTheta,
              blockedByConceptId: formBlockedConceptId || undefined,
              mastery: formMastery,
              notes: formNotes.trim(),
            };
          }
          return s;
        })
      );
      showToast(`✅ Successfully updated student: ${formName.trim()}`);
      setEditingStudent(null);
    } else {
      // CREATE operation
      const newStudent: CohortStudent = {
        id: `stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: formName.trim(),
        email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@axiom.edu`,
        avatar: initials,
        persona: formPersona,
        theta: formTheta,
        blockedByConceptId: formBlockedConceptId || undefined,
        mastery: formMastery,
        notes: formNotes.trim(),
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setStudents((prev) => [newStudent, ...prev]);
      showToast(`🎉 New student added to cohort: ${formName.trim()}`);
      setIsAddModalOpen(false);
    }
  };

  // DELETE operation
  const confirmDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setDeletingStudentId(null);
    if (inspectingStudent?.id === studentId) {
      setInspectingStudent(null);
    }
    showToast(`🗑️ Removed ${student?.name || 'student'} from cohort roster.`);
  };

  // Quick Action: Heal Prerequisite Gap for a student
  const handleHealGap = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.blockedByConceptId) {
          const updatedMastery = { ...s.mastery, [s.blockedByConceptId]: 0.88 };
          return {
            ...s,
            persona: s.persona === 'prereq_blocked' ? 'steady' : s.persona,
            theta: Math.min(2.5, s.theta + 0.4),
            mastery: updatedMastery,
            blockedByConceptId: undefined,
            notes: (s.notes ? s.notes + '\n' : '') + '• Foundational gap successfully remediated through targeted micro-practice.',
          };
        }
        return s;
      })
    );
    showToast('✨ Remediated prerequisite bottleneck! Mastery boosted & student unblocked.');
    if (inspectingStudent && inspectingStudent.id === studentId) {
      setInspectingStudent((prev) => prev ? {
        ...prev,
        persona: 'steady',
        theta: Math.min(2.5, prev.theta + 0.4),
        mastery: { ...prev.mastery, [prev.blockedByConceptId!]: 0.88 },
        blockedByConceptId: undefined,
      } : null);
    }
  };

  // Advance whole cohort simulation
  const handleSimulateClassStep = () => {
    setStudents((prev) =>
      prev.map((s) => {
        const updated = { ...s.mastery };
        concepts.forEach((c) => {
          const current = updated[c.id] ?? 0.5;
          const gain = s.persona === 'fast_pacer' ? 0.07 : s.persona === 'steady' ? 0.04 : 0.015;
          updated[c.id] = Math.min(0.98, current + gain);
        });
        return {
          ...s,
          theta: Math.min(2.5, s.theta + 0.05),
          mastery: updated,
        };
      })
    );
    showToast('🚀 Cohort session simulated: dynamic mastery gains recorded across all students.');
  };

  // Reset to default roster
  const handleResetRoster = () => {
    if (window.confirm('Reset cohort to default calibrated roster? This will restore 12 pre-configured test students.')) {
      const initial = generateInitialStudents();
      setStudents(initial);
      showToast('🔄 Cohort roster reset to default profiles.');
    }
  };

  // Helper for student average mastery
  const getStudentAvgMastery = (s: CohortStudent): number => {
    const vals = concepts.map((c) => s.mastery[c.id] ?? 0.5);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  // Cohort-wide metrics
  const classStats = useMemo(() => {
    if (students.length === 0) {
      return { avgMastery: 0, atRiskCount: 0, fastPacerCount: 0, blockedCount: 0 };
    }
    const studentAverages = students.map(getStudentAvgMastery);
    const overallAvg = studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length;
    const atRisk = students.filter((s) => getStudentAvgMastery(s) < 0.5 || s.blockedByConceptId).length;
    const fast = students.filter((s) => s.persona === 'fast_pacer').length;
    const blocked = students.filter((s) => !!s.blockedByConceptId).length;

    return {
      avgMastery: overallAvg,
      atRiskCount: atRisk,
      fastPacerCount: fast,
      blockedCount: blocked,
    };
  }, [students, concepts]);

  // Concept-level stats for systemic bottleneck detection
  const conceptStats = useMemo(() => {
    if (students.length === 0) return [];
    return concepts.map((c) => {
      const scores = students.map((s) => s.mastery[c.id] ?? 0.5);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const strugglingCount = scores.filter((v) => v < 0.5).length;
      return {
        concept: c,
        avgMastery: avg,
        strugglingPercent: Math.round((strugglingCount / students.length) * 100),
      };
    });
  }, [concepts, students]);

  const systemicBottleneck = useMemo(() => {
    if (conceptStats.length === 0) return null;
    return [...conceptStats].sort((a, b) => b.strugglingPercent - a.strugglingPercent)[0];
  }, [conceptStats]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q ||
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.blockedByConceptId && graph.getNode(s.blockedByConceptId)?.title.toLowerCase().includes(q));

        if (!matchesQuery) return false;

        if (personaFilter === 'all') return true;
        if (personaFilter === 'at_risk') return getStudentAvgMastery(s) < 0.5 || !!s.blockedByConceptId;
        return s.persona === personaFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'mastery_desc') return getStudentAvgMastery(b) - getStudentAvgMastery(a);
        if (sortBy === 'mastery_asc') return getStudentAvgMastery(a) - getStudentAvgMastery(b);
        if (sortBy === 'theta_desc') return b.theta - a.theta;
        if (sortBy === 'theta_asc') return a.theta - b.theta;
        return 0;
      });
  }, [students, searchQuery, personaFilter, sortBy, concepts, graph]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-2xl flex items-center gap-3 border border-indigo-400 animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-xs font-sans">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header & Instructor Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/70 px-2.5 py-0.5 rounded-full border border-indigo-800/60 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Instructor Intelligence Center
            </span>
            <span className="text-xs text-slate-400 font-mono">Active Roster: {students.length} Learners</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2.5 tracking-tight">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Class Cohort Management & Cognitive Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your classroom roster with full CRUD capabilities. Monitor real-time cognitive pacing, pinpoint isolated foundational bottlenecks, and assign adaptive micro-practice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          <button
            onClick={handleSimulateClassStep}
            title="Simulate class session progress across all students"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Session</span>
          </button>

          <button
            onClick={handleResetRoster}
            title="Reset cohort to default test roster"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Enrolled</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{students.length}</span>
            <span className="text-[11px] text-slate-400">students</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-purple-400 font-bold font-mono">{classStats.fastPacerCount}</span> fast pacers
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Class Avg Mastery</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${classStats.avgMastery >= 0.7 ? 'text-emerald-400' : classStats.avgMastery < 0.5 ? 'text-rose-400' : 'text-amber-400'}`}>
              {Math.round(classStats.avgMastery * 100)}%
            </span>
            <span className="text-[11px] text-slate-400">across syllabus</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Target benchmark: &gt;75%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Prereq Blocked</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{classStats.blockedCount}</span>
            <span className="text-[11px] text-slate-400">learners</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-400/90 font-medium">
            Tripped by foundational gaps
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>At-Risk Total</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">{classStats.atRiskCount}</span>
            <span className="text-[11px] text-slate-400">need remediation</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-400/80">
            {students.length > 0 ? Math.round((classStats.atRiskCount / students.length) * 100) : 0}% of cohort
          </div>
        </div>
      </div>

      {/* Systemic Bottleneck Warning Banner */}
      {systemicBottleneck && systemicBottleneck.strugglingPercent > 20 && (
        <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
              <span>Systemic Curriculum Bottleneck: &ldquo;{systemicBottleneck.concept.title}&rdquo;</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              <strong className="text-amber-300">{systemicBottleneck.strugglingPercent}% of your students</strong> are falling behind or blocked on this specific prerequisite. Unlocking this node will automatically accelerate downstream progress in{' '}
              <span className="text-indigo-300 font-semibold">
                {graph.getDirectDependents(systemicBottleneck.concept.id).map((d) => graph.getNode(d.id)?.title).filter(Boolean).join(', ') || 'subsequent units'}
              </span>.
            </p>
          </div>

          <button
            onClick={() => {
              setStudents((prev) =>
                prev.map((s) => {
                  if ((s.mastery[systemicBottleneck.concept.id] ?? 0.5) < 0.6 || s.blockedByConceptId === systemicBottleneck.concept.id) {
                    return {
                      ...s,
                      mastery: { ...s.mastery, [systemicBottleneck.concept.id]: 0.85 },
                      blockedByConceptId: s.blockedByConceptId === systemicBottleneck.concept.id ? undefined : s.blockedByConceptId,
                      theta: Math.min(2.5, s.theta + 0.25),
                    };
                  }
                  return s;
                })
              );
              showToast(`🎯 Conducted Targeted Class Workshop on ${systemicBottleneck.concept.title}!`);
            }}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-slate-950" />
            <span>Run Targeted Class Workshop</span>
          </button>
        </div>
      )}

      {/* Roster Controls: Search, Filters, Sort, View Toggle */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, email, or blocked concept..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="mastery_desc" className="bg-slate-900">Mastery: High → Low</option>
                <option value="mastery_asc" className="bg-slate-900">Mastery: Low → High</option>
                <option value="theta_desc" className="bg-slate-900">Ability θ: Highest</option>
                <option value="theta_asc" className="bg-slate-900">Ability θ: Lowest</option>
                <option value="name_asc" className="bg-slate-900">Name: A → Z</option>
                <option value="name_desc" className="bg-slate-900">Name: Z → A</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Students', count: students.length },
            { id: 'fast_pacer', label: 'Fast Pacers', count: students.filter((s) => s.persona === 'fast_pacer').length },
            { id: 'steady', label: 'Steady', count: students.filter((s) => s.persona === 'steady').length },
            { id: 'prereq_blocked', label: 'Prereq Blocked', count: students.filter((s) => s.persona === 'prereq_blocked').length },
            { id: 'struggling', label: 'Struggling', count: students.filter((s) => s.persona === 'struggling').length },
            { id: 'at_risk', label: 'At-Risk (<50%)', count: classStats.atRiskCount },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setPersonaFilter(pill.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                personaFilter === pill.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{pill.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${personaFilter === pill.id ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-400'}`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Roster Display (Table or Grid) */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">No students found matching your criteria</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clear filter pills, or add a new student using the button above.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setPersonaFilter('all'); }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-indigo-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Student</th>
                  <th className="p-3.5">Persona / Pace</th>
                  <th className="p-3.5 text-center">Ability θ</th>
                  <th className="p-3.5">Avg Mastery</th>
                  <th className="p-3.5">Prerequisite Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredStudents.map((s) => {
                  const avg = getStudentAvgMastery(s);
                  const isBlocked = !!s.blockedByConceptId;
                  const blockedConceptTitle = s.blockedByConceptId ? graph.getNode(s.blockedByConceptId)?.title : null;

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono border ${
                            s.persona === 'fast_pacer' ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' :
                            s.persona === 'steady' ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' :
                            s.persona === 'prereq_blocked' ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' :
                            'bg-rose-600/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {s.avatar}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block leading-tight">{s.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{s.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Persona Badge */}
                      <td className="p-3.5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border inline-flex items-center gap-1.5 ${
                          s.persona === 'fast_pacer' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                          s.persona === 'steady' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                          s.persona === 'prereq_blocked' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                          'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            s.persona === 'fast_pacer' ? 'bg-purple-400' :
                            s.persona === 'steady' ? 'bg-blue-400' :
                            s.persona === 'prereq_blocked' ? 'bg-amber-400' : 'bg-rose-400'
                          }`} />
                          {s.persona === 'fast_pacer' ? 'Fast Pacer' :
                           s.persona === 'steady' ? 'Steady Pacing' :
                           s.persona === 'prereq_blocked' ? 'Prereq Blocked' : 'Struggling'}
                        </span>
                      </td>

                      {/* Latent Ability θ */}
                      <td className="p-3.5 text-center font-mono font-bold">
                        <span className={s.theta >= 1.0 ? 'text-purple-400' : s.theta > 0 ? 'text-indigo-400' : s.theta >= -0.5 ? 'text-amber-400' : 'text-rose-400'}>
                          {s.theta > 0 ? `+${s.theta.toFixed(2)}` : s.theta.toFixed(2)}
                        </span>
                      </td>

                      {/* Mastery Progress Bar */}
                      <td className="p-3.5 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">Mastery</span>
                            <span className={`font-bold ${avg >= 0.75 ? 'text-emerald-400' : avg < 0.5 ? 'text-rose-400' : 'text-amber-400'}`}>
                              {Math.round(avg * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${avg >= 0.75 ? 'bg-emerald-500' : avg < 0.5 ? 'bg-rose-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.round(avg * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Prerequisite Status / Bottleneck */}
                      <td className="p-3.5">
                        {isBlocked ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60 font-semibold truncate max-w-[150px]" title={blockedConceptTitle || ''}>
                              ⚠️ {blockedConceptTitle || s.blockedByConceptId}
                            </span>
                            <button
                              onClick={() => handleHealGap(s.id)}
                              title="Remediate Prerequisite Bottleneck"
                              className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[10px] transition-colors cursor-pointer"
                            >
                              <Zap className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pacing On Track</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons (Inspect, Edit, Delete) */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectingStudent(s)}
                            title="Inspect Student Cognitive Map"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Student Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingStudentId(s.id)}
                            title="Remove Student from Cohort"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((s) => {
            const avg = getStudentAvgMastery(s);
            const isBlocked = !!s.blockedByConceptId;
            const blockedConceptTitle = s.blockedByConceptId ? graph.getNode(s.blockedByConceptId)?.title : null;

            return (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                {/* Card Top: Avatar & Persona */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold font-mono border shadow-sm ${
                        s.persona === 'fast_pacer' ? 'bg-purple-600/20 text-purple-300 border-purple-500/40' :
                        s.persona === 'steady' ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' :
                        s.persona === 'prereq_blocked' ? 'bg-amber-600/20 text-amber-300 border-amber-500/40' :
                        'bg-rose-600/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {s.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{s.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{s.email}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      s.persona === 'fast_pacer' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      s.persona === 'steady' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      s.persona === 'prereq_blocked' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {s.persona === 'fast_pacer' ? 'Fast Pacer' :
                       s.persona === 'steady' ? 'Steady' :
                       s.persona === 'prereq_blocked' ? 'Blocked' : 'Struggling'}
                    </span>
                  </div>

                  {/* Latent Ability & Mastery */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Ability θ</span>
                      <span className={`font-mono font-bold text-sm ${s.theta > 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {s.theta > 0 ? `+${s.theta.toFixed(2)}` : s.theta.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Avg Mastery</span>
                      <span className={`font-mono font-bold text-sm ${avg >= 0.75 ? 'text-emerald-400' : avg < 0.5 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {Math.round(avg * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Prerequisite Bottleneck Notice */}
                  {isBlocked ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 truncate">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate text-[11px]">Blocked: {blockedConceptTitle}</span>
                      </div>
                      <button
                        onClick={() => handleHealGap(s.id)}
                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        Heal
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 p-2 rounded-xl bg-slate-950/50 text-emerald-400 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Foundational prerequisites cleared</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setInspectingStudent(s)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                  >
                    <span>Inspect Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Student"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingStudentId(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT STUDENT */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  {editingStudent ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingStudent ? `Edit Learner: ${editingStudent.name}` : 'Add New Learner to Cohort'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingStudent ? 'Update ability, pace classification, and concept mastery' : 'Register a new student with baseline cognitive parameters'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingStudent(null); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Maya Rodriguez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email / Student ID</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. maya@axiom.edu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pacing Persona</label>
                  <select
                    value={formPersona}
                    onChange={(e) => setFormPersona(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="fast_pacer">Fast Pacer (Rapid mastery, high ability)</option>
                    <option value="steady">Steady (Uniform progress, on track)</option>
                    <option value="prereq_blocked">Prerequisite Blocked (Tripped by gap)</option>
                    <option value="struggling">Struggling (Low confidence, needs help)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Latent Ability θ (IRT):</label>
                    <span className="font-mono text-indigo-400 font-bold">{formTheta > 0 ? `+${formTheta.toFixed(2)}` : formTheta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.5"
                    max="2.5"
                    step="0.05"
                    value={formTheta}
                    onChange={(e) => setFormTheta(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>-2.5 (Struggling)</span>
                    <span>0.0 (Average)</span>
                    <span>+2.5 (Prodigy)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Active Prerequisite Bottleneck (Optional)</label>
                <select
                  value={formBlockedConceptId}
                  onChange={(e) => setFormBlockedConceptId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">None (No active bottleneck)</option>
                  {concepts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (Phase {c.depth})
                    </option>
                  ))}
                </select>
              </div>

              {/* Concept Mastery Adjuster */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Fine-tune Concept Mastery Levels</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Sliders update probability of mastery P(L)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                  {concepts.map((c) => {
                    const currentVal = Math.round((formMastery[c.id] ?? 0.5) * 100);
                    return (
                      <div key={c.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 truncate max-w-[140px]">{c.title}</span>
                          <span className={`font-mono font-bold ${currentVal >= 75 ? 'text-emerald-400' : currentVal < 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {currentVal}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="0.99"
                          step="0.05"
                          value={formMastery[c.id] ?? 0.5}
                          onChange={(e) =>
                            setFormMastery((prev) => ({
                              ...prev,
                              [c.id]: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full accent-indigo-500 h-1 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Teacher Notes / Observations</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Needs extra practice on negative signs before advancing to linear equations."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingStudent(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT STUDENT COGNITIVE PROFILE */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold font-mono border shadow-md ${
                  inspectingStudent.persona === 'fast_pacer' ? 'bg-purple-600/20 text-purple-300 border-purple-500/40' :
                  inspectingStudent.persona === 'steady' ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' :
                  inspectingStudent.persona === 'prereq_blocked' ? 'bg-amber-600/20 text-amber-300 border-amber-500/40' :
                  'bg-rose-600/20 text-rose-300 border-rose-500/40'
                }`}>
                  {inspectingStudent.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{inspectingStudent.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      inspectingStudent.persona === 'fast_pacer' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      inspectingStudent.persona === 'steady' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      inspectingStudent.persona === 'prereq_blocked' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {inspectingStudent.persona.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{inspectingStudent.email} • Enrolled: {inspectingStudent.joinedDate}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">IRT Ability θ</span>
                <span className="text-lg font-bold font-mono text-indigo-400">
                  {inspectingStudent.theta > 0 ? `+${inspectingStudent.theta.toFixed(2)}` : inspectingStudent.theta.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Avg Mastery</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {Math.round(getStudentAvgMastery(inspectingStudent) * 100)}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Bottleneck</span>
                <span className="text-xs font-bold text-amber-400 truncate block mt-1">
                  {inspectingStudent.blockedByConceptId ? graph.getNode(inspectingStudent.blockedByConceptId)?.title : 'None'}
                </span>
              </div>
            </div>

            {/* Bottleneck Diagnostic Banner if Blocked */}
            {inspectingStudent.blockedByConceptId && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Isolated Prerequisite Misconception</span>
                  </div>
                  <button
                    onClick={() => handleHealGap(inspectingStudent.id)}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Heal Prerequisite Gap</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The learner is blocked on <strong>{graph.getNode(inspectingStudent.blockedByConceptId)?.title}</strong> with an estimated mastery of{' '}
                  <span className="text-rose-400 font-mono font-bold">{Math.round((inspectingStudent.mastery[inspectingStudent.blockedByConceptId] ?? 0.35) * 100)}%</span>.
                  Downstream topics require this foundational concept before advanced learning can resume.
                </p>
              </div>
            )}

            {/* Concept Mastery Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Syllabus Mastery Map
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {concepts.map((c) => {
                  const m = inspectingStudent.mastery[c.id] ?? 0.5;
                  const pct = Math.round(m * 100);
                  const isBlocked = inspectingStudent.blockedByConceptId === c.id;

                  return (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{c.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Phase {c.depth}</span>
                          {isBlocked && (
                            <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-mono">
                              CRITICAL GAP
                            </span>
                          )}
                        </div>
                        <span className={`font-mono font-bold ${pct >= 75 ? 'text-emerald-400' : pct < 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct < 50 ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teacher Notes */}
            {inspectingStudent.notes && (
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Teacher Notes</span>
                <p className="text-xs text-slate-300 italic whitespace-pre-line">{inspectingStudent.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const toDelete = inspectingStudent.id;
                  setInspectingStudent(null);
                  setDeletingStudentId(toDelete);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Student</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toEdit = inspectingStudent;
                    setInspectingStudent(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => setInspectingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Remove Student from Roster?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete{' '}
                <strong className="text-slate-200">
                  {students.find((s) => s.id === deletingStudentId)?.name || 'this student'}
                </strong>{' '}
                from the classroom cohort? All mastery tracking for this student will be removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteStudent(deletingStudentId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
