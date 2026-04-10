#!/bin/bash
set -e

echo "🦷 HP Odonto Marketing Platform — Setup"
echo "======================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required. Install from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

echo "Node.js $(node -v)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Install Playwright browsers
echo ""
echo "Installing Playwright Chromium..."
npx playwright install chromium

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "IMPORTANT: Edit .env.local with your actual API keys"
fi

# Create output directories
mkdir -p outputs assets

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your API keys"
echo "  2. Run Supabase migrations (see supabase/README.md)"
echo "  3. npm run dev  — start the frontend"
echo "  4. npm run pipeline:worker — start the pipeline worker"
echo ""
