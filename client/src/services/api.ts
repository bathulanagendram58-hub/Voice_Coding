import { User, Conversation, Message, AICodingResponse, ExecutionResult, SavedProgram, LearningLevel } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('voice_coding_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Auth API
export async function register(name: string, email: string, password: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function login(email: string, password: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function getMe(): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
  return data;
}

// Chat & AI Generation
export async function askAIQuestion({
  prompt,
  conversationId,
  language,
  learningLevel,
  customApiKey,
  isDebugging,
  brokenCode,
}: {
  prompt: string;
  conversationId?: string | null;
  language: string;
  learningLevel: LearningLevel;
  customApiKey?: string;
  isDebugging?: boolean;
  brokenCode?: string;
}): Promise<{ success: boolean; conversationId: string; response: AICodingResponse }> {
  const res = await fetch(`${API_BASE}/chat/ask`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      prompt,
      conversationId,
      language,
      learningLevel,
      customApiKey,
      isDebugging,
      brokenCode,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate code from AI');
  return data;
}

export async function explainErrorWithAI({
  code,
  error,
  language,
  learningLevel,
  customApiKey,
}: {
  code: string;
  error: string;
  language: string;
  learningLevel: LearningLevel;
  customApiKey?: string;
}): Promise<{ success: boolean; explanation: AICodingResponse }> {
  const res = await fetch(`${API_BASE}/chat/explain-error`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code, error, language, learningLevel, customApiKey }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to explain error');
  return data;
}

// Conversations
export async function fetchConversations(): Promise<{ conversations: Conversation[] }> {
  const res = await fetch(`${API_BASE}/conversations`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch conversations');
  return data;
}

export async function fetchConversationDetails(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch conversation');
  return data;
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete conversation');
  return data;
}

// Code Execution
export async function executeCodeOnServer({
  language,
  code,
  stdin = '',
  programId = null,
}: {
  language: string;
  code: string;
  stdin?: string;
  programId?: string | null;
}): Promise<ExecutionResult> {
  const res = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ language, code, stdin, programId }),
  });
  const data = await res.json();
  return data;
}

// Saved Programs
export async function fetchSavedPrograms(): Promise<{ programs: SavedProgram[] }> {
  const res = await fetch(`${API_BASE}/programs`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch saved programs');
  return data;
}

export async function saveProgram({
  title,
  language,
  code,
  description,
}: {
  title: string;
  language: string;
  code: string;
  description?: string;
}): Promise<{ success: boolean; program: SavedProgram }> {
  const res = await fetch(`${API_BASE}/programs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, language, code, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save program');
  return data;
}

export async function deleteProgram(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/programs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete program');
  return data;
}
