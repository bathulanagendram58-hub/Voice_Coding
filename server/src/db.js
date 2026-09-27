import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'voice_coding_db.json');

// Persistent JSON Storage engine with SQLite-like prepare/get/all/run interface
class EmbeddedDB {
  constructor() {
    this.data = {
      users: [],
      conversations: [],
      messages: [],
      programs: [],
      executions: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.conversations) this.data.conversations = [];
        if (!this.data.messages) this.data.messages = [];
        if (!this.data.programs) this.data.programs = [];
        if (!this.data.executions) this.data.executions = [];
      } else {
        this.save();
      }
    } catch (e) {
      console.warn('Error loading db file, initializing new:', e.message);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db file:', e.message);
    }
  }

  pragma(cmd) {
    // no-op for compatibility
  }

  exec(sql) {
    // schema initialization no-op
  }

  prepare(sql) {
    const s = sql.trim();

    // --- USERS ---
    if (s.includes('SELECT * FROM users WHERE email = ?') || s.includes('SELECT id FROM users WHERE email = ?')) {
      return {
        get: (email) => {
          this.load();
          return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        }
      };
    }

    if (s.includes('SELECT id, name, email, created_at FROM users WHERE id = ?') || s.includes('SELECT * FROM users WHERE id = ?')) {
      return {
        get: (id) => {
          this.load();
          const u = this.data.users.find(u => u.id === id);
          if (!u) return null;
          return { id: u.id, name: u.name, email: u.email, created_at: u.created_at };
        }
      };
    }

    if (s.includes('INSERT INTO users')) {
      return {
        run: (id, name, email, password_hash) => {
          this.load();
          const newUser = {
            id,
            name,
            email: email.toLowerCase(),
            password_hash,
            created_at: new Date().toISOString()
          };
          this.data.users.push(newUser);
          this.save();
          return { changes: 1 };
        }
      };
    }

    // --- CONVERSATIONS ---
    if (s.includes('SELECT c.*') && s.includes('FROM conversations c')) {
      return {
        all: (userId) => {
          this.load();
          const list = this.data.conversations
            .filter(c => c.user_id === userId)
            .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

          return list.map(c => {
            const msgs = this.data.messages.filter(m => m.conversation_id === c.id);
            const lastMsg = msgs[msgs.length - 1]?.content || '';
            return {
              ...c,
              message_count: msgs.length,
              last_message: lastMsg
            };
          });
        }
      };
    }

    if (s.includes('SELECT * FROM conversations WHERE id = ? AND user_id = ?')) {
      return {
        get: (id, userId) => {
          this.load();
          return this.data.conversations.find(c => c.id === id && c.user_id === userId) || null;
        }
      };
    }

    if (s.includes('SELECT * FROM conversations WHERE id = ?')) {
      return {
        get: (id) => {
          this.load();
          return this.data.conversations.find(c => c.id === id) || null;
        }
      };
    }

    if (s.includes('INSERT INTO conversations')) {
      return {
        run: (id, userId, title, language, learningLevel) => {
          this.load();
          const now = new Date().toISOString();
          const conv = {
            id,
            user_id: userId,
            title,
            language: language || 'Python',
            learning_level: learningLevel || 'Beginner',
            created_at: now,
            updated_at: now
          };
          this.data.conversations.unshift(conv);
          this.save();
          return { changes: 1 };
        }
      };
    }

    if (s.includes('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')) {
      return {
        run: (id) => {
          this.load();
          const conv = this.data.conversations.find(c => c.id === id);
          if (conv) {
            conv.updated_at = new Date().toISOString();
            this.save();
          }
          return { changes: 1 };
        }
      };
    }

    if (s.includes('DELETE FROM conversations WHERE id = ? AND user_id = ?')) {
      return {
        run: (id, userId) => {
          this.load();
          this.data.conversations = this.data.conversations.filter(c => !(c.id === id && c.user_id === userId));
          this.data.messages = this.data.messages.filter(m => m.conversation_id !== id);
          this.save();
          return { changes: 1 };
        }
      };
    }

    // --- MESSAGES ---
    if (s.includes('SELECT role, content FROM messages WHERE conversation_id = ?')) {
      return {
        all: (convId) => {
          this.load();
          return this.data.messages
            .filter(m => m.conversation_id === convId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(m => ({ role: m.role, content: m.content }));
        }
      };
    }

    if (s.includes('SELECT * FROM messages WHERE conversation_id = ?')) {
      return {
        all: (convId) => {
          this.load();
          return this.data.messages
            .filter(m => m.conversation_id === convId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
      };
    }

    if (s.includes('INSERT INTO messages')) {
      return {
        run: (id, conversationId, role, content, metadata_json = null) => {
          this.load();
          const msg = {
            id,
            conversation_id: conversationId,
            role,
            content,
            metadata_json: metadata_json || null,
            created_at: new Date().toISOString()
          };
          this.data.messages.push(msg);
          this.save();
          return { changes: 1 };
        }
      };
    }

    // --- SAVED PROGRAMS ---
    if (s.includes('SELECT * FROM programs WHERE user_id = ?')) {
      return {
        all: (userId) => {
          this.load();
          return this.data.programs
            .filter(p => p.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      };
    }

    if (s.includes('SELECT * FROM programs WHERE id = ?')) {
      return {
        get: (id) => {
          this.load();
          return this.data.programs.find(p => p.id === id) || null;
        }
      };
    }

    if (s.includes('INSERT INTO programs')) {
      return {
        run: (id, userId, title, language, code, description = '') => {
          this.load();
          const prog = {
            id,
            user_id: userId,
            title,
            language,
            code,
            description,
            created_at: new Date().toISOString()
          };
          this.data.programs.unshift(prog);
          this.save();
          return { changes: 1 };
        }
      };
    }

    if (s.includes('UPDATE programs')) {
      return {
        run: (title, language, code, description, id, userId) => {
          this.load();
          const prog = this.data.programs.find(p => p.id === id && p.user_id === userId);
          if (prog) {
            if (title !== undefined && title !== null) prog.title = title;
            if (language !== undefined && language !== null) prog.language = language;
            if (code !== undefined && code !== null) prog.code = code;
            if (description !== undefined && description !== null) prog.description = description;
            this.save();
          }
          return { changes: 1 };
        }
      };
    }

    if (s.includes('DELETE FROM programs WHERE id = ? AND user_id = ?')) {
      return {
        run: (id, userId) => {
          this.load();
          this.data.programs = this.data.programs.filter(p => !(p.id === id && p.user_id === userId));
          this.save();
          return { changes: 1 };
        }
      };
    }

    // --- EXECUTIONS ---
    if (s.includes('INSERT INTO executions')) {
      return {
        run: (id, userId, programId, language, code, input, output, error, executionTime) => {
          this.load();
          const exec = {
            id,
            user_id: userId,
            program_id: programId,
            language,
            code,
            input,
            output,
            error,
            execution_time: executionTime,
            created_at: new Date().toISOString()
          };
          this.data.executions.push(exec);
          this.save();
          return { changes: 1 };
        }
      };
    }

    // Fallback stub
    return {
      run: () => ({ changes: 0 }),
      get: () => null,
      all: () => []
    };
  }
}

export const db = new EmbeddedDB();

export function initDB() {
  db.load();
  // Ensure demo student user exists
  const guest = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@example.com');
  if (!guest) {
    const hash = bcrypt.hashSync('demo123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run('user_demo_default', 'Demo Student', 'demo@example.com', hash);
  }

  const student = db.prepare('SELECT id FROM users WHERE email = ?').get('student@voicecode.ai');
  if (!student) {
    const hash = bcrypt.hashSync('password123', 10);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run('user_student_default', 'Alex Rivera', 'student@voicecode.ai', hash);
  }
}
