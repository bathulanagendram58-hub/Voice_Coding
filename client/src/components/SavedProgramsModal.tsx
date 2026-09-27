import React, { useState } from 'react';
import {
  X,
  BookmarkCheck,
  Search,
  Code2,
  Play,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SavedProgram } from '../types';

interface SavedProgramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: SavedProgram[];
  onOpenProgram: (program: SavedProgram) => void;
  onDeleteProgram: (id: string) => void;
  onRunProgram: (program: SavedProgram) => void;
}

export const SavedProgramsModal: React.FC<SavedProgramsModalProps> = ({
  isOpen,
  onClose,
  programs,
  onOpenProgram,
  onDeleteProgram,
  onRunProgram,
}) => {
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState<string>('All');

  if (!isOpen) return null;

  const languages = ['All', ...Array.from(new Set(programs.map((p) => p.language)))];

  const filtered = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesLang = filterLang === 'All' || p.language === filterLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Saved Programs Library</h2>
              <p className="text-xs text-slate-400">
                Manage, edit, run, and review your bookmarked programming snippets.
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

        {/* Filter Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or code contents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Language filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setFilterLang(lang)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  filterLang === lang
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* List of Saved Programs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-400">No saved programs found</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click the "Save" button on any generated code block to save it here!
              </p>
            </div>
          ) : (
            filtered.map((program) => (
              <div
                key={program.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-200">{program.title}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {program.language}
                      </span>
                    </div>
                    {program.description && (
                      <p className="text-xs text-slate-400 mt-1">{program.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Run */}
                    <button
                      onClick={() => {
                        onRunProgram(program);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                      title="Load and run this program"
                    >
                      <Play className="w-3 h-3 fill-emerald-300" />
                      <span>Run</span>
                    </button>

                    {/* Open in Chat */}
                    <button
                      onClick={() => {
                        onOpenProgram(program);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      title="Open and edit in workspace"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteProgram(program.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete saved program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Code Preview */}
                <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 font-mono text-[11px] text-emerald-300/90 max-h-24 overflow-hidden relative">
                  <pre className="line-clamp-3">{program.code}</pre>
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>Saved on {new Date(program.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
