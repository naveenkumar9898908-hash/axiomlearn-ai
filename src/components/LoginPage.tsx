import React, { useState } from 'react';
import { AuthService, DEFAULT_USERS } from '../services/authService';
import { UserAccount } from '../types';
import {
  Brain,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  GraduationCap
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('maya.rodriguez');
  const [password, setPassword] = useState<string>('MayaLearn2026#');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'instructor'>('student');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isRegisterMode) {
      const res = AuthService.register(username, password, name || username, role);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Registration failed');
      }
    } else {
      const res = AuthService.login(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    }
  };

  const handleSelectDemoUser = (user: UserAccount) => {
    setIsRegisterMode(false);
    setUsername(user.username);
    setPassword(user.password);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden z-10">
        
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          
          {/* Brand Header */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>AxiomLearn AI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    EDU-01
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">Adaptive Cognitive Tracing & Root-Cause Remediation</p>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  !isRegisterMode
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In to Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isRegisterMode
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create New Learner
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                  Full Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Unique Username / Handle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. maya.rodriguez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Unique User Password
                </label>
                {!isRegisterMode && (
                  <span className="text-[10px] text-indigo-400 font-mono">
                    Distinct per learner
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter unique account password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Select when registering */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      role === 'student'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Student / Learner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('instructor')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      role === 'instructor'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Teacher / Instructor</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isRegisterMode ? 'Complete Registration & Start' : 'Authenticate & Enter Engine'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolated LocalStorage State</span>
            </span>
            <span>TENSORA 2026</span>
          </div>

        </div>

        {/* Right Column: Demo User Persona Credentials (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Judge & Evaluator Quick Pass</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Unique Credentials by Persona
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Click any profile below to instantly load their unique password, custom ability $\theta$, and knowledge gap state:
            </p>

            {/* Persona Cards List */}
            <div className="space-y-2.5">
              {DEFAULT_USERS.map((u) => {
                const isSelected = username.toLowerCase() === u.username.toLowerCase();

                return (
                  <div
                    key={u.username}
                    onClick={() => handleSelectDemoUser(u)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                          {u.profile.avatar}
                        </div>
                        <span className="text-xs font-bold text-white">{u.name}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        u.role === 'instructor' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                      {u.personaLabel}
                    </p>

                    {/* Credentials pill */}
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">User: <strong className="text-slate-200">{u.username}</strong></span>
                      <span className="text-indigo-300 font-semibold">{u.password}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-[11px] text-indigo-200">
            💡 <em>Tip for Judges:</em> Select <strong>Maya Rodriguez</strong> to immediately test the backward DAG diagnosis and 4-step micro-practice path on her unmastered prerequisite!
          </div>
        </div>

      </div>

    </div>
  );
};
