// Vanta Suite — System Tray.
// Creates and manages the system tray icon with a context menu.
// The tray persists even when the main window is hidden.

import { Tray, Menu, nativeImage, app } from 'electron';
import { createPNG } from './pngEncoder.js';
import logger from '../core/logger.js';
import { BRAND_NAME } from '../config/brand.js';
import { getMainWindow } from './windowManager.js';

let tray = null;

/**
 * Create the system tray icon and menu.
 * @param {BrowserWindow} mainWindow - Reference to the main renderer window
 * @returns {Tray}
 */
export function createTray(mainWindow) {
  // Create a simple 16x16 gold square icon programmatically
  // In production, use a proper icon file
  const icon = nativeImage.createFromDataURL(createTrayIconDataUrl());

  tray = new Tray(icon);
  tray.setToolTip(BRAND_NAME);

  tray.on('click', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  updateTrayMenu(tray, mainWindow, true);

  return tray;
}

/**
 * Update the tray context menu based on window visibility.
 * @param {Tray} tray
 * @param {BrowserWindow} mainWindow
 * @param {boolean} isWindowVisible
 */
export function updateTrayMenu(tray, mainWindow, isWindowVisible) {
  if (!tray || tray.isDestroyed()) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isWindowVisible ? 'Hide Window' : 'Show Window',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (isWindowVisible) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Command Palette',
      accelerator: 'Ctrl+Space',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('hotkey:pressed', 'command-palette');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('module:open', 'settings');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Vanta Suite',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

/**
 * Generate a data URL for a simple gold tray icon.
 * In production, replace with a proper .png icon file.
 * @returns {string} data:image/png;base64,...
 */
function createTrayIconDataUrl() {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const centerDist = Math.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2) / 8;

      if (centerDist > 1) {
        canvas[idx] = 10;     // R
        canvas[idx + 1] = 10; // G
        canvas[idx + 2] = 12; // B
        canvas[idx + 3] = 0;  // A (transparent)
      } else {
        // Gold gradient
        const t = centerDist;
        canvas[idx] = Math.round(244 - t * 80);     // R
        canvas[idx + 1] = Math.round(214 - t * 48);  // G
        canvas[idx + 2] = Math.round(140 - t * 100);  // B
        canvas[idx + 3] = 255;                        // A
      }
    }
  }

  return createPNG(size, size, canvas);
}
