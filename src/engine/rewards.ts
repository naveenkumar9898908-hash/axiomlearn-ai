import { Badge, Question, StudentProfile } from '../types';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_correct',
    title: 'First Step',
    description: 'Answered your first practice question correctly.',
    icon: '🎯',
  },
  {
    id: 'streak_3',
    title: 'Hot Streak',
    description: 'Achieved a streak of 3 consecutive correct answers.',
    icon: '🔥',
  },
  {
    id: 'streak_5',
    title: 'Cognition Master',
    description: 'Achieved an outstanding 5-question answer streak!',
    icon: '⚡',
  },
  {
    id: 'speed_demon',
    title: 'Quick Wit',
    description: 'Answered a challenging question correctly in under 10 seconds.',
    icon: '⏱️',
  },
  {
    id: 'misconception_cured',
    title: 'Gap Healer',
    description: 'Completed a 4-step Micro-Practice Path and eliminated a prerequisite bottleneck.',
    icon: '🧠',
  },
  {
    id: 'mastery_achieved',
    title: 'Concept Master',
    description: 'Reached 85% or higher Bayesian Knowledge Tracing mastery on a concept.',
    icon: '🏆',
  },
  {
    id: 'high_ability',
    title: 'High Achiever',
    description: 'Estimated latent ability θ exceeded +1.0 in Item Response Theory.',
    icon: '🌟',
  },
];

export interface RewardCalculation {
  earnedXp: number;
  breakdown: {
    base: number;
    streakBonus: number;
    difficultyBonus: number;
    speedBonus: number;
  };
  newStreak: number;
  newBadges: Badge[];
}

export class RewardEngine {
  public static calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
    const xpPerLevel = 250;
    const level = 1 + Math.floor(xp / xpPerLevel);
    const currentXp = xp % xpPerLevel;
    const progress = currentXp / xpPerLevel;
    return {
      level,
      currentXp,
      nextLevelXp: xpPerLevel,
      progress,
    };
  }

  public static processInteraction(
    student: StudentProfile,
    question: Question,
    isCorrect: boolean,
    responseTimeMs: number,
    newMastery: number,
    newTheta: number
  ): RewardCalculation {
    if (!isCorrect) {
      return {
        earnedXp: 10, // Participation XP
        breakdown: { base: 10, streakBonus: 0, difficultyBonus: 0, speedBonus: 0 },
        newStreak: 0,
        newBadges: [],
      };
    }

    const newStreak = student.streak + 1;
    const base = 50;
    const streakBonus = Math.min(60, (newStreak - 1) * 15);
    const difficultyBonus = Math.max(0, Math.round(question.difficulty * 25));
    const speedBonus = responseTimeMs < 10000 ? 20 : 0;

    const earnedXp = base + streakBonus + difficultyBonus + speedBonus;

    // Check newly unlocked badges
    const earnedIds = new Set(student.earnedBadges.map((b) => b.id));
    const newBadges: Badge[] = [];

    const tryUnlock = (badgeId: string) => {
      if (!earnedIds.has(badgeId)) {
        const found = ALL_BADGES.find((b) => b.id === badgeId);
        if (found) {
          newBadges.push({ ...found, unlockedAt: Date.now() });
          earnedIds.add(badgeId);
        }
      }
    };

    tryUnlock('first_correct');
    if (newStreak >= 3) tryUnlock('streak_3');
    if (newStreak >= 5) tryUnlock('streak_5');
    if (responseTimeMs < 10000) tryUnlock('speed_demon');
    if (newMastery >= 0.85) tryUnlock('mastery_achieved');
    if (newTheta >= 1.0) tryUnlock('high_ability');

    return {
      earnedXp,
      breakdown: {
        base,
        streakBonus,
        difficultyBonus,
        speedBonus,
      },
      newStreak,
      newBadges,
    };
  }

  public static processMicroPathCompletion(student: StudentProfile): { earnedXp: number; newBadges: Badge[] } {
    const earnedIds = new Set(student.earnedBadges.map((b) => b.id));
    const newBadges: Badge[] = [];

    if (!earnedIds.has('misconception_cured')) {
      const found = ALL_BADGES.find((b) => b.id === 'misconception_cured');
      if (found) {
        newBadges.push({ ...found, unlockedAt: Date.now() });
      }
    }

    return {
      earnedXp: 200, // Big reward for repairing a knowledge gap!
      newBadges,
    };
  }
}
