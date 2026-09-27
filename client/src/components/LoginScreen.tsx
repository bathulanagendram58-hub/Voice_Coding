import React, { useState } from 'react';
import {
  Mic,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  UserPlus,
  Terminal,
  Cpu,
  Key,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Zap,
  Flame,
  Globe
} from 'lucide-react';
import { login, register } from '../services/api';
import { signInWithGoogle, isFirebaseConfigured } from '../services/firebase';
import { User } from '../types';

interface LoginScreenProps {
  onAuthSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'standard' | 'demo' | 'firebase'>('standard');

  const demoAccounts = [
    {
      role: 'Quick Demo Student',
      email: 'demo@example.com',
      password: 'demo123',
      badge: 'Instant Access',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Pre-loaded demo account ready for quick testing.'
    },
    {
      role: 'Pro Student Account',
      email: 'student@voicecode.ai',
      password: 'password123',
      badge: 'Full Features',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      description: 'Standard coding workspace account with pre-seeded credentials.'
    }
  ];

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !password) throw new Error('Email and password are required.');
        const res = await register(name, email, password);
        if (res.user.token) localStorage.setItem('voice_coding_token', res.user.token);
        onAuthSuccess(res.user);
      } else {
        if (!email.trim() || !password) throw new Error('Email and password are required.');
        const res = await login(email, password);
        if (res.user.token) localStorage.setItem('voice_coding_token', res.user.token);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const res = await login(demoEmail, demoPass);
      if (res.user.token) localStorage.setItem('voice_coding_token', res.user.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Could not log in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      // Use Firebase token to create or login session
      const appUser: User = {
        id: 'fb_' + btoa(firebaseUser.email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
        name: firebaseUser.name,
        email: firebaseUser.email,
        token: firebaseUser.token
      };
      localStorage.setItem('voice_coding_token', appUser.token || 'fb_session');
      onAuthSuccess(appUser);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Mic className="w-5 h-5 text-brand-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-brand-200 to-emerald-300 bg-clip-text text-transparent">
                VoiceCode AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">AI-Powered Voice Coding & Compiler</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-full px-3.5 py-1.5 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure Authentication Gate</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Overview */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Sign in to unlock voice coding & live execution</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
              Speak Code.<br />
              <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                Build Instantly.
              </span>
            </h1>

            <p className="text-sm text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Transform spoken English into production code across Python, JavaScript, C++, Java, and Go with real-time compilation and AI explanations.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200">Voice-to-Code</div>
                  <div className="text-[10px] text-slate-400">Natural voice prompts</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200">Instant Execution</div>
                  <div className="text-[10px] text-slate-400">Isolated cloud runtime</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200">Multi-Language</div>
                  <div className="text-[10px] text-slate-400">Python, JS, C++, Go, Java</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200">AI Error Doctor</div>
                  <div className="text-[10px] text-slate-400">Automatic bug diagnosis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Card Accent Glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-44 h-44 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header Mode Switcher */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    {isSignUp ? <UserPlus className="w-5 h-5 text-brand-400" /> : <LogIn className="w-5 h-5 text-brand-400" />}
                    {isSignUp ? 'Create Student Account' : 'Student & Dev Login'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isSignUp ? 'Enter your details to get started' : 'Sign in with your credentials to open app'}
                  </p>
                </div>
              </div>

              {/* Credentials Preset Badges */}
              <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 text-brand-300">
                    <Key className="w-3.5 h-3.5" />
                    Available Default Credentials
                  </span>
                  <span className="text-[10px] text-slate-500">Click to autofill & login</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickDemoLogin(acc.email, acc.password)}
                      disabled={loading}
                      className="text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-brand-500/50 transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-brand-300 transition-colors">
                          {acc.role}
                        </span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${acc.badgeColor}`}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Password: {acc.password}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <span className="font-bold">⚠️</span>
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {/* Login / Register Form */}
              <form onSubmit={handleStandardAuth} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Alex Rivera"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="student@voicecode.ai or demo@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-brand-400 to-emerald-400 hover:from-brand-300 hover:to-emerald-300 shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                      <span>{isSignUp ? 'Create Account & Open App' : 'Sign In & Open Workspace'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Firebase / Google Sign-In Option */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-700/80 hover:border-slate-600 bg-slate-950/60 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-all flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Sign In with Google {isFirebaseConfigured ? '' : '(Firebase)'}</span>
                </button>
              </div>

              {/* Mode Switch Toggle */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-brand-400 transition-colors"
                >
                  {isSignUp ? 'Already registered? Sign In with credentials' : "Don't have an account? Sign up with email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-900">
        <div>VoiceCode AI Assistant • Hands-free Developer Workspace</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Compiler Service Active</span>
          </span>
          <span>•</span>
          <span>Firebase Auth Ready</span>
        </div>
      </footer>
    </div>
  );
};
