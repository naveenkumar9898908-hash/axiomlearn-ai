import React from 'react';
import { Badge, StudentProfile } from '../types';
import { ALL_BADGES, RewardEngine } from '../engine/rewards';
import { Trophy, X, Award, Flame, Zap, Star } from 'lucide-react';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!isOpen) return null;

  const earnedMap = new Map(student.earnedBadges.map((b) => [b.id, b]));
  const levelInfo = RewardEngine.calculateLevel(student.xp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Level and XP */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 flex-shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Level {levelInfo.level} Scholar
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Total XP: <strong className="text-amber-300 font-bold">{student.xp}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Student Rewards & Badges
            </h2>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Level {levelInfo.level} Progress</span>
            <span className="text-amber-400 font-bold">{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-500" /> Current Streak: <strong className="text-white">{student.streak}</strong></span>
            <span>Highest Streak: <strong className="text-white">{student.highestStreak}</strong></span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400">
            Earnable Badges ({student.earnedBadges.length} / {ALL_BADGES.length} Unlocked)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {ALL_BADGES.map((b) => {
              const isEarned = earnedMap.has(b.id);
              const earnedInfo = earnedMap.get(b.id);

              return (
                <div
                  key={b.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                    isEarned
                      ? 'bg-amber-950/20 border-amber-500/40 text-slate-200 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-2xl flex-shrink-0">
                    {b.icon}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{b.title}</h4>
                      {isEarned && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
