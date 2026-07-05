#!/bin/bash
# Vanta Suite — Install Script
# Installs all dependencies and build tools for Linux Mint Cinnamon.

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Vanta Suite — Installer"
echo "  A keyboard-first productivity suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Step 1: System dependencies ──────────────────────────────────
echo "📦 Step 1/4: Installing system build tools..."
echo "   (sudo may prompt for your password)"
echo ""

if command -v apt-get &> /dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq \
    build-essential \
    python3 \
    libgtk-3-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xdg-utils \
    wmctrl \
    curl \
    2>&1 | tail -3
  echo "   ✅ System packages installed"
else
  echo "   ⚠️  apt-get not found — please install build tools manually:"
  echo "      build-essential python3 libgtk-3-dev wmctrl curl"
fi

# ── Step 2: Node.js check ────────────────────────────────────────
echo ""
echo "📦 Step 2/4: Checking Node.js..."

NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")

if [ "$NODE_VERSION" -lt 18 ]; then
  echo "   ⚠️  Node.js 18+ required (found: $(node --version 2>/dev/null || echo 'none'))"
  echo "   Install via:"
  echo "     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  echo "     sudo apt-get install -y nodejs"
  exit 1
fi
echo "   ✅ Node.js $(node --version)"

# ── Step 3: npm install ──────────────────────────────────────────
echo ""
echo "📦 Step 3/4: Installing npm dependencies..."
echo "   (This may take a minute for native modules like better-sqlite3)"

npm install --legacy-peer-deps 2>&1 | tail -5
echo "   ✅ npm dependencies installed"

# ── Step 4: Build ────────────────────────────────────────────────
echo ""
echo "📦 Step 4/4: Building the app..."

# Ensure data directories exist
mkdir -p data/config/profiles data/commands data/workflows data/plugins data/db data/logs

# Create default configs if they don't exist
if [ ! -f data/config/settings.json ]; then
  echo '{"activeProfile":"default","theme":"dark","portableMode":true,"profiles":["default"]}' > data/config/settings.json
fi
if [ ! -f data/config/shortcuts.json ]; then
  echo '[
  {"action":"command-palette","keys":"Ctrl+Space","scope":"global","profile":"default"},
  {"action":"toggle-quake-terminal","keys":"Ctrl+`","scope":"global","profile":"default"},
  {"action":"keyboard-shortcuts","keys":"Ctrl+K+S","scope":"global","profile":"default"}
]' > data/config/shortcuts.json
fi

# Build the Vite frontend
npx vite build 2>&1 | tail -5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Installation complete!"
echo ""
echo "  To start Vanta Suite:"
echo "    npm start"
echo ""
echo "  To run in development mode with hot-reload:"
echo "    npm run dev"
echo ""
echo "  To build a distributable package:"
echo "    npm run build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
