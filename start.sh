#!/usr/bin/env bash

# KijaniLink Automated Local Starter Script
set -e

echo "🌿 Starting KijaniLink 3D Glassmorphism Smart ISP Platform..."

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required (v18+). Please install Node.js."
  exit 1
fi

# Run backend in background
echo "🚀 Starting KijaniLink Core Edge Backend on port 5000..."
cd backend && npm run dev &
BACKEND_PID=$!

# Run frontend in background
echo "🌐 Starting KijaniLink 3D Glassmorphism UI on port 3000..."
cd ../frontend && npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

echo "✨ KijaniLink is live!"
echo "👉 Customer Portal: http://localhost:3000"
echo "👉 Admin NOC Portal: http://localhost:3000/admin"

# Wait on processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
