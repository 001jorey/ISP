@echo off
title KijaniLink Smart ISP & WiFi Billing Ecosystem
echo ====================================================
echo   🌿 KIJANILINK 3D SMART ISP BILLING SYSTEM
echo ====================================================
echo Starting Backend API Server (Port 5000)...
start cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo Starting 3D Glassmorphism Frontend (Port 3000)...
start cmd /k "cd frontend && npm run dev"
echo.
echo All services launched!
echo Customer Portal: http://localhost:3000
echo Admin NOC:       http://localhost:3000/admin (admin@kijanilink.com / admin123)
echo ====================================================
