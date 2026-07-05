// Vanta Suite — brand configuration.
// All branding (app ID, window title, config folder, log prefix) resolved from this single file.
// Change the name here, and the entire app rebrands without touching feature code.

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const brandPath = join(__dirname, '..', '..', 'data', 'config', 'brand.json');
let brandData;

try {
  brandData = JSON.parse(readFileSync(brandPath, 'utf-8'));
} catch {
  // Fallback defaults if brand.json is missing
  brandData = {
    brandName: 'Vanta Suite',
    appId: 'com.vanta-suite.app',
    configFolder: 'vanta-suite',
    windowTitle: 'Vanta Suite',
    logPrefix: 'vanta-suite',
  };
}

export const BRAND_NAME = brandData.brandName;
export const APP_ID = brandData.appId;
export const CONFIG_FOLDER = brandData.configFolder;
export const WINDOW_TITLE = brandData.windowTitle;
export const LOG_PREFIX = brandData.logPrefix;

export default {
  BRAND_NAME,
  APP_ID,
  CONFIG_FOLDER,
  WINDOW_TITLE,
  LOG_PREFIX,
};
