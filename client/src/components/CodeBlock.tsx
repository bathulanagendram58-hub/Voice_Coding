import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Copy,
  Check,
  Download,
  Play,
  Bookmark,
  Sparkles,
  HelpCircle,
  Bug,
  Code2,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import { LineByLineExplanation, SupportedLanguage } from '../types';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  lineByLine?: LineByLineExplanation[];
  onRunCode: (currentCode: string) => void;
  onExplainCode?: (currentCode: string) => void;
  onDebugCode?: (currentCode: string) => void;
  onSaveProgram?: (title: string, language: string, code: string) => void;
  isRunning?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code: initialCode,
  language,
  title,
  lineByLine = [],
  onRunCode,
  onExplainCode,
  onDebugCode,
  onSaveProgram,
  isRunning = false,
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Map language to Monaco supported language
  const getMonacoLang = (lang: string): string => {
    const l = lang.toLowerCase();
    if (l === 'c++' || l === 'cpp') return 'cpp';
    if (l === 'c#' || l === 'csharp') return 'csharp';
    if (l === 'js') return 'javascript';
    if (l === 'ts') return 'typescript';
    if (l === 'py') return 'python';
    return l;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      c: 'c',
      'c++': 'cpp',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
      sql: 'sql',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      kotlin: 'kt',
      swift: 'swift',
    };
    const ext = extMap[language.toLowerCase()] || 'txt';
    const filename = `${(title || 'program').toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (onSaveProgram) {
      onSaveProgram(title || `${language} Code Snippet`, language, code);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className={`rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-xl transition-all my-3 ${isExpanded ? 'fixed inset-4 z-50 flex flex-col bg-slate-950/98 backdrop-blur-xl' : ''}`}>
      {/* Code Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <Code2 className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-semibold text-slate-200">{language}</span>
          {title && <span className="text-slate-400 hidden sm:inline">| {title}</span>}
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            Editable
          </span>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Download source code file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Save Program */}
          {onSaveProgram && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 transition-colors"
              title="Save to your program library"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{saved ? 'Saved!' : 'Save'}</span>
            </button>
          )}

          {/* Line-by-Line Explanation Toggle */}
          {lineByLine && lineByLine.length > 0 && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                showExplanation
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle Line-by-Line Explanation"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Explain Lines</span>
            </button>
          )}

          {/* Expand/Contract */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={isExpanded ? 'Exit full view' : 'Maximize editor'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* RUN CODE BUTTON */}
          <button
            onClick={() => onRunCode(code)}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-slate-950 bg-gradient-to-r from-brand-400 to-emerald-400 hover:from-brand-300 hover:to-emerald-300 transition-all shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50"
            title="Execute code in sandbox"
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className={`w-full ${isExpanded ? 'flex-1 min-h-[400px]' : 'h-64 sm:h-72'}`}>
        <Editor
          height="100%"
          language={getMonacoLang(language)}
          value={code}
          onChange={(val) => setCode(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
          }}
        />
      </div>

      {/* Line-by-Line Explanation Panel */}
      {showExplanation && lineByLine && lineByLine.length > 0 && (
        <div className="border-t border-slate-800/80 bg-slate-900/90 p-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Line-by-Line Beginner Guide:</span>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
            {lineByLine.map((item, index) => (
              <div
                key={index}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 text-xs grid grid-cols-1 md:grid-cols-12 gap-2"
              >
                <div className="md:col-span-5 font-mono text-emerald-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[11px] break-all">
                  {item.line}
                </div>
                <div className="md:col-span-7 text-slate-300 text-xs flex items-center">
                  👉 {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
