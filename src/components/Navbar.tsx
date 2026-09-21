import { StudentProfile, UserAccount, ThemeMode } from '../types';
import {
  Brain,
  Network,
  Compass,
  Activity,
  Users,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  BookOpen,
  LogOut,
  User,
  Crosshair,
  Palette,
  Eye,
  Radio
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'graph' | 'arena' | 'remediation' | 'inspector' | 'cohort';
  setActiveTab: (tab: 'graph' | 'arena' | 'remediation' | 'inspector' | 'cohort') => void;
  selectedDomain: 'mathematics' | 'computer_science';
  setSelectedDomain: (domain: 'mathematics' | 'computer_science') => void;
  student: StudentProfile;
  currentUser: UserAccount;
  onResetStudent: () => void;
  hasActiveMicroPath: boolean;
  onOpenBadgesModal: () => void;
  onLogout: () => void;
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;
  showCenterpiece: boolean;
  setShowCenterpiece: (show: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedDomain,
  setSelectedDomain,
  student,
  currentUser,
  onResetStudent,
  hasActiveMicroPath,
  onOpenBadgesModal,
  onLogout,
  themeMode,
  setThemeMode,
  showCenterpiece,
  setShowCenterpiece,
}) => {
  // Compute overall average mastery across tracked concepts
  const masteryValues = Object.values(student.conceptMastery);
  const avgMastery = masteryValues.length > 0
    ? Math.round((masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length) * 100)
    : 0;

  // Ability tier label based on theta
  const getAbilityTier = (theta: number) => {
    if (theta >= 1.5) return { label: 'Master', color: 'text-purple-400 bg-purple-950/60 border-purple-800/60' };
    if (theta >= 0.6) return { label: 'Proficient', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60' };
    if (theta >= -0.2) return { label: 'Competent', color: 'text-blue-400 bg-blue-950/60 border-blue-800/60' };
    if (theta >= -1.0) return { label: 'Developing', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
    return { label: 'Foundational', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
  };

  const abilityTier = getAbilityTier(student.theta);

  const isCyber = themeMode === 'cyber_hud';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-300 px-4 lg:px-8 py-3 ${
        isCyber
          ? 'bg-[#020b18]/95 border-b border-cyan-500/30 shadow-[0_4px_25px_rgba(0,245,255,0.15)]'
          : 'bg-slate-900/90 border-b border-slate-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Domain Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                isCyber
                  ? 'bg-gradient-to-br from-cyan-400 to-teal-600 shadow-cyan-500/30 text-slate-950 animate-cyber-glow'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25 text-white'
              }`}
            >
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${isCyber ? 'text-white text-glow-cyan' : 'text-white'}`}>
                  AxiomLearn
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono border ${
                      isCyber
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {isCyber ? 'CYBER-HUD' : 'EDU-01'}
                  </span>
                </h1>
              </div>
              <p className={`text-xs font-mono ${isCyber ? 'text-cyan-400/70' : 'text-slate-400'}`}>
                Adaptive Knowledge Tracing & Root-Cause Remediation
              </p>
            </div>
          </div>

          {/* Domain Dropdown for mobile */}
          <div className="md:hidden">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mathematics">📐 Math & Calculus</option>
              <option value="computer_science">💻 CS & Algorithms</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          className={`flex items-center space-x-1 p-1 rounded-xl border overflow-x-auto ${
            isCyber
              ? 'bg-[#031326]/90 border-cyan-500/40 shadow-inner'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'graph'
                ? isCyber
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-cyan-500/40'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isCyber
                ? 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Concept Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('arena')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'arena'
                ? isCyber
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-cyan-500/40'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isCyber
                ? 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Adaptive Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('remediation')}
            className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'remediation'
                ? isCyber
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold shadow-md shadow-amber-500/40'
                  : 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : isCyber
                ? 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Micro-Practice</span>
            {hasActiveMicroPath && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'inspector'
                ? isCyber
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-cyan-500/40'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isCyber
                ? 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>BKT / DKT Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('cohort')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'cohort'
                ? isCyber
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-cyan-500/40'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isCyber
                ? 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Class Cohort</span>
          </button>
        </nav>

        {/* Student Stats, 3D HUD Toggle & Theme Switcher (Desktop) */}
        <div className="flex items-center space-x-2.5">
          {/* 3D HUD Core Toggle Button */}
          <button
            onClick={() => setShowCenterpiece(!showCenterpiece)}
            title={showCenterpiece ? 'Minimize 3D HUD Core' : 'Expand 3D Cyber-HUD Core'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              showCenterpiece
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                : 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${showCenterpiece ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">3D HUD Core</span>
          </button>

          {/* Theme Switcher Pill */}
          <div className="relative group">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono transition-all cursor-pointer"
              title="Switch Visual Theme"
            >
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline capitalize">{themeMode.replace('_', ' ')}</span>
            </button>
            <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl p-2 hidden group-hover:block z-50 animate-pop-in">
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-extrabold px-2 py-1 tracking-wider">
                Visual Theme
              </div>
              <button
                onClick={() => setThemeMode('cyber_hud')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                  themeMode === 'cyber_hud' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🌐 Cyber-HUD</span>
                {themeMode === 'cyber_hud' && <span className="text-cyan-400 font-bold">✓</span>}
              </button>
              <button
                onClick={() => setThemeMode('quantum_neon')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                  themeMode === 'quantum_neon' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🔮 Quantum</span>
                {themeMode === 'quantum_neon' && <span className="text-indigo-400 font-bold">✓</span>}
              </button>
              <button
                onClick={() => setThemeMode('stealth_dark')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                  themeMode === 'stealth_dark' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🛸 Stealth</span>
                {themeMode === 'stealth_dark' && <span className="text-emerald-400 font-bold">✓</span>}
              </button>
            </div>
          </div>

          {/* Domain Selector Button */}
          <div className="hidden md:flex items-center bg-slate-950/60 rounded-xl p-0.5 border border-slate-800">
            <button
              onClick={() => setSelectedDomain('mathematics')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDomain === 'mathematics'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📐 Calculus
            </button>
            <button
              onClick={() => setSelectedDomain('computer_science')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDomain === 'computer_science'
                  ? 'bg-slate-800 text-indigo-300 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💻 CS
            </button>
          </div>

          {/* Rewards, XP & Streak Capsule */}
          <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
            {/* Streak */}
            {student.streak > 0 && (
              <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold border-r border-slate-800 pr-2">
                <span className="animate-bounce">🔥</span>
                <span>{student.streak}</span>
              </div>
            )}

            {/* XP and Level */}
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 rounded border border-amber-800/60">
                  Lv {student.level}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {student.xp} XP
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono justify-end">
                <span>Mastery:</span>
                <span className="font-bold text-emerald-400">{avgMastery}%</span>
              </div>
            </div>

            {/* Badges Trophy Button */}
            <button
              onClick={onOpenBadgesModal}
              title="View Badges & Achievements"
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1 text-xs font-mono font-bold"
            >
              <span>🏆</span>
              <span>{student.earnedBadges.length}</span>
            </button>

            <button
              onClick={onResetStudent}
              title="Reset student learning state"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Account & Logout */}
          <div className="flex items-center space-x-2 bg-slate-950/80 pl-2.5 pr-1.5 py-1 rounded-xl border border-slate-800">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[11px] font-bold text-indigo-300">
              {currentUser.profile.avatar}
            </div>
            <div className="hidden lg:block text-left pr-1">
              <span className="text-xs font-bold text-white block leading-tight truncate max-w-[90px]">
                {currentUser.name}
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out / Switch User"
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
