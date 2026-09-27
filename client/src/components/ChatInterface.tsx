import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Bug,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Code,
  Terminal as TerminalIcon,
  CheckCircle,
  BookOpen,
  Zap,
  Repeat,
  Compass,
  Mic,
  Activity,
  Cpu,
  Layers
} from 'lucide-react';
import {
  Message,
  SupportedLanguage,
  LearningLevel,
  AICodingResponse,
  ExecutionResult,
  LoadingStage
} from '../types';
import { CodeBlock } from './CodeBlock';
import { TerminalOutput } from './TerminalOutput';
import { VoiceInput } from './VoiceInput';
import { voiceSpeaker } from '../services/speech';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  loadingStage: LoadingStage;
  onUserQuestion: (question: string, inputType: 'voice' | 'text', customCode?: string) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  learningLevel: LearningLevel;
  onLearningLevelChange: (level: LearningLevel) => void;
  onExecuteCode: (language: string, code: string, stdin?: string) => Promise<ExecutionResult>;
  onSaveProgram: (title: string, language: string, code: string) => void;
  onExplainErrorWithAI: (code: string, error: string, language: string) => void;
  autoSpeak: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  loadingStage,
  onUserQuestion,
  currentLanguage,
  onLanguageChange,
  learningLevel,
  onLearningLevelChange,
  onExecuteCode,
  onSaveProgram,
  onExplainErrorWithAI,
  autoSpeak,
}) => {
  const [inputText, setInputText] = useState('');
  const [executionStates, setExecutionStates] = useState<
    Record<string, { isRunning: boolean; result: ExecutionResult | null; stdin: string; currentCode: string }>
  >({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, loadingStage, executionStates]);

  // Handle text input submission
  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const query = inputText.trim();
    setInputText('');
    onUserQuestion(query, 'text');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  // Run code for a specific message
  const handleRunCode = async (msgId: string, lang: string, codeToRun: string) => {
    const currentStdin = executionStates[msgId]?.stdin || '';
    setExecutionStates((prev) => ({
      ...prev,
      [msgId]: { isRunning: true, result: null, stdin: currentStdin, currentCode: codeToRun },
    }));

    try {
      const res = await onExecuteCode(lang, codeToRun, currentStdin);
      setExecutionStates((prev) => ({
        ...prev,
        [msgId]: { isRunning: false, result: res, stdin: currentStdin, currentCode: codeToRun },
      }));
    } catch (err: any) {
      setExecutionStates((prev) => ({
        ...prev,
        [msgId]: {
          isRunning: false,
          result: {
            success: false,
            output: '',
            error: err.message || 'Execution error.',
            exitCode: 1,
            executionTime: 0,
          },
          stdin: currentStdin,
          currentCode: codeToRun,
        },
      }));
    }
  };

  // Quick Starter Prompts
  const QUICK_PROMPTS = [
    {
      title: 'Prime Number Checker',
      subtitle: `${learningLevel === 'Advanced' ? '6k±1 & Sieve' : learningLevel === 'Intermediate' ? 'Square-root O(√n)' : 'Trial division'} prime logic`,
      prompt: `Write a ${currentLanguage} program to check whether a number is prime.`,
      icon: Sparkles,
      color: 'from-emerald-500/20 to-brand-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Find Array Duplicates',
      subtitle: `${learningLevel === 'Advanced' ? 'Streaming O(n) Generator' : learningLevel === 'Intermediate' ? 'Hash Set linear O(n)' : 'Basic loop counter'} solution`,
      prompt: `Create a ${learningLevel === 'Advanced' ? 'high-performance ' : ''}solution to find duplicate values in a ${learningLevel === 'Advanced' ? 'large dataset' : 'list'} in ${currentLanguage}.`,
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'Array Sorting',
      subtitle: `${learningLevel === 'Advanced' ? '3-Way QuickSort / Introsort' : learningLevel === 'Intermediate' ? 'Merge Sort O(n log n)' : 'Bubble sort'} algorithm`,
      prompt: `Write a ${currentLanguage} program to sort an array.`,
      icon: Activity,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Largest Array Item',
      subtitle: `${learningLevel === 'Advanced' ? 'Parallel/SIMD Tournament Max' : learningLevel === 'Intermediate' ? 'Divide & Conquer with validation' : 'Linear comparison logic'}`,
      prompt: `Give me a ${currentLanguage} program to find the largest number in an array.`,
      icon: Compass,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950/60 overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        {/* Workspace Title Banner */}
        <div className="text-center max-w-2xl mx-auto pb-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Hands-Free Programming Tutor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Real-Time Coding Voice Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Ask, Code, Run, and Learn — Hands-Free.
          </p>
        </div>

        {/* Empty State / Welcome Hero */}
        {messages.length === 0 && (
          <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
            {/* Hero Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 text-left relative overflow-hidden shadow-2xl">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                  <TerminalIcon className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Welcome to Real-Time Coding Voice Assistant 👋
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Click the microphone <span className="text-brand-400 font-bold">🎤</span> and speak your coding question hands-free, or type below.
                    The assistant will automatically convert your voice, understand your learning level, generate code, and explain every step.
                  </p>
                </div>
              </div>

              {/* Popular Language Quick Badges */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Popular Languages:</span>
                {(['Python', 'JavaScript', 'Java', 'C++', 'C', 'SQL'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onLanguageChange(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      currentLanguage === lang
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Prompt Cards */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Try Asking (or Click to Run)</span>
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Learning Level:</span>
                  <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
                    {(['Beginner', 'Intermediate', 'Advanced'] as LearningLevel[]).map((lvl) => {
                      const isSel = learningLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => onLearningLevelChange(lvl)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            isSel
                              ? lvl === 'Beginner'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                                : lvl === 'Intermediate'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {QUICK_PROMPTS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => onUserQuestion(card.prompt, 'text')}
                      className={`glass-card p-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] group bg-gradient-to-br ${card.color}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          <Icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-300" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {card.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {card.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-4xl mx-auto flex flex-col ${
              message.role === 'user' ? 'items-end' : 'items-start'
            } animate-in fade-in duration-200`}
          >
            {/* User Message Bubble */}
            {message.role === 'user' ? (
              <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
                <div className="flex flex-col items-end">
                  <div className="bg-gradient-to-r from-brand-600 to-emerald-600 text-slate-950 font-medium text-sm px-4 py-3 rounded-2xl rounded-tr-none shadow-lg shadow-brand-500/10 leading-relaxed break-words">
                    {message.content}
                  </div>
                  {/* Badge: Voice vs Text */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 pr-1">
                    {message.inputType === 'voice' ? (
                      <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        <Mic className="w-3 h-3" /> Voice
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400">
                        ⌨️ Typed
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-300 shrink-0">
                  You
                </div>
              </div>
            ) : (
              /* AI Assistant Response Card */
              <div className="w-full glass-card rounded-2xl p-5 border border-slate-800/90 bg-slate-900/60 shadow-xl space-y-4">
                {/* AI Header & Controls */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">
                        {message.metadata?.title || 'AI Solution'}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{message.metadata?.language || currentLanguage}</span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          (message.metadata?.learningLevel || learningLevel) === 'Advanced'
                            ? 'text-purple-400'
                            : (message.metadata?.learningLevel || learningLevel) === 'Intermediate'
                            ? 'text-amber-400'
                            : 'text-brand-400'
                        }`}>
                          {message.metadata?.learningLevel || learningLevel} Mode
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Read Aloud Button */}
                  <button
                    onClick={() => {
                      const textToRead = `${message.metadata?.explanation || message.content}. ${
                        message.metadata?.algorithm?.join('. ') || ''
                      }`;
                      voiceSpeaker.speak(textToRead);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                    title="Read explanation aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-brand-400" />
                    <span className="hidden sm:inline">Listen</span>
                  </button>
                </div>

                {/* Section 1: AI Understanding */}
                {message.metadata?.understanding && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">I understood your request as: </span>
                      <span className="text-slate-300">{message.metadata.understanding.replace(/^I understood your request as:\s*/i, '')}</span>
                    </div>
                  </div>
                )}

                {/* Section 2: Explanation & Complexity */}
                {message.metadata?.explanation && (
                  <div className="space-y-1.5 text-slate-200 text-sm leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-brand-400">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Explanation:</span>
                      </div>

                      {/* Complexity Badges for Intermediate & Advanced */}
                      {message.metadata?.complexity && (
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                            Time: {message.metadata.complexity.time}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-purple-300">
                            Space: {message.metadata.complexity.space}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line pt-1">
                      {message.metadata.explanation}
                    </p>
                  </div>
                )}

                {/* Section 3: Step-by-Step Logic / Algorithm */}
                {message.metadata?.algorithm && message.metadata.algorithm.length > 0 && (
                  <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-400 mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Step-by-Step Logic:</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {message.metadata.algorithm.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold font-mono shrink-0">
                            {idx + 1}.
                          </span>
                          <span>{step.replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Debugging info if present */}
                {message.metadata?.debugInfo?.isDebugging && (
                  <div className="bg-rose-950/20 border border-rose-800/40 p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-400">
                      <Bug className="w-4 h-4" />
                      <span>Identified Error: {message.metadata.debugInfo.identifiedError}</span>
                    </div>
                    {message.metadata.debugInfo.errorCause && (
                      <p className="text-slate-300">
                        <strong className="text-slate-200">Cause:</strong> {message.metadata.debugInfo.errorCause}
                      </p>
                    )}
                    {message.metadata.debugInfo.fixExplanation && (
                      <p className="text-emerald-300">
                        <strong className="text-emerald-200">Fix:</strong> {message.metadata.debugInfo.fixExplanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Section 4: Monaco Code Block with Run, Copy, Download */}
                {message.metadata?.code && (
                  <div>
                    <CodeBlock
                      code={message.metadata.code}
                      language={message.metadata.language || currentLanguage}
                      title={message.metadata.title}
                      lineByLine={message.metadata.lineByLine}
                      isRunning={executionStates[message.id]?.isRunning || false}
                      onRunCode={(currentCode) =>
                        handleRunCode(
                          message.id,
                          message.metadata?.language || currentLanguage,
                          currentCode
                        )
                      }
                      onSaveProgram={onSaveProgram}
                    />

                    {/* Terminal Output Panel */}
                    <TerminalOutput
                      language={message.metadata.language || currentLanguage}
                      isRunning={executionStates[message.id]?.isRunning || false}
                      result={executionStates[message.id]?.result || null}
                      stdinValue={executionStates[message.id]?.stdin || ''}
                      onStdinChange={(val) =>
                        setExecutionStates((prev) => ({
                          ...prev,
                          [message.id]: {
                            ...prev[message.id],
                            stdin: val,
                          },
                        }))
                      }
                      onReRun={() =>
                        handleRunCode(
                          message.id,
                          message.metadata?.language || currentLanguage,
                          executionStates[message.id]?.currentCode || message.metadata?.code || ''
                        )
                      }
                      onClear={() =>
                        setExecutionStates((prev) => ({
                          ...prev,
                          [message.id]: {
                            ...prev[message.id],
                            result: null,
                          },
                        }))
                      }
                      onExplainError={(errorText) =>
                        onExplainErrorWithAI(
                          executionStates[message.id]?.currentCode || message.metadata?.code || '',
                          errorText,
                          message.metadata?.language || currentLanguage
                        )
                      }
                    />
                  </div>
                )}

                {/* Section 5: Sample Input & Output */}
                {message.metadata?.exampleIO && (message.metadata.exampleIO.input || message.metadata.exampleIO.output) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Sample Input:
                      </span>
                      <span className="text-cyan-300 break-all">
                        {message.metadata.exampleIO.input || 'None'}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Sample Output:
                      </span>
                      <span className="text-emerald-300 break-all">
                        {message.metadata.exampleIO.output || 'None'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Section 6: Common Mistakes (Beginner mode) */}
                {message.metadata?.commonMistakes && message.metadata.commonMistakes.length > 0 && (
                  <div className="bg-amber-950/15 border border-amber-800/30 p-3 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Common Mistakes to Avoid:</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {message.metadata.commonMistakes.map((mistake, idx) => (
                        <li key={idx}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Dynamic Progressive Loading State Banner */}
        {isLoading && (
          <div className="max-w-4xl mx-auto flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-900/90 text-xs text-slate-300 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-100">
                  {loadingStage === 'THINKING' && '✨ Understanding your programming question...'}
                  {loadingStage === 'GENERATING_CODE' && `💻 AI is generating ${learningLevel} ${currentLanguage} code...`}
                  {loadingStage !== 'THINKING' && loadingStage !== 'GENERATING_CODE' && `Processing your request in ${currentLanguage}...`}
                </span>
                <span className="text-[11px] text-slate-400">
                  Code will automatically appear in the editor below.
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message & Voice Input Area */}
      <div className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md p-3 md:p-4 sticky bottom-0 z-20">
        <form onSubmit={handleTextSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 focus-within:border-brand-500/70 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-xl">
            {/* Automatic Voice Input Button */}
            <VoiceInput
              onAutoSubmitQuestion={(voiceQuery) => onUserQuestion(voiceQuery, 'voice')}
              disabled={isLoading}
            />

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask me to write, explain, debug, or run ${currentLanguage} code... (Speak 🎤 or Type)`}
              disabled={isLoading}
              className="flex-1 max-h-32 min-h-[38px] bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-2 py-2 focus:outline-none resize-none"
            />

            {/* Send Button for typed queries */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-brand-400 to-emerald-400 hover:from-brand-300 hover:to-emerald-300 shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              title="Send question (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-3 pt-2">
            <div className="flex items-center gap-1.5">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">Enter</kbd> to send</span>
              <span>•</span>
              <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">Shift+Enter</kbd> for newline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Level:</span>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(['Beginner', 'Intermediate', 'Advanced'] as LearningLevel[]).map((lvl) => {
                  const isSel = learningLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onLearningLevelChange(lvl)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        isSel
                          ? lvl === 'Beginner'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                            : lvl === 'Intermediate'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
