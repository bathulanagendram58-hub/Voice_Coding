import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { AuthModal } from './components/AuthModal';
import { SavedProgramsModal } from './components/SavedProgramsModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import {
  User,
  Conversation,
  Message,
  SupportedLanguage,
  LearningLevel,
  SavedProgram,
  UserSettings,
  ExecutionResult,
  AICodingResponse,
  LoadingStage
} from './types';
import {
  getMe,
  fetchConversations,
  fetchConversationDetails,
  deleteConversation,
  askAIQuestion,
  explainErrorWithAI,
  executeCodeOnServer,
  fetchSavedPrograms,
  saveProgram,
  deleteProgram
} from './services/api';
import { voiceSpeaker } from './services/speech';

export const App: React.FC = () => {
  // User & Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('voice_coding_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      apiKey: '',
      defaultLanguage: 'Python',
      defaultLevel: 'Beginner',
      voiceSpeed: 1.0,
      voiceEnabled: true,
      autoSpeakExplanation: false,
      theme: 'dark',
    };
  });

  // Active Coding State
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(settings.defaultLanguage);
  const [learningLevel, setLearningLevel] = useState<LearningLevel>(settings.defaultLevel);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(settings.autoSpeakExplanation);

  // Sidebar & Navigation State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('IDLE');

  // Modals
  const [isSavedProgramsOpen, setIsSavedProgramsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [savedProgramsList, setSavedProgramsList] = useState<SavedProgram[]>([]);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('voice_coding_token');
    if (token) {
      getMe()
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            loadConversations();
            loadSavedPrograms();
          } else {
            localStorage.removeItem('voice_coding_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('voice_coding_token');
        });
    }
  }, []);

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setCurrentLanguage(newSettings.defaultLanguage);
    setLearningLevel(newSettings.defaultLevel);
    setAutoSpeak(newSettings.autoSpeakExplanation);
    localStorage.setItem('voice_coding_settings', JSON.stringify(newSettings));
  };

  const loadConversations = async () => {
    try {
      const res = await fetchConversations();
      setConversations(res.conversations || []);
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    }
  };

  const loadSavedPrograms = async () => {
    try {
      const res = await fetchSavedPrograms();
      setSavedProgramsList(res.programs || []);
    } catch (e) {
      console.warn('Failed to load saved programs:', e);
    }
  };

  // Switch Conversation
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setIsLoading(true);
    setLoadingStage('THINKING');
    try {
      const res = await fetchConversationDetails(id);
      if (res.conversation) {
        if (res.conversation.language) {
          setCurrentLanguage(res.conversation.language as SupportedLanguage);
        }
        if (res.conversation.learning_level) {
          setLearningLevel(res.conversation.learning_level);
        }
      }
      setMessages(res.messages || []);
    } catch (e) {
      console.error('Failed to load conversation details:', e);
    } finally {
      setIsLoading(false);
      setLoadingStage('IDLE');
    }
  };

  // New Chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  // Delete Conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  /**
   * CORE UNIFIED USER QUESTION HANDLER (Voice & Text)
   * Both input methods call this function directly with no extra clicks required.
   */
  const handleUserQuestion = async (
    questionText: string,
    inputType: 'voice' | 'text' = 'text',
    customCode?: string
  ) => {
    if (!questionText.trim() || isLoading) return;

    const trimmed = questionText.trim();
    const lower = trimmed.toLowerCase();

    // 1. Voice/Text Command: Switch Learning Level
    const isLevelCommand = lower.includes('switch') || lower.includes('change') || lower.includes('set') || lower.includes('mode') || lower.startsWith('level') || lower.endsWith('level');
    if ((lower.includes('intermediate') || lower === 'intermediate') && (isLevelCommand || lower === 'intermediate' || lower === 'intermediate level')) {
      setLearningLevel('Intermediate');
      if (autoSpeak) voiceSpeaker.speak('Switched learning level to Intermediate.', settings.voiceSpeed);
      return;
    }
    if ((lower.includes('advanced') || lower.includes('advance') || lower === 'advanced' || lower === 'advance') && (isLevelCommand || lower === 'advance' || lower === 'advanced' || lower === 'advanced level')) {
      setLearningLevel('Advanced');
      if (autoSpeak) voiceSpeaker.speak('Switched learning level to Advanced.', settings.voiceSpeed);
      return;
    }
    if ((lower.includes('beginner') || lower === 'beginner') && (isLevelCommand || lower === 'beginner' || lower === 'beginner level')) {
      setLearningLevel('Beginner');
      if (autoSpeak) voiceSpeaker.speak('Switched learning level to Beginner.', settings.voiceSpeed);
      return;
    }

    // 2. Voice/Text Command: Switch Programming Language
    const langMap: Record<string, SupportedLanguage> = {
      'python': 'Python',
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'java': 'Java',
      'c++': 'C++',
      'cpp': 'C++',
      'c sharp': 'C#',
      'c#': 'C#',
      'c ': 'C',
      'sql': 'SQL',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'kotlin': 'Kotlin',
      'swift': 'Swift'
    };
    if (lower.startsWith('switch to ') || lower.startsWith('change language to ') || lower.startsWith('select language ')) {
      for (const [key, langName] of Object.entries(langMap)) {
        if (lower.endsWith(key) || lower.includes(` ${key}`)) {
          setCurrentLanguage(langName);
          if (autoSpeak) voiceSpeaker.speak(`Switched programming language to ${langName}.`, settings.voiceSpeed);
          return;
        }
      }
    }

    // 3. Auto-detect requested level in user prompt if explicitly mentioned
    let targetLevel = learningLevel;
    if (lower.includes('advanced') || lower.includes('advance level')) {
      targetLevel = 'Advanced';
      setLearningLevel('Advanced');
    } else if (lower.includes('intermediate')) {
      targetLevel = 'Intermediate';
      setLearningLevel('Intermediate');
    } else if (lower.includes('beginner')) {
      targetLevel = 'Beginner';
      setLearningLevel('Beginner');
    }

    const tempUserMsgId = 'usr_' + Date.now();
    const userMsg: Message = {
      id: tempUserMsgId,
      conversation_id: activeConversationId || '',
      role: 'user',
      content: trimmed,
      inputType,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLoadingStage('THINKING');

    setTimeout(() => {
      setLoadingStage('GENERATING_CODE');
    }, 400);

    try {
      const res = await askAIQuestion({
        prompt: trimmed,
        conversationId: activeConversationId,
        language: currentLanguage,
        learningLevel: targetLevel,
        customApiKey: settings.apiKey,
        isDebugging: !!customCode,
        brokenCode: customCode,
      });

      if (res.conversationId && res.conversationId !== activeConversationId) {
        setActiveConversationId(res.conversationId);
        loadConversations();
      }

      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        conversation_id: res.conversationId || activeConversationId || '',
        role: 'assistant',
        content: res.response.explanation || res.response.code,
        metadata: res.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoadingStage('RESPONSE_READY');

      // If auto-speak enabled, read out the explanation
      if (autoSpeak && res.response.explanation) {
        voiceSpeaker.speak(res.response.explanation, settings.voiceSpeed);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'err_' + Date.now(),
        conversation_id: activeConversationId || '',
        role: 'assistant',
        content: `Error: ${err.message || "We couldn't connect to the AI service. Please try again."}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingStage('IDLE');
    }
  };

  // Safe Sandboxed Code Execution
  const handleExecuteCode = async (
    language: string,
    code: string,
    stdin: string = ''
  ): Promise<ExecutionResult> => {
    const res = await executeCodeOnServer({ language, code, stdin });
    if (res.success) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#22c55e', '#06b6d4', '#4ade80'],
        });
      } catch {}
    }
    return res;
  };

  // Explain Error with AI Handler
  const handleExplainErrorWithAI = async (code: string, error: string, language: string) => {
    const prompt = `Please explain this execution error and how to fix it:\n${error}`;
    handleUserQuestion(prompt, 'text', code);
  };

  // Save Program Handler
  const handleSaveProgram = async (title: string, language: string, code: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await saveProgram({ title, language, code });
      if (res.program) {
        setSavedProgramsList((prev) => [res.program, ...prev]);
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#f59e0b', '#22c55e', '#eab308'],
          });
        } catch {}
      }
    } catch (err) {
      console.error('Failed to save program:', err);
    }
  };

  // Delete Saved Program
  const handleDeleteProgram = async (id: string) => {
    try {
      await deleteProgram(id);
      setSavedProgramsList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete program:', err);
    }
  };

  // Open program from Saved Programs Library
  const handleOpenProgram = (prog: SavedProgram) => {
    setCurrentLanguage(prog.language as SupportedLanguage);
    const customResponse: AICodingResponse = {
      understanding: `Loaded saved program: "${prog.title}"`,
      title: prog.title,
      language: prog.language,
      learningLevel,
      explanation: prog.description || `Saved program: ${prog.title}`,
      algorithm: ['1. Load saved program', '2. Run and test output in sandbox'],
      code: prog.code,
      lineByLine: [],
      exampleIO: { input: 'Sample Input', output: 'Program Output' },
      commonMistakes: [],
    };

    const newMsg: Message = {
      id: 'saved_open_' + Date.now(),
      conversation_id: activeConversationId || '',
      role: 'assistant',
      content: prog.title,
      metadata: customResponse,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('voice_coding_token');
    setUser(null);
    setConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    setSavedProgramsList([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500/30 selection:text-brand-300">
      {/* Top Navbar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        learningLevel={learningLevel}
        onLearningLevelChange={setLearningLevel}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenSavedPrograms={() => {
          if (!user) setIsAuthOpen(true);
          else {
            loadSavedPrograms();
            setIsSavedProgramsOpen(true);
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => {
          const next = !autoSpeak;
          setAutoSpeak(next);
          if (!next) voiceSpeaker.stop();
        }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onOpenSavedPrograms={() => {
            if (!user) setIsAuthOpen(true);
            else {
              loadSavedPrograms();
              setIsSavedProgramsOpen(true);
            }
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onSelectLanguage={setCurrentLanguage}
          currentLanguage={currentLanguage}
          learningLevel={learningLevel}
          onLearningLevelChange={setLearningLevel}
          user={user}
          onLogout={handleLogout}
        />

        {/* Chat / AI Hands-Free Workspace */}
        <main className="flex-1 flex flex-col lg:pl-72 transition-all duration-300">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            loadingStage={loadingStage}
            onUserQuestion={handleUserQuestion}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            learningLevel={learningLevel}
            onLearningLevelChange={setLearningLevel}
            onExecuteCode={handleExecuteCode}
            onSaveProgram={handleSaveProgram}
            onExplainErrorWithAI={handleExplainErrorWithAI}
            autoSpeak={autoSpeak}
          />
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          loadConversations();
          loadSavedPrograms();
        }}
      />

      <SavedProgramsModal
        isOpen={isSavedProgramsOpen}
        onClose={() => setIsSavedProgramsOpen(false)}
        programs={savedProgramsList}
        onOpenProgram={handleOpenProgram}
        onDeleteProgram={handleDeleteProgram}
        onRunProgram={(prog) => {
          handleOpenProgram(prog);
          handleExecuteCode(prog.language, prog.code);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectPrompt={(p) => handleUserQuestion(p, 'text')}
      />
    </div>
  );
};
