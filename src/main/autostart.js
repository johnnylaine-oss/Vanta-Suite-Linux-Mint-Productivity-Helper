// Vanta Suite — Linux Auto-launch helper.
// Mirrors the "Launch on Login" setting by writing/removing the XDG autostart
// .desktop file at ~/.config/autostart/vanta-suite.desktop.
//
// We do not rely on Electron's app.setLoginItemSettings() because its Linux
// implementation writes a generic .desktop file that doesn't honor our custom
// flags (e.g. --background) reliably across distro versions (Cinnamon / XDG).
//
// In dev (app not packaged) we point Exec at vanta-suite.sh in the project
// root. In production we point at the bundled electron exe.

import { app } from 'electron';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import logger from '../core/logger.js';

const AUTOSTART_DIR = join(homedir(), '.config', 'autostart');
const AUTOSTART_FILE = join(AUTOSTART_DIR, 'vanta-suite.desktop');

/**
 * Resolve the absolute path to vanta-suite.sh (dev) or the packaged exe (prod).
 * @returns {string}
 */
function resolveExecPath() {
  if (app.isPackaged) {
    return `${app.getPath('exe')} --background`;
  }
  return `${process.cwd()}/vanta-suite.sh --background`;
}

/**
 * Resolve the absolute path to the icon asset.
 * @returns {string}
 */
function resolveIconPath() {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'assets', 'icon.png');
  }
  return join(process.cwd(), 'assets', 'icon.png');
}

/**
 * Build the autostart .desktop file contents.
 * @returns {string}
 */
function buildDesktopEntry() {
  const exec = resolveExecPath();
  const icon = resolveIconPath();
  return [
    '[Desktop Entry]',
    'Name=Vanta Suite',
    'Comment=Productivity helper — auto-starts minimized to tray on login',
    `Exec=${exec}`,
    `Icon=${icon}`,
    'Terminal=false',
    'Type=Application',
    'Categories=Utility;',
    'StartupWMClass=Vanta Suite',
    'X-GNOME-Autostart-enabled=true',
    'X-GNOME-Autostart-Delay=2',
    '',
  ].join('\n');
}

/**
 * Apply the current auto-launch state.
 * @param {boolean} enabled
 */
export function applyAutostart(enabled) {
  try {
    if (!enabled) {
      if (existsSync(AUTOSTART_FILE)) {
        unlinkSync(AUTOSTART_FILE);
        logger.info('autostart', `Removed ${AUTOSTART_FILE}`);
      }
      return { ok: true, enabled: false };
    }

    mkdirSync(AUTOSTART_DIR, { recursive: true });
    writeFileSync(AUTOSTART_FILE, buildDesktopEntry(), 'utf-8');
    logger.info('autostart', `Wrote ${AUTOSTART_FILE}`);
    return { ok: true, enabled: true, path: AUTOSTART_FILE };
  } catch (err) {
    logger.error('autostart', `Failed to apply autostart (enabled=${enabled})`, { error: err.message });
    return { ok: false, error: err.message };
  }
}

/**
 * Return the current state (best-effort — does not consult gsettings).
 * @returns {boolean}
 */
export function isAutostartEnabled() {
  return existsSync(AUTOSTART_FILE);
}

/**
 * Read the bundled autostart template (vanta-suite-autostart.desktop) for
 * reference, if present. Not used by applyAutostart() but exposed for the
 * settings UI to surface the underlying file contents.
 */
export function readAutostartTemplate() {
  try {
    const templatePath = join(process.cwd(), 'vanta-suite-autostart.desktop');
    if (existsSync(templatePath)) {
      return readFileSync(templatePath, 'utf-8');
    }
  } catch (err) {
    logger.warn('autostart', 'Failed to read template', { error: err.message });
  }
  return '';
}

export default {
  applyAutostart,
  isAutostartEnabled,
  readAutostartTemplate,
};
