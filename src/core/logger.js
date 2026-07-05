// Vanta Suite — Structured JSON Logger.
// All log messages go to data/logs/vanta-suite.log, rotated daily, capped total size.
// Debug mode increases verbosity; controlled via settings.

import { appendFileSync, mkdirSync, statSync, renameSync, unlinkSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { LOG_PREFIX } from '../config/brand.js';

const MAX_LOG_SIZE_MB = 10;
const MAX_TOTAL_LOGS_MB = 50;
const LOG_DIR = join(process.cwd(), 'data', 'logs');
const LOG_FILE = join(LOG_DIR, `${LOG_PREFIX}.log`);

let debugMode = false;
let logQueue = [];
let flushScheduled = false;

// Ensure log directory exists
try {
  mkdirSync(LOG_DIR, { recursive: true });
} catch {
  // Directory may already exist — that's fine
}

/**
 * Enable or disable debug-level logging.
 * @param {boolean} enabled
 */
export function setDebugMode(enabled) {
  debugMode = enabled;
}

/**
 * Get current debug mode status.
 * @returns {boolean}
 */
export function isDebugMode() {
  return debugMode;
}

/**
 * Rotate log file if it exceeds the max size.
 */
function rotateIfNeeded() {
  try {
    const stats = statSync(LOG_FILE);
    if (stats.size > MAX_LOG_SIZE_MB * 1024 * 1024) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = join(LOG_DIR, `${LOG_PREFIX}-${timestamp}.log`);
      try {
        renameSync(LOG_FILE, rotatedPath);
      } catch {
        // Couldn't rotate — continue writing to current file
      }

      // Clean up old logs if total exceeds max
      cleanupOldLogs();
    }
  } catch {
    // File doesn't exist yet — that's fine
  }
}

/**
 * Remove oldest log files until total log size is under the cap.
 */
function cleanupOldLogs() {
  try {
    const files = readdirSync(LOG_DIR)
      .filter((f) => f.startsWith(LOG_PREFIX) && f.endsWith('.log'))
      .map((f) => ({
        name: f,
        path: join(LOG_DIR, f),
        mtime: statSync(join(LOG_DIR, f)).mtime,
        size: statSync(join(LOG_DIR, f)).size,
      }))
      .sort((a, b) => a.mtime - b.mtime);

    let totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const maxBytes = MAX_TOTAL_LOGS_MB * 1024 * 1024;

    // Remove oldest files until under the limit
    for (const file of files) {
      if (totalSize <= maxBytes) break;
      try {
        unlinkSync(file.path);
        totalSize -= file.size;
      } catch {
        // Couldn't delete — skip
      }
    }
  } catch {
    // Couldn't clean up — not critical
  }
}

/**
 * Flush queued log entries to disk.
 */
function flush() {
  if (logQueue.length === 0) return;
  flushScheduled = false;

  const entries = logQueue.splice(0);
  const lines = entries.map((e) => JSON.stringify(e)).join('\n') + '\n';

  try {
    rotateIfNeeded();
    appendFileSync(LOG_FILE, lines, 'utf-8');
  } catch (err) {
    // Logging failure should never crash the app
    console.error('Failed to write to log file:', err.message);
  }
}

/**
 * Schedule a flush to disk (batches writes for performance).
 */
function scheduleFlush() {
  if (flushScheduled) return;
  flushScheduled = true;
  setImmediate(flush);
}

/**
 * Core log function — enqueues a structured log entry.
 * @param {string} level - log | info | warn | error | debug
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {object} [data] - Optional structured data
 */
function log(level, module, message, data = {}) {
  const entry = {
    t: new Date().toISOString(),
    l: level,
    m: module,
    msg: message,
    ...(Object.keys(data).length > 0 && { d: data }),
  };

  // Also print to console for development
  const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  consoleFn(`[${entry.t}] [${level.toUpperCase()}] [${module}] ${message}`, Object.keys(data).length ? data : '');

  logQueue.push(entry);
  scheduleFlush();
}

export const logger = {
  log: (module, message, data) => log('log', module, message, data),
  info: (module, message, data) => log('info', module, message, data),
  warn: (module, message, data) => log('warn', module, message, data),
  error: (module, message, data) => log('error', module, message, data),
  debug: (module, message, data) => {
    if (debugMode) log('debug', module, message, data);
  },
};

export default logger;
