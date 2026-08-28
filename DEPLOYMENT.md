# 🌿 KijaniLink — Local & Production Deployment Manual

This guide covers deploying KijaniLink on:
1. Local Workstation (Offline or Connected)
2. Standalone Downloadable Bundle
3. Linux VPS (Ubuntu 22.04 / 24.04 with Nginx & SSL)
4. Docker & Docker Compose
5. MikroTik RouterOS Hardware Integration

---

## 1. Local Deployment with Zip Bundle

1. Extract the downloaded `kijanilink-deployment-package.zip`:
   ```bash
   unzip kijanilink-deployment-package.zip -d kijanilink
   cd kijanilink
   ```
2. Run the automated installer:
   ```bash
   ./install.sh
   ```
3. Start the application:
   ```bash
   ./start.sh
   ```
   Or on Windows:
   ```cmd
   start.bat
   ```
4. Access:
   - **Customer Captive Portal**: http://localhost:3000
   - **Admin Operations Center**: http://localhost:3000/admin (User: `admin@kijanilink.com` / `admin123`)

---

## 2. Standalone Single-Port Deployment

For low-power microcomputers (Raspberry Pi, Orange Pi, mini PC, local server connected to MikroTik LAN):
```bash
node start-offline.js
```
Runs everything seamlessly on port `3000` with zero external dependencies.

---

## 3. Production Deployment on Ubuntu VPS

### Prerequisites
- Ubuntu 22.04 / 24.04 LTS
- Domain name pointed to VPS IP (e.g. `wifi.yourdomain.co.ke`)
- Node.js 20+

### Step-by-Step
```bash
# 1. Update system & install Node.js + PM2 + Nginx
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 2. Clone repository & build
git clone <your-repo-url> /var/www/kijanilink
cd /var/www/kijanilink
./install.sh

# 3. Start Backend with PM2
cd /var/www/kijanilink/backend
pm2 start dist/server.js --name "kijanilink-backend"
pm2 startup
pm2 save

# 4. Configure Nginx Reverse Proxy
sudo nano /etc/nginx/sites-available/kijanilink
```

Nginx configuration block:
```nginx
server {
    listen 80;
    server_name wifi.yourdomain.co.ke;

    # Frontend compiled assets
    root /var/www/kijanilink/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site & obtain SSL certificate
sudo ln -s /etc/nginx/sites-available/kijanilink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wifi.yourdomain.co.ke
```

---

## 4. Environment Variables Reference

Create `.env` inside `backend/`:
```env
# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=super_secret_kijanilink_key_change_in_production

# M-Pesa Daraja 2.0 Credentials
MPESA_ENVIRONMENT=production # or sandbox
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_SHORTCODE=174379 # Your Paybill or Till number
MPESA_PASSKEY=your_daraja_passkey
MPESA_CALLBACK_URL=https://wifi.yourdomain.co.ke/api/public/payment/mpesa/callback

# MikroTik RouterOS API
MIKROTIK_HOST=192.168.88.1
MIKROTIK_PORT=8728
MIKROTIK_USERNAME=admin
MIKROTIK_PASSWORD=your_router_password

# Africa's Talking SMS Gateway
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_africastalking_api_key
```
