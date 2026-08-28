# 🌿 KijaniLink — 3D Glassmorphism Smart ISP & WiFi Billing Ecosystem

> **"Unganisha. Lipa. Furahia — Ultra-Fast Kenyan Broadband"**

KijaniLink is an enterprise-grade, 3D glassmorphic ISP management, MikroTik router hotspot provisioning, and Safaricom M-Pesa automated billing ecosystem built for Kenyan ISPs, hotspot operators, cybercafés, hotels, campuses, and residential fiber networks.

---

## 🌟 Visual & Technical Highlights

### 🎨 3D Glassmorphism Interface
- **Layered Frosted Glass Panels**: Ultra-smooth blur effects with depth refraction and dynamic specular glare.
- **Interactive 3D Perspective Tilt**: Micro-interactions reacting in real-time to cursor movements.
- **3D Particle & Geometric Mesh Canvas**: Floating neon emerald, cyan, and deep sapphire ambient backdrops.
- **3D Animated Speedometer Gauge**: Live needle dial testing ping latency, jitter, download, and upload throughput.
- **Interactive 3D Network Topology Cluster**: Visualizes Tier-1 SEACOM Fiber -> Gateway -> MikroTik CCR2004 Core Edge -> Ubiquiti/MikroTik Sector APs -> Connected Hotspot Clients.
- **3D Smartphone SIM Toolkit Simulator**: Ultra-realistic interactive Safaricom M-Pesa STK Push popup with numeric keypad and instant authentication.
- **3D Holographic Scratch & QR Vouchers**: Batch voucher generator with printable holographic cards and QR codes.

### 💰 Automated Kenyan Payment Gateway
- **Safaricom Daraja API 2.0**: Native STK Push (Lipa na M-Pesa Online), Paybill (174379), and Till Numbers.
- **Instant Automatic Hotspot Login**: Seamless device MAC unblocking upon payment confirmation callback.
- **Scratch Card Vouchers**: Direct code redemption for cash customers.

### 🛡️ MikroTik RouterOS & Hardware Control
- **RouterOS v6 & v7 API Integration**: Auto-creates dynamic Hotspot users, user profiles, and bandwidth rate limits.
- **Live Terminal Console**: Execute direct RouterOS terminal commands (`/ip hotspot user print`, `/interface print`, `/system resource print`).
- **Live Hardware Telemetry**: CPU load, free memory, board temperature, interface traffic, and active client leases.

---

## 🚀 Quick Start (Local & Standalone)

### Option 1: 1-Click Launch (Recommended)
```bash
./install.sh
./start.sh
```
- **Customer Captive Portal**: [http://localhost:3000](http://localhost:3000)
- **Admin NOC Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Default Admin Login**: `admin@kijanilink.com` / `admin123`

### Option 2: Standalone Zero-Dependency Offline Server
```bash
node start-offline.js
```
Opens everything on port `3000` with zero configuration!

### Option 3: Docker Compose Multi-Service Stack
```bash
docker-compose up -d
```

---

## 📁 Project Architecture

```
KijaniLink/
├── backend/                  # Express.js + TypeScript + RouterOS + Daraja API
│   ├── data/                 # Local zero-config SQLite & JSON persistence
│   ├── src/
│   │   ├── database/         # Database layer (SQLite & PostgreSQL support)
│   │   ├── middleware/       # JWT auth & security guard
│   │   ├── routes/           # REST endpoints (public, admin, plans, sessions, mpesa)
│   │   ├── services/         # MikroTik API, Daraja STK Push, Africa's Talking SMS
│   │   └── server.ts         # Edge server
│   └── package.json
├── frontend/                 # React 18 + Vite + Tailwind CSS + Recharts + 3D Canvas
│   ├── src/
│   │   ├── components/       # 3D Glassmorphism components (SpeedTest, Topology, PhoneSim, Terminal)
│   │   ├── hooks/            # useAuth state management
│   │   ├── pages/            # CustomerPortal, AdminDashboard, AdminLogin
│   │   ├── services/         # API integration layer
│   │   └── index.css         # 3D glassmorphic styling & keyframes
│   └── vite.config.ts
├── mikrotik-hotspot/         # MikroTik RouterOS captive portal drag-and-drop templates
│   ├── login.html            # 3D glassmorphic login redirect
│   ├── status.html           # Active session bandwidth & countdown
│   └── logout.html           # Disconnect confirmation
├── install.sh                # Linux / macOS automated installer
├── start.sh                  # Linux / macOS dual service launcher
├── start.bat                 # Windows launcher
├── start-offline.js          # Standalone bundled runner
└── docker-compose.yml        # Production container setup
```

---

## 📡 MikroTik Hotspot Setup Guide

1. Log into your MikroTik router via **Winbox**.
2. Navigate to **IP -> Hotspot -> Server Profiles -> default**.
3. Set **HTML Directory** to `flash/hotspot` or `hotspot`.
4. Open the **Files** menu in Winbox and drag the contents of `mikrotik-hotspot/` into your router's hotspot directory.
5. In **IP -> Services**, ensure `api` (port `8728`) is enabled with allowed IP subnet.

---

## 📜 Default Pre-Configured Plans

| Package Name | Duration | Price | Speed Tier | Data Cap | Ideal For |
|:---|:---|:---|:---|:---|:---|
| **Turbo Pass** | 1 Hour | KES 20 | 15 Mbps | 1.5 GB | WhatsApp, quick browsing & TikTok |
| **Power Session** | 3 Hours | KES 50 | 25 Mbps | 5 GB | Zoom meetings & YouTube HD |
| **24-Hour Day Pass** | 24 Hours | KES 150 | 35 Mbps | Unlimited | Full day gaming & 4K Netflix |
| **Weekly Kijani Pro** | 7 Days | KES 750 | 50 Mbps | Unlimited | Remote workers & heavy downloads |
| **Monthly Fiber Ultimate**| 30 Days | KES 2,500 | 100 Mbps | Unlimited | VIP residential & business fiber |

---

## 📄 License & Credits
Licensed under the MIT License. Developed for Kenyan and African digital broadband expansion. 🇰🇪
