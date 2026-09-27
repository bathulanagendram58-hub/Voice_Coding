import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Sparkles,
  RefreshCw,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { ExecutionResult } from '../types';

interface TerminalOutputProps {
  language: string;
  result: ExecutionResult | null;
  isRunning: boolean;
  onClear: () => void;
  onExplainError?: (error: string) => void;
  stdinValue: string;
  onStdinChange: (val: string) => void;
  onReRun: () => void;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  language,
  result,
  isRunning,
  onClear,
  onExplainError,
  stdinValue,
  onStdinChange,
  onReRun,
}) => {
  const [showStdin, setShowStdin] = useState(false);

  if (!result && !isRunning) return null;

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-2xl my-3 animate-in fade-in duration-200">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono font-bold text-slate-200">Terminal Output</span>
          {result && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                result.success
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {result.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span>{result.success ? 'Success' : 'Execution Failed'}</span>
            </span>
          )}
        </div>

        {/* Right stats & controls */}
        <div className="flex items-center gap-2 text-slate-400">
          {result && result.executionTime !== undefined && (
            <div className="flex items-center gap-1 text-[11px] font-mono bg-slate-800/80 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{result.executionTime.toFixed(3)}s</span>
            </div>
          )}

          {result?.engine && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-400">
              <Cpu className="w-3 h-3 text-brand-400" />
              <span>{result.engine}</span>
            </div>
          )}

          <button
            onClick={() => setShowStdin(!showStdin)}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
            title="Provide custom standard input (stdin)"
          >
            <span>Input (stdin)</span>
            {showStdin ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={onClear}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Stdin Input Box */}
      {showStdin && (
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs">
          <label className="block text-slate-400 font-medium mb-1">
            Program Standard Input (stdin):
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={stdinValue}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="e.g. 10 or test input on each line"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={onReRun}
              className="px-3 py-1 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-lg text-xs self-end"
            >
              Re-run with Input
            </button>
          </div>
        </div>
      )}

      {/* Terminal Content Box */}
      <div className="p-4 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto bg-slate-950 select-text">
        {isRunning ? (
          <div className="flex items-center gap-2 text-brand-400 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>$ Executing {language} program in isolated sandbox...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            <p className="text-slate-500">$ Running {language} script...</p>

            {/* Standard Output */}
            {result.output && (
              <pre className="text-emerald-300 whitespace-pre-wrap break-words bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                {result.output}
              </pre>
            )}

            {/* Standard Error / Failure */}
            {result.error && (
              <div className="space-y-2.5 mt-2">
                <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg p-3 text-rose-300">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Execution Error:</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-words text-[11px] font-mono">
                    {result.error}
                  </pre>
                </div>

                {/* AI Error Suggestion & Button */}
                {onExplainError && (
                  <div className="bg-slate-900/80 border border-brand-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                      <span className="text-slate-200 text-xs">
                        Don't understand this error? Let AI explain and fix it step-by-step.
                      </span>
                    </div>
                    <button
                      onClick={() => onExplainError(result.error)}
                      className="px-3 py-1.5 rounded-lg font-bold text-xs bg-gradient-to-r from-cyan-500 to-brand-500 hover:from-cyan-400 hover:to-brand-400 text-slate-950 shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 self-end sm:self-auto shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explain Error with AI</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {result.success && !result.output && (
              <p className="text-slate-400 italic">Program executed successfully with no console output.</p>
            )}

            <p className="text-slate-600 text-[10px] pt-1">
              Process exited with code {result.exitCode}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
