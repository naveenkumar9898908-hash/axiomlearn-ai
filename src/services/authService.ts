import { UserAccount, StudentProfile } from '../types';

const STORAGE_KEY_USERS = 'axiom_users_db_v1';
const STORAGE_KEY_ACTIVE_USER = 'axiom_active_user_v1';

export const DEFAULT_USERS: UserAccount[] = [
  {
    username: 'alex.vance',
    password: 'VanceMaster2026!',
    name: 'Alex Vance',
    role: 'student',
    personaLabel: 'Advanced Prodigy (High Mastery & Ability)',
    profile: {
      id: 'user-alex',
      name: 'Alex Vance',
      avatar: 'AV',
      theta: 1.45, // Master level
      conceptMastery: {
        'arithmetic-negatives': 0.96,
        'fraction-powers': 0.92,
        'linear-equations': 0.94,
        'polynomial-factoring': 0.88,
        'functions-graphs': 0.86,
        'limits-continuity': 0.84,
        'derivative-rules': 0.82,
        'chain-rule': 0.78,
        'curve-optimization': 0.70,
        // CS concepts
        'cs-vars-types': 0.95,
        'cs-conditionals': 0.92,
        'cs-loops': 0.90,
        'cs-functions': 0.88,
        'cs-arrays-pointers': 0.85,
        'cs-recursion': 0.82,
        'cs-linked-lists': 0.79,
        'cs-trees-bst': 0.74,
        'cs-dynamic-programming': 0.68,
      },
      interactionHistory: [],
      activeMicroPath: null,
      resolvedMisconceptions: ['misc-order-sign', 'misc-double-negative'],
      xp: 750,
      level: 4,
      streak: 4,
      highestStreak: 6,
      earnedBadges: [
        { id: 'first_correct', title: 'First Step', description: 'Answered your first practice question correctly.', icon: '🎯' },
        { id: 'streak_3', title: 'Hot Streak', description: 'Achieved a streak of 3 consecutive correct answers.', icon: '🔥' },
        { id: 'high_ability', title: 'High Achiever', description: 'Estimated latent ability θ exceeded +1.0.', icon: '🌟' },
      ],
    },
  },
  {
    username: 'maya.rodriguez',
    password: 'MayaLearn2026#',
    name: 'Maya Rodriguez',
    role: 'student',
    personaLabel: 'Prerequisite-Blocked (Tripped up by Foundational Gap)',
    profile: {
      id: 'user-maya',
      name: 'Maya Rodriguez',
      avatar: 'MR',
      theta: -0.25, // Developing
      conceptMastery: {
        'arithmetic-negatives': 0.70,
        'fraction-powers': 0.32, // CRITICAL BOTTLENECK!
        'linear-equations': 0.65,
        'polynomial-factoring': 0.38,
        'functions-graphs': 0.50,
        'limits-continuity': 0.35,
        'derivative-rules': 0.28,
        'chain-rule': 0.20,
        'curve-optimization': 0.15,
        // CS concepts
        'cs-vars-types': 0.70,
        'cs-conditionals': 0.60,
        'cs-loops': 0.35,
        'cs-functions': 0.55,
        'cs-arrays-pointers': 0.30,
        'cs-recursion': 0.25,
        'cs-linked-lists': 0.20,
        'cs-trees-bst': 0.15,
        'cs-dynamic-programming': 0.10,
      },
      interactionHistory: [],
      activeMicroPath: null,
      resolvedMisconceptions: [],
      xp: 220,
      level: 1,
      streak: 1,
      highestStreak: 2,
      earnedBadges: [
        { id: 'first_correct', title: 'First Step', description: 'Answered your first practice question correctly.', icon: '🎯' },
      ],
    },
  },
  {
    username: 'liam.chen',
    password: 'LiamBeginner99$',
    name: 'Liam Chen',
    role: 'student',
    personaLabel: 'Foundational Explorer (Early-Stage Learner)',
    profile: {
      id: 'user-liam',
      name: 'Liam Chen',
      avatar: 'LC',
      theta: -0.85, // Novice
      conceptMastery: {
        'arithmetic-negatives': 0.55,
        'fraction-powers': 0.30,
        'linear-equations': 0.40,
        'polynomial-factoring': 0.20,
        'functions-graphs': 0.25,
        'limits-continuity': 0.15,
        'derivative-rules': 0.10,
        'chain-rule': 0.08,
        'curve-optimization': 0.05,
        // CS concepts
        'cs-vars-types': 0.50,
        'cs-conditionals': 0.35,
        'cs-loops': 0.25,
        'cs-functions': 0.20,
        'cs-arrays-pointers': 0.15,
        'cs-recursion': 0.10,
        'cs-linked-lists': 0.08,
        'cs-trees-bst': 0.05,
        'cs-dynamic-programming': 0.02,
      },
      interactionHistory: [],
      activeMicroPath: null,
      resolvedMisconceptions: [],
      xp: 90,
      level: 1,
      streak: 0,
      highestStreak: 1,
      earnedBadges: [],
    },
  },
  {
    username: 'prof.reed',
    password: 'TeacherAdmin2026@',
    name: 'Dr. Evelyn Reed',
    role: 'instructor',
    personaLabel: 'Class Instructor & Curriculum Lead',
    profile: {
      id: 'user-reed',
      name: 'Dr. Evelyn Reed',
      avatar: 'ER',
      theta: 2.5,
      conceptMastery: {},
      interactionHistory: [],
      activeMicroPath: null,
      resolvedMisconceptions: [],
      xp: 2500,
      level: 10,
      streak: 10,
      highestStreak: 15,
      earnedBadges: [],
    },
  },
];

export class AuthService {
  private static loadUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load users from localStorage', e);
    }
    // Initialize default users if not present
    this.saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  private static saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users to localStorage', e);
    }
  }

  public static getAllUsers(): UserAccount[] {
    return this.loadUsers();
  }

  public static getCurrentUser(): UserAccount | null {
    try {
      const activeUsername = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
      if (activeUsername) {
        const users = this.loadUsers();
        const found = users.find((u) => u.username.toLowerCase() === activeUsername.toLowerCase());
        if (found) return found;
      }
    } catch (e) {
      console.warn('Failed to get active user', e);
    }
    return null;
  }

  public static login(username: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
    const users = this.loadUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
      return { success: false, error: 'User not found. Please check username or register a new account.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Incorrect password for this user account.' };
    }

    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, user.username);
    } catch (e) {
      console.warn(e);
    }

    return { success: true, user };
  }

  public static register(
    username: string,
    password: string,
    name: string,
    role: 'student' | 'instructor' = 'student'
  ): { success: boolean; user?: UserAccount; error?: string } {
    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername || trimmedUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = this.loadUsers();
    if (users.some((u) => u.username.toLowerCase() === trimmedUsername)) {
      return { success: false, error: 'A user with this username already exists.' };
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'ST';

    const newUser: UserAccount = {
      username: trimmedUsername,
      password,
      name: name.trim() || trimmedUsername,
      role,
      personaLabel: role === 'instructor' ? 'Custom Instructor' : 'Custom Independent Learner',
      profile: {
        id: `user-${Date.now()}`,
        name: name.trim() || trimmedUsername,
        avatar: initials,
        theta: 0.0, // Neutral starting ability
        conceptMastery: {
          'arithmetic-negatives': 0.70,
          'fraction-powers': 0.50,
          'linear-equations': 0.55,
        },
        interactionHistory: [],
        activeMicroPath: null,
        resolvedMisconceptions: [],
        xp: 100,
        level: 1,
        streak: 0,
        highestStreak: 0,
        earnedBadges: [],
      },
    };

    users.push(newUser);
    this.saveUsers(users);

    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_USER, newUser.username);
    } catch (e) {
      console.warn(e);
    }

    return { success: true, user: newUser };
  }

  public static logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
    } catch (e) {
      console.warn(e);
    }
  }

  public static updateActiveUserProfile(profile: StudentProfile): void {
    const active = this.getCurrentUser();
    if (!active) return;

    const users = this.loadUsers();
    const idx = users.findIndex((u) => u.username.toLowerCase() === active.username.toLowerCase());
    if (idx !== -1) {
      users[idx].profile = profile;
      this.saveUsers(users);
    }
  }
}
