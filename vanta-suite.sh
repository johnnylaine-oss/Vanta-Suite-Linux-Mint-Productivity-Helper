#!/bin/bash
# Vanta Suite — Desktop Launcher
# Double-click this file (or run from terminal) to start Vanta Suite.
# Make sure npm install has been run first.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️  Dependencies not installed. Running npm install first..."
  npm install --legacy-peer-deps || {
    echo "❌ npm install failed. Please run: sudo apt-get install -y build-essential python3"
    echo "   Then: npm install"
    read -p "Press Enter to close..."
    exit 1
  }
fi

# Check if dist/renderer exists, build if needed
if [ ! -d "dist/renderer" ]; then
  echo "🔨 Building Vite renderer..."
  npx vite build || {
    echo "❌ Build failed."
    read -p "Press Enter to close..."
    exit 1
  }
fi

# Start Vite dev server in background, wait, then launch Electron
echo "🚀 Starting Vanta Suite..."

# Kill any existing Vite server on port 5173 (from previous runs)
lsof -ti:5173 | xargs -r kill -9 2>/dev/null || true

# Start Vite dev server
npx vite --host 2>&1 &
VITE_PID=$!

# Wait for Vite to be ready (poll port 5173)
for i in $(seq 1 15); do
  if lsof -ti:5173 >/dev/null 2>&1; then
    echo "   ✅ Vite dev server ready"
    break
  fi
  sleep 0.5
done

# Launch Electron
npx electron . 2>&1 &
ELECTRON_PID=$!

# When Electron exits, clean up Vite
trap "kill $VITE_PID 2>/dev/null; exit" EXIT
wait $ELECTRON_PID
