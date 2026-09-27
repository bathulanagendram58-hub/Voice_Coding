import React from 'react';
import {
  Mic,
  Code2,
  GraduationCap,
  Volume2,
  VolumeX,
  Settings,
  BookmarkCheck,
  HelpCircle,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers,
  Zap,
  Flame
} from 'lucide-react';
import { SupportedLanguage, LearningLevel, User } from '../types';

interface NavbarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  learningLevel: LearningLevel;
  onLearningLevelChange: (level: LearningLevel) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSavedPrograms: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const LANGUAGES: SupportedLanguage[] = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C',
  'C++',
  'HTML',
  'CSS',
  'SQL',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Kotlin',
  'Swift',
];

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  learningLevel,
  onLearningLevelChange,
  user,
  onOpenAuth,
  onLogout,
  onOpenSavedPrograms,
  onOpenSettings,
  onOpenHelp,
  autoSpeak,
  onToggleAutoSpeak,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
          title="Toggle Sidebar (Ctrl+B)"
        >
          <Layers className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
            <Mic className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
                VoiceCode AI
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Hands-Free Programming Tutor</p>
          </div>
        </div>
      </div>

      {/* Middle: Language & Learning Level Selectors */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Language Selector */}
        <div className="relative flex items-center">
          <label htmlFor="language-selector" className="sr-only">Select Programming Language</label>
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:border-brand-500/50 transition-all shadow-inner">
            <Code2 className="w-3.5 h-3.5 text-brand-400" />
            <select
              id="language-selector"
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              aria-label="Select Programming Language"
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-slate-100">
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Learning Level Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-xs shadow-inner">
          {(['Beginner', 'Intermediate', 'Advanced'] as LearningLevel[]).map((level) => {
            const isSelected = learningLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => onLearningLevelChange(level)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? level === 'Beginner'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : level === 'Intermediate'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={`Learning Level: ${level}`}
              >
                {level === 'Beginner' && <Sparkles className="w-3 h-3 text-emerald-400" />}
                {level === 'Intermediate' && <Zap className="w-3 h-3 text-amber-400" />}
                {level === 'Advanced' && <Flame className="w-3 h-3 text-purple-400" />}
                <span>{level}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Voice Readout Toggle */}
        <button
          onClick={onToggleAutoSpeak}
          className={`p-2 rounded-lg border transition-all ${
            autoSpeak
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 shadow-sm shadow-brand-500/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
          title={autoSpeak ? 'Audio explanation: ON (click to mute)' : 'Audio explanation: OFF (click to enable speech)'}
        >
          {autoSpeak ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Saved Programs */}
        <button
          onClick={onOpenSavedPrograms}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs"
          title="Saved Programs Library"
        >
          <BookmarkCheck className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Saved</span>
        </button>

        {/* Help */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
          title="Voice Commands & Tutorial"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
          title="Settings & API Keys"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* User / Auth */}
        {user ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-brand-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
