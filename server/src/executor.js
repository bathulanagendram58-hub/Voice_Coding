import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// Language mappings for Piston Sandbox API
const PISTON_LANGUAGE_MAP = {
  python: { language: 'python', version: '3.10.0' },
  py: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  js: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  ts: { language: 'typescript', version: '5.0.3' },
  c: { language: 'c', version: '10.2.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  'c++': { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  csharp: { language: 'csharp', version: '6.12.0' },
  'c#': { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  php: { language: 'php', version: '8.2.3' },
  swift: { language: 'swift', version: '5.3.3' },
  kotlin: { language: 'kotlin', version: '1.8.20' }
};

// Language mappings for Wandbox Cloud Sandbox API
const WANDBOX_COMPILER_MAP = {
  c: 'gcc-head-c',
  cpp: 'gcc-head',
  'c++': 'gcc-head',
  java: 'openjdk-jdk-21+35',
  rust: 'rust-1.82.0',
  go: 'go-1.21.0',
  php: 'php-head',
  python: 'cpython-head',
  py: 'cpython-head',
  javascript: 'nodejs-head',
  js: 'nodejs-head',
  typescript: 'typescript-head',
  ts: 'typescript-head',
  csharp: 'mono-head',
  'c#': 'mono-head'
};

/**
 * Execute code via Local Runner (Python/Node) or Wandbox Cloud Sandbox
 */
export async function executeCode({ language, code, stdin = '' }) {
  const startTime = Date.now();
  const normalizedLang = (language || 'python').toLowerCase().trim();

  // 1. High-speed local runners for Python and JavaScript
  if (normalizedLang === 'python' || normalizedLang === 'py') {
    try {
      const res = await runLocalPython(code, stdin, startTime);
      if (res.success || !res.error.includes('spawn python ENOENT')) {
        return res;
      }
    } catch {}
  } else if (normalizedLang === 'javascript' || normalizedLang === 'js') {
    try {
      const res = await runLocalJavaScript(code, stdin, startTime);
      if (res.success || !res.error.includes('spawn node ENOENT')) {
        return res;
      }
    } catch {}
  }

  // 2. Cloud Sandbox execution via Wandbox (for C, C++, Java, Rust, Go, etc.)
  const compiler = WANDBOX_COMPILER_MAP[normalizedLang];
  if (compiler) {
    try {
      let processedCode = code;
      // In Wandbox, Java file is saved as prog.java, so class must not be declared public Main
      if (compiler.includes('openjdk')) {
        processedCode = processedCode.replace(/public\s+class\s+/g, 'class ');
      }

      const response = await axios.post(
        'https://wandbox.org/api/compile.json',
        {
          compiler,
          code: processedCode,
          stdin: stdin || ''
        },
        { timeout: 12000 }
      );

      const data = response.data || {};
      const executionTime = (Date.now() - startTime) / 1000;
      const isSuccess = data.status === '0' || data.status === 0;
      const output = (data.program_output || data.compiler_output || '').trim();
      const error = (data.compiler_error || data.program_error || '').trim();

      return {
        success: isSuccess && !data.compiler_error,
        output,
        error,
        exitCode: isSuccess ? 0 : 1,
        executionTime,
        engine: 'Cloud Sandbox (Wandbox)'
      };
    } catch (wandboxError) {
      console.warn('Wandbox execution failed:', wandboxError.message);
    }
  }

  // 3. Fallback to local runners if not yet executed
  if (normalizedLang === 'python' || normalizedLang === 'py') {
    return runLocalPython(code, stdin, startTime);
  } else if (normalizedLang === 'javascript' || normalizedLang === 'js') {
    return runLocalJavaScript(code, stdin, startTime);
  }

  return {
    success: false,
    output: '',
    error: `Execution for ${language} is not currently supported locally. You can still generate, edit, and explain the code.`,
    exitCode: 1,
    executionTime: (Date.now() - startTime) / 1000,
    engine: 'None'
  };
}

function getFileExtension(lang) {
  switch (lang) {
    case 'python':
    case 'py':
      return 'py';
    case 'javascript':
    case 'js':
      return 'js';
    case 'typescript':
    case 'ts':
      return 'ts';
    case 'c':
      return 'c';
    case 'c++':
    case 'cpp':
      return 'cpp';
    case 'java':
      return 'java';
    case 'go':
      return 'go';
    case 'rust':
      return 'rs';
    case 'php':
      return 'php';
    case 'swift':
      return 'swift';
    case 'c#':
    case 'csharp':
      return 'cs';
    default:
      return 'txt';
  }
}

function runLocalPython(code, stdin, startTime) {
  return new Promise((resolve) => {
    const tempDir = path.join(os.tmpdir(), 'voice-coding-exec');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFile = path.join(tempDir, `script_${crypto.randomUUID()}.py`);
    fs.writeFileSync(tempFile, code, 'utf-8');

    let output = '';
    let error = '';
    let killed = false;

    const child = spawn('python', [tempFile], {
      timeout: 6000,
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
    });

    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
    }, 6000);

    child.on('close', (code) => {
      clearTimeout(timer);
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch {}

      const executionTime = (Date.now() - startTime) / 1000;
      if (killed) {
        return resolve({
          success: false,
          output,
          error: 'Execution timed out (Limit: 6s). Please check for infinite loops.',
          exitCode: 124,
          executionTime,
          engine: 'Local Python Sandbox'
        });
      }

      resolve({
        success: code === 0 && !error,
        output,
        error,
        exitCode: code ?? 0,
        executionTime,
        engine: 'Local Python Sandbox'
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch {}
      resolve({
        success: false,
        output: '',
        error: `Python execution error: ${err.message}`,
        exitCode: 1,
        executionTime: (Date.now() - startTime) / 1000,
        engine: 'Local Python Sandbox'
      });
    });
  });
}

function runLocalJavaScript(code, stdin, startTime) {
  return new Promise((resolve) => {
    const tempDir = path.join(os.tmpdir(), 'voice-coding-exec');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFile = path.join(tempDir, `script_${crypto.randomUUID()}.js`);
    fs.writeFileSync(tempFile, code, 'utf-8');

    let output = '';
    let error = '';
    let killed = false;

    const child = spawn('node', [tempFile], {
      timeout: 6000
    });

    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
    });

    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
    }, 6000);

    child.on('close', (code) => {
      clearTimeout(timer);
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch {}

      const executionTime = (Date.now() - startTime) / 1000;
      if (killed) {
        return resolve({
          success: false,
          output,
          error: 'Execution timed out (Limit: 6s). Please check for infinite loops.',
          exitCode: 124,
          executionTime,
          engine: 'Local Node.js Sandbox'
        });
      }

      resolve({
        success: code === 0 && !error,
        output,
        error,
        exitCode: code ?? 0,
        executionTime,
        engine: 'Local Node.js Sandbox'
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch {}
      resolve({
        success: false,
        output: '',
        error: `Node execution error: ${err.message}`,
        exitCode: 1,
        executionTime: (Date.now() - startTime) / 1000,
        engine: 'Local Node.js Sandbox'
      });
    });
  });
}
