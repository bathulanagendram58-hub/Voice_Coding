import express from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { registerUser, loginUser, authMiddleware, optionalAuthMiddleware } from './auth.js';
import { generateAIResponse } from './ai.js';
import { executeCode } from './executor.js';

export const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- AUTH ROUTES ---

router.post('/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = registerUser(name, email, password);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = loginUser(email, password);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

router.get('/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// --- CONVERSATIONS & CHAT ---

router.get('/conversations', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
    `).all(req.user.id);
    res.json({ conversations: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/conversations', authMiddleware, (req, res) => {
  try {
    const { title = 'New Chat', language = 'Python', learningLevel = 'Beginner' } = req.body;
    const id = 'conv_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO conversations (id, user_id, title, language, learning_level)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, title, language, learningLevel);

    const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
    res.json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversations/:id', authMiddleware, (req, res) => {
  try {
    const conv = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conv.id);
    const parsedMessages = messages.map(m => ({
      ...m,
      metadata: m.metadata_json ? JSON.parse(m.metadata_json) : null
    }));

    res.json({ conversation: conv, messages: parsedMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/conversations/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Main AI Question / Coding Generation
router.post('/chat/ask', optionalAuthMiddleware, async (req, res) => {
  try {
    const {
      prompt,
      conversationId,
      language = 'Python',
      learningLevel = 'Beginner',
      customApiKey,
      isDebugging = false,
      brokenCode = null
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Question or code prompt is required.' });
    }

    const userId = req.user?.id || 'guest_user';
    let targetConvId = conversationId;

    // Fetch conversation history if available
    let history = [];
    if (targetConvId) {
      const dbMsgs = db.prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10').all(targetConvId);
      history = dbMsgs;
    }

    // Call AI Coding Engine
    const aiResponse = await generateAIResponse({
      prompt: prompt.trim(),
      language,
      learningLevel,
      conversationHistory: history,
      customApiKey,
      isDebugging,
      brokenCode
    });

    // If authenticated, persist conversation and messages
    if (req.user && req.user.id) {
      if (!targetConvId) {
        targetConvId = 'conv_' + crypto.randomUUID();
        const chatTitle = aiResponse.title || (prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt);
        db.prepare(`
          INSERT INTO conversations (id, user_id, title, language, learning_level)
          VALUES (?, ?, ?, ?, ?)
        `).run(targetConvId, req.user.id, chatTitle, aiResponse.language || language, learningLevel);
      } else {
        db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP, language = ?, learning_level = ? WHERE id = ?').run(aiResponse.language || language, learningLevel, targetConvId);
      }

      // Insert user message
      const userMsgId = 'msg_' + crypto.randomUUID();
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content)
        VALUES (?, ?, ?, ?)
      `).run(userMsgId, targetConvId, 'user', prompt.trim());

      // Insert assistant message with structured metadata
      const aiMsgId = 'msg_' + crypto.randomUUID();
      db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, metadata_json)
        VALUES (?, ?, ?, ?, ?)
      `).run(aiMsgId, targetConvId, 'assistant', aiResponse.explanation || aiResponse.code, JSON.stringify(aiResponse));
    }

    res.json({
      success: true,
      conversationId: targetConvId,
      response: aiResponse
    });
  } catch (err) {
    console.error('Chat ask error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate coding response. Please try again.' });
  }
});

// Explain Execution Error
router.post('/chat/explain-error', optionalAuthMiddleware, async (req, res) => {
  try {
    const { code, error, language, learningLevel = 'Beginner', customApiKey } = req.body;
    const prompt = `Explain this error for a beginner student:\nLanguage: ${language}\nCode:\n${code}\nError:\n${error}\nPlease explain what caused this error, how to fix it, and give the corrected code.`;

    const aiResponse = await generateAIResponse({
      prompt,
      language,
      learningLevel,
      customApiKey,
      isDebugging: true,
      brokenCode: code
    });

    res.json({ success: true, explanation: aiResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CODE EXECUTION ---

router.post('/execute', optionalAuthMiddleware, async (req, res) => {
  try {
    const { language, code, stdin = '', programId = null } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code content is required for execution.' });
    }

    const result = await executeCode({ language, code, stdin });

    // Save execution record
    try {
      const execId = 'exec_' + crypto.randomUUID();
      db.prepare(`
        INSERT INTO executions (id, user_id, program_id, language, code, input, output, error, execution_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        execId,
        req.user?.id || null,
        programId || null,
        language,
        code,
        stdin || '',
        result.output || '',
        result.error || '',
        result.executionTime || 0
      );
    } catch (e) {
      console.warn('Could not record execution:', e.message);
    }

    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      exitCode: result.exitCode,
      executionTime: result.executionTime,
      engine: result.engine
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      output: '',
      error: `Execution server error: ${err.message}`,
      exitCode: 1,
      executionTime: 0
    });
  }
});

// --- SAVED PROGRAMS ---

router.get('/programs', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM programs WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ programs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/programs', authMiddleware, (req, res) => {
  try {
    const { title, language, code, description = '' } = req.body;
    if (!title || !code || !language) {
      return res.status(400).json({ error: 'Title, language, and code are required' });
    }

    const id = 'prog_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO programs (id, user_id, title, language, code, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, title.trim(), language, code, description);

    const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(id);
    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id', authMiddleware, (req, res) => {
  try {
    const { title, language, code, description } = req.body;
    db.prepare(`
      UPDATE programs
      SET title = COALESCE(?, title),
          language = COALESCE(?, language),
          code = COALESCE(?, code),
          description = COALESCE(?, description)
      WHERE id = ? AND user_id = ?
    `).run(title, language, code, description, req.params.id, req.user.id);

    const updated = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id);
    res.json({ success: true, program: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/programs/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM programs WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
