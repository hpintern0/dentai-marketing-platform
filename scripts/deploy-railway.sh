#!/bin/bash
set -e

echo "Deploying DentAI to Railway..."

# Check railway CLI
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm i -g @railway/cli
fi

# Login check
railway whoami || railway login

# Deploy
railway up --detach

echo "Deploy initiated! Check Railway dashboard for status."
