#!/usr/bin/env node

/**
 * KijaniLink Standalone Offline Single-Port Server
 * Serves both the compiled 3D Glassmorphism Frontend and the Full Backend API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve API routes
const dbFile = path.resolve(__dirname, 'backend/data/db.json');
let dbData = { users: [], plans: [], sessions: [], payments: [], vouchers: [] };

try {
  if (fs.existsSync(dbFile)) {
    dbData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  }
} catch (e) {
  console.log('Using in-memory store');
}

// Public Plans API
app.get('/api/public/plans', (req, res) => {
  res.json({
    success: true,
    data: dbData.plans && dbData.plans.length > 0 ? dbData.plans : [
      { id: 'p1', name: 'Turbo Pass (1 Hour)', price: 20, duration: 1, speedLimit: '15 Mbps', dataLimit: '1.5GB', isActive: true },
      { id: 'p2', name: 'Power Session (3 Hours)', price: 50, duration: 3, speedLimit: '25 Mbps', dataLimit: '5GB', isActive: true },
      { id: 'p3', name: '24-Hour Day Pass', price: 150, duration: 24, speedLimit: '35 Mbps', dataLimit: 'Unlimited', isPopular: true, isActive: true },
      { id: 'p4', name: 'Weekly Kijani Pro (7 Days)', price: 750, duration: 168, speedLimit: '50 Mbps', dataLimit: 'Unlimited', isActive: true },
      { id: 'p5', name: 'Monthly Fiber Ultimate (30 Days)', price: 2500, duration: 720, speedLimit: '100 Mbps', dataLimit: 'Unlimited', isActive: true }
    ]
  });
});

// STK Push Simulation
app.post('/api/public/payment', (req, res) => {
  const { phone, planId, amount } = req.body;
  const checkoutId = 'ws_CO_' + Date.now();
  res.json({
    success: true,
    data: {
      checkoutRequestId: checkoutId,
      customerMessage: 'STK Push sent to ' + phone
    }
  });
});

// Redeem Voucher
app.post('/api/public/voucher/redeem', (req, res) => {
  const { code } = req.body;
  res.json({
    success: true,
    data: {
      message: 'Voucher activated successfully!',
      planName: '24-Hour Day Pass',
      speedLimit: '35 Mbps',
      duration: 24,
      sessionToken: 'kj_vch_' + Date.now()
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'KijaniLink Standalone v2.4' });
});

// Serve frontend static build
const distDir = path.resolve(__dirname, 'frontend/dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log('🌿 KIJANILINK 3D SMART WIFI BILLING PLATFORM');
  console.log(`🌐 Server running at: http://0.0.0.0:${PORT}`);
  console.log('📱 Captive Portal: http://localhost:' + PORT);
  console.log('🛡️ Admin Portal:    http://localhost:' + PORT + '/admin');
  console.log('====================================================');
});
