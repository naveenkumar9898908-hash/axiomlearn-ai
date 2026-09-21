import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { AdaptivePracticeArena } from './components/AdaptivePracticeArena';
import { MisconceptionDiagnosticModal } from './components/MisconceptionDiagnosticModal';
import { MicroPracticeRunner } from './components/MicroPracticeRunner';
import { ModelInspector } from './components/ModelInspector';
import { TeacherCohortDashboard } from './components/TeacherCohortDashboard';
import { BadgesModal } from './components/BadgesModal';
import { LoginPage } from './components/LoginPage';

import { getCurriculum } from './data/curriculumData';
import { PrerequisiteKnowledgeGraph } from './engine/knowledgeGraph';
import { DeepKnowledgeTracer, DKTState } from './engine/dkt';
import { RootCauseDiagnosticEngine } from './engine/diagnostic';
import { MicroPracticeGenerator } from './engine/microPractice';
import { RewardEngine } from './engine/rewards';
import { BKTUpdateResult } from './engine/bkt';
import { AuthService } from './services/authService';
import { StudentProfile, Question, DiagnosticResult, InteractionRecord, UserAccount, ThemeMode } from './types';
import { Sparkles, Network, Compass, BrainCircuit, AlertTriangle, Trophy, Radio } from 'lucide-react';
import { CyberHudCenterpiece } from './components/CyberHudCenterpiece';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => AuthService.getCurrentUser());
  const [selectedDomain, setSelectedDomain] = useState<'mathematics' | 'computer_science'>('mathematics');
  const [activeTab, setActiveTab] = useState<'graph' | 'arena' | 'remediation' | 'inspector' | 'cohort'>('graph');
  const [targetedConceptId, setTargetedConceptId] = useState<string | null>(null);
  const [activeDiagnostic, setActiveDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [newBadgeToast, setNewBadgeToast] = useState<string | null>(null);
  const [showCenterpiece, setShowCenterpiece] = useState<boolean>(true);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('axiom_theme_mode');
    return (saved as ThemeMode) || 'cyber_hud';
  });

  useEffect(() => {
    localStorage.setItem('axiom_theme_mode', themeMode);
  }, [themeMode]);

  // Load active curriculum package
  const curriculum = useMemo(() => getCurriculum(selectedDomain), [selectedDomain]);

  // Instantiate Prerequisite Graph (DAG)
  const graph = useMemo(
    () => new PrerequisiteKnowledgeGraph(curriculum.concepts, curriculum.edges),
    [curriculum]
  );

  // Instantiate Diagnostic Engine & Micro-Practice Generator
  const diagnosticEngine = useMemo(
    () => new RootCauseDiagnosticEngine(graph),
    [graph]
  );

  const microPracticeGen = useMemo(
    () => new MicroPracticeGenerator(graph, curriculum.questions),
    [graph, curriculum.questions]
  );

  // Instantiate Deep Knowledge Tracer (DKT)
  const conceptIds = useMemo(() => curriculum.concepts.map((c) => c.id), [curriculum]);
  const dkt = useMemo(() => new DeepKnowledgeTracer(conceptIds, 32), [conceptIds]);

  // Initial student profile fallback
  const createInitialStudent = (domain: string): StudentProfile => {
    const defaultMastery: Record<string, number> = {};
    curriculum.concepts.forEach((c) => {
      // Foundational depth 0 starts with higher prior; higher depths start lower
      defaultMastery[c.id] = c.depth === 0 ? 0.72 : c.depth === 1 ? 0.55 : 0.25;
    });

    return {
      id: currentUser ? currentUser.profile.id : `student-alpha`,
      name: currentUser ? currentUser.name : 'Alex Vance',
      avatar: currentUser ? currentUser.profile.avatar : 'AV',
      theta: 0.15, // Competent baseline
      conceptMastery: defaultMastery,
      interactionHistory: [],
      activeMicroPath: null,
      resolvedMisconceptions: [],
      xp: 150,
      level: 1,
      streak: 0,
      highestStreak: 0,
      earnedBadges: [],
    };
  };

  const [student, setStudent] = useState<StudentProfile>(() => {
    const active = AuthService.getCurrentUser();
    return active ? active.profile : createInitialStudent(selectedDomain);
  });

  const [dktState, setDktState] = useState<DKTState | null>(() => dkt.getInitialState());

  // Adapt concepts when domain switches while preserving user XP, streaks, and badges
  useEffect(() => {
    setDktState(dkt.getInitialState());
    setTargetedConceptId(null);
    setActiveDiagnostic(null);
    setStudent((prev) => {
      const updatedMastery = { ...prev.conceptMastery };
      let hasChanges = false;
      curriculum.concepts.forEach((c) => {
        if (updatedMastery[c.id] === undefined) {
          updatedMastery[c.id] = c.depth === 0 ? 0.72 : c.depth === 1 ? 0.55 : 0.25;
          hasChanges = true;
        }
      });
      if (!hasChanges) return prev;
      const updated = { ...prev, conceptMastery: updatedMastery };
      AuthService.updateActiveUserProfile(updated);
      return updated;
    });
  }, [selectedDomain, curriculum, dkt]);

  // Record student interaction from Adaptive Arena & calculate rewards
  const handleRecordInteraction = (
    question: Question,
    selectedOptionId: string,
    isCorrect: boolean,
    responseTimeMs: number,
    bktResult: BKTUpdateResult,
    newTheta: number
  ) => {
    // 1. Update DKT recurrent state
    if (dktState) {
      const nextDktState = dkt.step(dktState, question.conceptId, isCorrect);
      setDktState(nextDktState);
    }

    // 2. Update Student Profile & Gamification Rewards
    setStudent((prev) => {
      const updatedMastery = {
        ...prev.conceptMastery,
        [question.conceptId]: bktResult.pL_next,
      };

      const record: InteractionRecord = {
        id: `inter-${Date.now()}`,
        timestamp: Date.now(),
        conceptId: question.conceptId,
        questionId: question.id,
        isCorrect,
        responseTimeMs,
        selectedOptionId,
        estimatedAbilityBefore: prev.theta,
        estimatedAbilityAfter: newTheta,
        bktMasteryBefore: bktResult.pL_prior,
        bktMasteryAfter: bktResult.pL_next,
        dktMasteryAfter: dktState?.masteryPredictions[question.conceptId],
      };

      // Process rewards & streak
      const reward = RewardEngine.processInteraction(
        prev,
        question,
        isCorrect,
        responseTimeMs,
        bktResult.pL_next,
        newTheta
      );

      const totalXp = prev.xp + reward.earnedXp;
      const levelData = RewardEngine.calculateLevel(totalXp);
      const allBadges = [...prev.earnedBadges, ...reward.newBadges];

      if (reward.newBadges.length > 0) {
        setNewBadgeToast(`🏆 Badge Unlocked: ${reward.newBadges[0].title}! (${reward.newBadges[0].description})`);
        setTimeout(() => setNewBadgeToast(null), 5000);
      }

      const updatedStudent: StudentProfile = {
        ...prev,
        theta: newTheta,
        xp: totalXp,
        level: levelData.level,
        streak: reward.newStreak,
        highestStreak: Math.max(prev.highestStreak, reward.newStreak),
        earnedBadges: allBadges,
        conceptMastery: updatedMastery,
        interactionHistory: [...prev.interactionHistory, record],
      };
      AuthService.updateActiveUserProfile(updatedStudent);
      return updatedStudent;
    });
  };

  // Trigger Root-Cause Misconception Diagnostic
  const handleTriggerDiagnostic = (question: Question, selectedOptionId: string) => {
    const diag = diagnosticEngine.diagnoseError(
      question.conceptId,
      question,
      selectedOptionId,
      student.conceptMastery
    );
    setActiveDiagnostic(diag);
  };

  // Launch Micro-Practice Path from Diagnostic
  const handleLaunchMicroPath = (diag: DiagnosticResult) => {
    const path = microPracticeGen.generatePath(diag);
    setStudent((prev) => ({
      ...prev,
      activeMicroPath: path,
    }));
    setActiveTab('remediation');
  };

  // Advance / complete micro-practice step
  const handleCompleteStep = (stepIndex: number, wasCorrect: boolean) => {
    if (!student.activeMicroPath) return;

    setStudent((prev) => {
      if (!prev.activeMicroPath) return prev;
      const updatedSteps = [...prev.activeMicroPath.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        completed: true,
        wasCorrect,
      };

      const nextIndex = Math.min(updatedSteps.length - 1, stepIndex + 1);

      return {
        ...prev,
        activeMicroPath: {
          ...prev.activeMicroPath,
          steps: updatedSteps,
          currentStepIndex: nextIndex,
        },
      };
    });
  };

  // Finish micro-practice path: boost mastery on root and target concepts + Mega XP Reward!
  const handleFinishPath = () => {
    if (!student.activeMicroPath) return;

    const rootId = student.activeMicroPath.rootCauseConceptId;
    const targetId = student.activeMicroPath.targetConceptId;

    setStudent((prev) => {
      const updated = { ...prev.conceptMastery };
      updated[rootId] = Math.min(0.95, (updated[rootId] ?? 0.5) + 0.3);
      updated[targetId] = Math.min(0.95, (updated[targetId] ?? 0.5) + 0.25);

      const microReward = RewardEngine.processMicroPathCompletion(prev);
      const totalXp = prev.xp + microReward.earnedXp;
      const levelData = RewardEngine.calculateLevel(totalXp);
      const allBadges = [...prev.earnedBadges, ...microReward.newBadges];

      if (microReward.newBadges.length > 0) {
        setNewBadgeToast(`🧠 Mega Achievement Unlocked: Gap Healer! (+200 XP Awarded)`);
        setTimeout(() => setNewBadgeToast(null), 5000);
      }

      const updatedStudent: StudentProfile = {
        ...prev,
        theta: Math.min(2.5, prev.theta + 0.35),
        xp: totalXp,
        level: levelData.level,
        earnedBadges: allBadges,
        conceptMastery: updated,
        activeMicroPath: null,
      };
      AuthService.updateActiveUserProfile(updatedStudent);
      return updatedStudent;
    });

    setActiveTab('graph');
  };

  const handleStartPracticeConcept = (conceptId: string) => {
    setTargetedConceptId(conceptId);
    setActiveTab('arena');
  };

  // Quick Demo Trigger: Simulate an intentional misconception error on Chain Rule or BST
  const triggerDemoMisconception = () => {
    let question: Question | undefined;
    let wrongOptionId = '';

    if (selectedDomain === 'mathematics') {
      question = curriculum.questions.find((q) => q.id === 'q-poly-1'); // Freshman's dream
    } else {
      question = curriculum.questions.find((q) => q.id === 'q-cs-bst-1'); // Local BST flaw
    }

    if (question) {
      const misconceptionOpt = question.options.find((o) => !o.isCorrect && o.misconceptionId);
      wrongOptionId = misconceptionOpt?.id || question.options.find((o) => !o.isCorrect)?.id || '';
      handleTriggerDiagnostic(question, wrongOptionId);
    }
  };

  // Launch sample micro-practice demo directly from MicroPractice tab
  const handleLaunchSamplePath = () => {
    let question: Question | undefined;
    let wrongOptionId = '';

    if (selectedDomain === 'mathematics') {
      question = curriculum.questions.find((q) => q.id === 'q-poly-1');
    } else {
      question = curriculum.questions.find((q) => q.id === 'q-cs-bst-1');
    }

    if (question) {
      const misconceptionOpt = question.options.find((o) => !o.isCorrect && o.misconceptionId);
      wrongOptionId = misconceptionOpt?.id || question.options.find((o) => !o.isCorrect)?.id || '';
      const diag = diagnosticEngine.diagnoseError(
        question.conceptId,
        question,
        wrongOptionId,
        student.conceptMastery
      );
      handleLaunchMicroPath(diag);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  // If not logged in, render unique persona-driven glassmorphic LoginPage
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setStudent(user.profile);
        }}
      />
    );
  }

  const isCyber = themeMode === 'cyber_hud';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col relative ${
        isCyber
          ? 'bg-[#020b18] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 cyber-scanlines'
          : themeMode === 'quantum_neon'
          ? 'bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white'
          : 'bg-black text-slate-200 selection:bg-emerald-500 selection:text-black'
      }`}
    >
      {/* Background Cyber-Grid Layer */}
      {isCyber && (
        <div className="fixed inset-0 cyber-grid-bg opacity-25 pointer-events-none -z-10" />
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        student={student}
        currentUser={currentUser}
        onResetStudent={() => {
          const reset = createInitialStudent(selectedDomain);
          setStudent(reset);
          setDktState(dkt.getInitialState());
          setTargetedConceptId(null);
          setActiveDiagnostic(null);
          AuthService.updateActiveUserProfile(reset);
        }}
        hasActiveMicroPath={!!student.activeMicroPath}
        onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
        onLogout={handleLogout}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        showCenterpiece={showCenterpiece}
        setShowCenterpiece={setShowCenterpiece}
      />

      {/* Floating Badge Toast */}
      {newBadgeToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border-2 border-yellow-300">
          <Trophy className="w-6 h-6 animate-bounce text-slate-950" />
          <span className="text-xs font-mono">{newBadgeToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* 3D Dynamic Cyber-HUD Core (Toggleable Centerpiece) */}
        {showCenterpiece && (
          <div className="relative rounded-3xl overflow-hidden bg-slate-950/80 border border-cyan-500/40 shadow-2xl animate-pop-in">
            {/* Tactical Corner Reticle Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />

            {/* Tactical Header Bar */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#031326]/90 border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>3D CYBER-HUD CORE // REALTIME COGNITIVE TELEMETRY</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-cyan-400/80 hidden sm:inline">
                  Interactive 3D Parallax Gyroscope
                </span>
                <button
                  onClick={() => setShowCenterpiece(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  ✕ Minimize
                </button>
              </div>
            </div>

            <CyberHudCenterpiece
              student={student}
              onToggleAmbient={() => setShowCenterpiece(false)}
            />
          </div>
        )}

        {/* Quick Demo Assist Banner */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl text-xs border ${
            isCyber
              ? 'bg-[#031429]/80 border-cyan-500/30 text-cyan-200'
              : 'bg-indigo-950/30 border-indigo-500/20 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isCyber ? 'text-cyan-400' : 'text-indigo-400'}`} />
            <span>
              <strong>TENSORA 2026 Cyber-Cognition System:</strong> Real-time BKT updates, backward DAG traversal, and 4-step micro-remediation.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBadgesModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-all cursor-pointer"
            >
              <span>🏆 Badges & Level ({student.xp} XP)</span>
            </button>
            <button
              onClick={triggerDemoMisconception}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 font-semibold transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Misconception Failure</span>
            </button>
            <button
              onClick={() => {
                setTargetedConceptId(null);
                setActiveTab('arena');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm cursor-pointer ${
                isCyber
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Launch Adaptive Quiz</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Prerequisite Knowledge Graph */}
        {activeTab === 'graph' && (
          <KnowledgeGraphView
            graph={graph}
            student={student}
            onSelectConcept={(cid) => setTargetedConceptId(cid)}
            onStartPracticeConcept={handleStartPracticeConcept}
          />
        )}

        {/* Tab 2: Adaptive Practice Arena */}
        {activeTab === 'arena' && (
          <AdaptivePracticeArena
            graph={graph}
            questions={curriculum.questions}
            student={student}
            onRecordInteraction={handleRecordInteraction}
            onTriggerDiagnostic={handleTriggerDiagnostic}
            targetConceptId={targetedConceptId}
          />
        )}

        {/* Tab 3: Micro-Practice Remediation Runner */}
        {activeTab === 'remediation' && (
          <MicroPracticeRunner
            path={student.activeMicroPath || null}
            graph={graph}
            student={student}
            onCompleteStep={handleCompleteStep}
            onFinishPath={handleFinishPath}
            onCancelPath={() => setStudent((p) => ({ ...p, activeMicroPath: null }))}
            onLaunchSamplePath={handleLaunchSamplePath}
            onGoToGraph={() => setActiveTab('graph')}
            onGoToArena={() => {
              setTargetedConceptId(null);
              setActiveTab('arena');
            }}
          />
        )}

        {/* Tab 4: AI Model Telemetry & Inspector */}
        {activeTab === 'inspector' && (
          <ModelInspector
            graph={graph}
            student={student}
            dktState={dktState}
          />
        )}

        {/* Tab 5: Instructor / Cohort Analytics */}
        {activeTab === 'cohort' && (
          <TeacherCohortDashboard graph={graph} />
        )}
      </main>

      {/* Root-Cause Misconception Diagnostic Modal */}
      <MisconceptionDiagnosticModal
        diagnostic={activeDiagnostic}
        onClose={() => setActiveDiagnostic(null)}
        onLaunchMicroPath={handleLaunchMicroPath}
        graph={graph}
      />

      {/* Badges & Rewards Modal */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        student={student}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-500 font-mono">
        AxiomLearn AI • TENSORA 2026 Problem Statement [EDU-01] • Powered by BKT (Corbett-Anderson), DKT (Piech et al.) & 2PL IRT
      </footer>
    </div>
  );
};
