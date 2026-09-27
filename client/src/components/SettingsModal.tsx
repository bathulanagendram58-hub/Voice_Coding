import React, { useState } from 'react';
import { X, Settings, Key, Volume2, Globe, Sliders, CheckCircle2, Sparkles, VolumeX } from 'lucide-react';
import { UserSettings, SupportedLanguage, LearningLevel } from '../types';
import { voiceSpeaker } from '../services/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
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

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [defaultLanguage, setDefaultLanguage] = useState<SupportedLanguage>(settings.defaultLanguage);
  const [defaultLevel, setDefaultLevel] = useState<LearningLevel>(settings.defaultLevel);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(settings.voiceSpeed || 1.0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(settings.voiceEnabled);
  const [autoSpeakExplanation, setAutoSpeakExplanation] = useState<boolean>(settings.autoSpeakExplanation);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      apiKey: apiKey.trim(),
      defaultLanguage,
      defaultLevel,
      voiceSpeed,
      voiceEnabled,
      autoSpeakExplanation,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestVoice = () => {
    voiceSpeaker.speak(
      `Hello! I am your real-time coding voice assistant. I can explain code in ${defaultLanguage} for ${defaultLevel} students!`,
      voiceSpeed
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Preferences & Settings</h2>
              <p className="text-xs text-slate-400">Configure AI keys, speech engines, and defaults.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
          {/* AI API Key Config */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand-400" />
              <span>Custom AI API Key (Optional)</span>
            </label>
            <input
              type="password"
              placeholder="Paste your Gemini (AIza...) or OpenAI (sk-...) API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-400">
              If left blank, VoiceCode AI uses our built-in high-performance intelligent offline coding tutor.
            </p>
          </div>

          {/* Default Language */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Default Programming Language</span>
            </label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value as SupportedLanguage)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Default Learning Level */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Default Learning Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as LearningLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDefaultLevel(level)}
                  className={`py-2 rounded-xl font-medium border text-xs transition-all ${
                    defaultLevel === level
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speech Synthesis & Rate */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voice Speech Output Rate ({voiceSpeed}x)</span>
              </label>
              <button
                type="button"
                onClick={handleTestVoice}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
              >
                Test Voice
              </button>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
          </div>

          {/* Auto Readout Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-slate-200 block">Auto-read Explanations</span>
              <span className="text-[11px] text-slate-400">
                Automatically speak out beginner explanations upon response generation.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoSpeakExplanation}
              onChange={(e) => setAutoSpeakExplanation(e.target.checked)}
              className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-brand-400 to-emerald-400 hover:from-brand-300 hover:to-emerald-300 shadow-md shadow-brand-500/20 transition-all"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{savedSuccess ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
