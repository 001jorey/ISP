#!/usr/bin/env bash

# KijaniLink One-Click Setup & Installer
set -e

echo "🌿 Installing KijaniLink Smart WiFi Ecosystem dependencies..."

echo "📦 1/2 Installing backend packages..."
cd backend && npm install

echo "📦 2/2 Installing frontend packages & building 3D Glassmorphic UI..."
cd ../frontend && npm install && npm run build

cd ..
echo "🎉 Installation complete! Run './start.sh' to launch KijaniLink."
