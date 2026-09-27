export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type SupportedLanguage =
  | 'Python'
  | 'JavaScript'
  | 'TypeScript'
  | 'Java'
  | 'C'
  | 'C++'
  | 'HTML'
  | 'CSS'
  | 'SQL'
  | 'C#'
  | 'Go'
  | 'Rust'
  | 'PHP'
  | 'Kotlin'
  | 'Swift';

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
  created_at?: string;
}

export interface LineByLineExplanation {
  line: string;
  explanation: string;
}

export interface ExampleIO {
  input: string;
  output: string;
}

export interface ComplexityInfo {
  time: string;
  space: string;
}

export interface DebugInfo {
  isDebugging: boolean;
  identifiedError?: string;
  errorCause?: string;
  fixExplanation?: string;
}

export interface AICodingResponse {
  understanding?: string;
  title: string;
  language: SupportedLanguage | string;
  learningLevel: LearningLevel;
  explanation: string;
  complexity?: ComplexityInfo | null;
  algorithm: string[];
  code: string;
  lineByLine: LineByLineExplanation[];
  exampleIO: ExampleIO;
  commonMistakes: string[];
  debugInfo?: DebugInfo;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  inputType?: 'voice' | 'text';
  metadata_json?: string;
  metadata?: AICodingResponse | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  language: string;
  learning_level: LearningLevel;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
  engine?: string;
}

export interface SavedProgram {
  id: string;
  user_id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  created_at: string;
}

export interface UserSettings {
  apiKey: string;
  defaultLanguage: SupportedLanguage;
  defaultLevel: LearningLevel;
  voiceSpeed: number; // 0.8 - 1.4
  voiceEnabled: boolean;
  autoSpeakExplanation: boolean;
  theme: 'dark' | 'light';
}

export type LoadingStage =
  | 'IDLE'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'THINKING'
  | 'GENERATING_CODE'
  | 'RESPONSE_READY';
