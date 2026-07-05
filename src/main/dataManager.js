// Vanta Suite — Data Manager.
// In-memory + JSON-file backed storage for clipboard, notifications, and reminders.
// Falls back to pure in-memory if JSON persistence fails.
// Designed to be swappable with SQLite when build tools are available.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import logger from '../core/logger.js';

const DATA_DIR = join(process.cwd(), 'data');

// Ensure db directory exists
try { mkdirSync(join(DATA_DIR, 'db'), { recursive: true }); } catch {}

// --- Generic JSON Store ---
class JsonStore {
  constructor(filename, maxItems = 500) {
    this.filePath = join(DATA_DIR, 'db', filename);
    this.maxItems = maxItems;
    this.items = [];
    this.load();
  }

  load() {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8');
        this.items = JSON.parse(raw);
        if (!Array.isArray(this.items)) this.items = [];
      }
    } catch (err) {
      logger.warn('data-manager', `Failed to load ${this.filePath}`, { error: err.message });
      this.items = [];
    }
  }

  save() {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.items.slice(0, this.maxItems), null, 2), 'utf-8');
    } catch (err) {
      logger.error('data-manager', `Failed to save ${this.filePath}`, { error: err.message });
    }
  }

  getAll() { return [...this.items]; }

  add(item) {
    this.items.unshift(item);
    if (this.items.length > this.maxItems) {
      // Remove oldest unpinned items
      const pinned = this.items.filter(i => i.pinned);
      const unpinned = this.items.filter(i => !i.pinned).slice(0, this.maxItems - pinned.length);
      this.items = [...pinned, ...unpinned];
    }
    this.save();
  }

  findById(id) { return this.items.find(i => i.id === id); }

  update(id, updates) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.items[idx] = { ...this.items[idx], ...updates };
      this.save();
      return true;
    }
    return false;
  }

  remove(id) {
    const len = this.items.length;
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  clear() { this.items = []; this.save(); }

  export() { return JSON.stringify(this.items, null, 2); }

  import(data) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (Array.isArray(parsed)) {
        this.items = [...parsed, ...this.items].slice(0, this.maxItems);
        this.save();
        return true;
      }
    } catch { return false; }
    return false;
  }
}

// --- Stores ---
export const clipboardStore = new JsonStore('clipboard.json', 500);
export const notificationsStore = new JsonStore('notifications.json', 250);
export const remindersStore = new JsonStore('reminders.json', 500);

// --- Clipboard Helpers ---
export function addClipboardItem(content, type = 'text') {
  clipboardStore.add({
    id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    type,
    timestamp: new Date().toISOString(),
    pinned: false,
  });
}

export function getClipboardHistory() { return clipboardStore.getAll(); }

// --- Notification Helpers ---
export function addNotification(content, variant = 'info', appName = 'system') {
  notificationsStore.add({
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    variant,
    appName,
    timestamp: new Date().toISOString(),
    pinned: false,
  });
}

export function getNotificationHistory() { return notificationsStore.getAll(); }

export function dismissNotification(id) { return notificationsStore.remove(id); }

export function pinNotification(id) {
  return notificationsStore.update(id, { pinned: true });
}

// --- Reminder Helpers ---
export function addReminder(reminder) {
  remindersStore.add({
    id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: reminder.title || 'Reminder',
    description: reminder.description || '',
    time: reminder.time || new Date().toISOString(),
    done: false,
    overdue: false,
    recurring: reminder.recurring || null,
    snoozedUntil: null,
    createdAt: new Date().toISOString(),
  });
}

export function getReminders() {
  // Mark overdue items
  const now = new Date();
  const items = remindersStore.getAll();
  for (const item of items) {
    if (!item.done && !item.overdue) {
      const itemTime = new Date(item.time);
      if (itemTime < now) item.overdue = true;
    }
  }
  return items;
}

export function removeReminder(id) { return remindersStore.remove(id); }

export function snoozeReminder(id, durationMs = 600000) {
  const item = remindersStore.findById(id);
  if (item) {
    const newTime = new Date(Date.now() + durationMs).toISOString();
    remindersStore.update(id, { time: newTime, snoozedUntil: newTime, overdue: false });
  }
}

export function markReminderDone(id) {
  return remindersStore.update(id, { done: true });
}

export function updateReminder(id, updates) {
  return remindersStore.update(id, updates);
}

// --- Natural language time parsing ---
// Returns { time: ISOString, recurring: string|null }
export function parseNaturalTime(text) {
  const now = new Date();
  const lower = text.toLowerCase().trim();
  let recurring = null;

  // "in X minutes/hours/days/weeks/months"
  const inMatch = lower.match(/in\s+(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs|day|days|d|week|weeks|w|month|months|mo)\b/i);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2].toLowerCase();
    const multipliers = { minute: 60000, min: 60000, mins: 60000, minutes: 60000, hour: 3600000, hr: 3600000, hrs: 3600000, hours: 3600000, day: 86400000, d: 86400000, days: 86400000, week: 604800000, w: 604800000, weeks: 604800000, month: 2592000000, mo: 2592000000, months: 2592000000 };
    const ms = (multipliers[unit] || 60000) * amount;
    return { time: new Date(now.getTime() + ms).toISOString(), recurring: null };
  }

  // "tomorrow" or "tomorrow [time]"
  if (lower.includes('tomorrow')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1]);
      if (h > 23) h = 23;
      const m = Math.min(parseInt(timeMatch[2]) || 0, 59);
      const ampm = timeMatch[3]?.toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      d.setHours(h, m, 0, 0);
    } else {
      d.setHours(9, 0, 0, 0);
    }
    return { time: d.toISOString(), recurring: null };
  }

  // "every monday/tuesday/..." etc - match "every" anywhere in the string
  const dayMatch = lower.match(/every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|month|year)\s*(@\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i);
  if (dayMatch) {
    const recType = dayMatch[1].toLowerCase();
    const d = new Date(now);
    if (dayMatch[3]) {
      let h = parseInt(dayMatch[3]);
      if (h > 23) h = 23;
      const m = Math.min(parseInt(dayMatch[4]) || 0, 59);
      const ampm = dayMatch[5]?.toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      d.setHours(h, m, 0, 0);
    }
    if (d <= now) d.setDate(d.getDate() + 1);
    return { time: d.toISOString(), recurring: recType };
  }

  // Specific time like "2pm", "14:30", "noon", "midnight"
  if (lower.includes('noon')) return { time: (() => { const d = new Date(now); d.setHours(12, 0, 0, 0); if (d <= now) d.setDate(d.getDate()+1); return d.toISOString(); })(), recurring: null };
  if (lower.includes('midnight')) return { time: (() => { const d = new Date(now); d.setDate(d.getDate()+1); d.setHours(0, 0, 0, 0); return d.toISOString(); })(), recurring: null };

  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]);
    if (h > 23) h = 23;
    const m = Math.min(parseInt(timeMatch[2]) || 0, 59);
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return { time: d.toISOString(), recurring: null };
  }

  // Default: 1 hour from now
  return { time: new Date(now.getTime() + 3600000).toISOString(), recurring: null };
}
