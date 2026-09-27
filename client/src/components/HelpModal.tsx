import React from 'react';
import { X, HelpCircle, Mic, Play, Sparkles, Terminal, Code2, BookOpen, CheckCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  if (!isOpen) return null;

  const EXAMPLE_COMMANDS = [
    {
      voice: '"Write a Python program to check whether a number is prime."',
      desc: 'Generates algorithm, beginner prime code, line annotations, and example I/O.',
    },
    {
      voice: '"Give me a Java program to find the largest number in an array."',
      desc: 'Creates a simple array loop with step-by-step logic.',
    },
    {
      voice: '"Write a simple calculator in Python with addition, subtraction, and division."',
      desc: 'Shows functions with division-by-zero protection.',
    },
    {
      voice: '"Why is this code not working? (paste broken code)"',
      desc: 'Analyzes syntax or runtime errors, explains cause, and gives corrected code.',
    },
    {
      voice: '"Explain how bubble sort works step-by-step."',
      desc: 'Provides intuitive visual logic and beginner sorting implementation.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Hands-Free Coding Assistant Guide</h2>
              <p className="text-xs text-slate-400">
                Learn how to speak programming questions, run code, and debug mistakes.
              </p>
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Main Workflow Overview */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Complete Hands-Free Workflow
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-300">
              <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">1. Click 🎤 or Type</span>
              <span className="text-brand-400 font-bold">→</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">2. Select Language</span>
              <span className="text-brand-400 font-bold">→</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">3. AI Generates Logic & Code</span>
              <span className="text-brand-400 font-bold">→</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">4. Run in Sandbox</span>
              <span className="text-brand-400 font-bold">→</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">5. View Live Terminal Output</span>
            </div>
          </div>

          {/* Voice Commands Cheat Sheet */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-rose-400" />
              Try Speaking These Commands
            </h3>
            <div className="space-y-2">
              {EXAMPLE_COMMANDS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectPrompt(item.voice.replace(/^"|"$/g, ''));
                    onClose();
                  }}
                  className="bg-slate-950 border border-slate-800 hover:border-brand-500/50 rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-900/80 group"
                >
                  <p className="font-mono text-emerald-300 font-semibold group-hover:text-emerald-200">
                    {item.voice}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Beginner Mode Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              What makes Beginner Mode special?
            </h3>
            <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
              <li>Uses clean, straightforward syntax without obscure shortcuts.</li>
              <li>Includes helpful comments on every critical step.</li>
              <li>Highlights common mistakes so you learn what traps to avoid.</li>
              <li>Provides line-by-line breakdown explanations for every line of code.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
          >
            Got it, let's code!
          </button>
        </div>
      </div>
    </div>
  );
};
