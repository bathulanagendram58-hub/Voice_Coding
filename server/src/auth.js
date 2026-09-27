import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'voice-coding-super-secret-key-2025';

export function registerUser(name, email, password) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const id = 'usr_' + crypto.randomUUID();
  const password_hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (?, ?, ?, ?)
  `).run(id, name.trim(), normalizedEmail, password_hash);

  const token = jwt.sign({ id, name: name.trim(), email: normalizedEmail }, JWT_SECRET, { expiresIn: '30d' });
  return { id, name: name.trim(), email: normalizedEmail, token };
}

export function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid email or password.');
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  return { id: user.id, name: user.name, email: user.email, token };
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}
