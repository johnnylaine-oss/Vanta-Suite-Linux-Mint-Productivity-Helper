// Vanta Suite — Window Manager.
// Creates and manages the main BrowserWindow.
// Handles window state persistence, positioning, and IPC communication.

import { BrowserWindow, app } from 'electron';
import { join, dirname } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import logger from '../core/logger.js';
import { BRAND_NAME, WINDOW_TITLE } from '../config/brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow = null;
let windowStatePath;

const DEFAULT_WINDOW_STATE = {
  x: undefined,
  y: undefined,
  width: 1100,
  height: 750,
  isMaximized: false,
};

/**
 * Create the main renderer BrowserWindow.
 * @param {object} settings - App settings
 * @returns {BrowserWindow}
 */
export function createWindow(settings = {}) {
  const DATA_DIR = join(process.cwd(), 'data');
  windowStatePath = join(DATA_DIR, 'config', 'window-state.json');

  const windowState = loadWindowState();
  const { width, height, x, y, isMaximized } = windowState;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    minWidth: 800,
    minHeight: 550,
    title: WINDOW_TITLE,
    frame: false,           // Custom window chrome via VWindow component
    transparent: true,      // For rounded corners and glass effects
    backgroundColor: '#0A0A0C',
    titleBarStyle: 'hidden',
    show: false,            // Show only after ready-to-show
    webPreferences: {
      preload: join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,        // Required for node-pty serialization
    },
    icon: join(__dirname, '..', '..', 'assets', 'icon.png'),
  });

  // Load the renderer
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, '..', '..', 'dist', 'renderer', 'index.html'));
  }

  // Show when ready to prevent flash
  mainWindow.once('ready-to-show', () => {
    if (!settings.startup?.launchMinimized) {
      mainWindow.show();
    }
    if (isMaximized) {
      mainWindow.maximize();
    }
  });

  // Save window state on changes
  mainWindow.on('close', () => {
    saveWindowState();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Hide instead of close (daemon stays running)
  mainWindow.on('close', (event) => {
    if (!isQuitting()) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Prevent title from being updated by page
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  logger.info('window-manager', 'Main window created');

  return mainWindow;
}

/**
 * Get the current main window reference.
 * @returns {BrowserWindow|null}
 */
export function getMainWindow() {
  return mainWindow;
}

/**
 * Load window state from disk.
 * @returns {object}
 */
function loadWindowState() {
  try {
    if (existsSync(windowStatePath)) {
      const saved = JSON.parse(readFileSync(windowStatePath, 'utf-8'));
      return { ...DEFAULT_WINDOW_STATE, ...saved };
    }
  } catch (err) {
    logger.warn('window-manager', 'Failed to load window state', { error: err.message });
  }
  return { ...DEFAULT_WINDOW_STATE };
}

/**
 * Save current window state to disk.
 */
function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  try {
    const bounds = mainWindow.getBounds();
    const isMaximized = mainWindow.isMaximized();

    // Only save if not maximized (maximized bounds are not useful)
    const state = isMaximized
      ? { isMaximized: true }
      : {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          isMaximized: false,
        };

    const dir = dirname(windowStatePath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(windowStatePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('window-manager', 'Failed to save window state', { error: err.message });
  }
}

// Reference to app isQuitting for close handling
let quittingFlag = false;

export function setQuitting(flag) {
  quittingFlag = flag;
}

function isQuitting() {
  return quittingFlag;
}
