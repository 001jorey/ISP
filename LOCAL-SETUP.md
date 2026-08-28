# 🖥️ Local Setup Guide — WSL & Docker

This guide walks you through the COLLOSPOT WiFi Billing System and gives you two
ways to run it locally: **natively on WSL** (recommended for development) or
**with Docker Compose**. Every step below has been verified against this repo.

---

## 1. What this project is

A WiFi hotspot billing system for Kenya: customers browse plans through a
captive portal, and the backend manages sessions on a **MikroTik router**
via its API. Admins manage users, plans, sessions and payments from a
dashboard.

> Note: M-Pesa payment and SMS integrations have been removed from this
> codebase. The customer portal shows plans, but online payment is disabled —
> plan activation is handled manually (see the portal's "Contact Us" notice).

### Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18 + TypeScript + Vite + Tailwind (customer portal **and** admin dashboard, one app) |
| Backend   | Node.js 18 + Express + TypeScript (nodemon/ts-node in dev) |
| Database  | **SQLite via Prisma ORM** — file at `backend/prisma/dev.db` |
| Router    | MikroTik RouterOS API (`node-routeros`, port 8728) |

> ⚠️ **The docs/README mention PostgreSQL, but the Prisma schema is SQLite**
> (`provider = "sqlite"`, `url = "file:./dev.db"` in `backend/prisma/schema.prisma`).
> `DATABASE_URL` in `.env` is currently ignored. You do **not** need to install
> any database server for local development.

### Architecture & data flow

```
Customer's phone ──> Captive portal (React, :3000)
                          │  /api  (Vite dev proxy → :5000)
                          ▼
                   Backend API (Express, :5000)
                 ┌────────┼─────────────────┐
                 ▼                       ▼
          SQLite (Prisma)          MikroTik router
          plans/users/             (hotspot users,
          sessions/payments        profiles, speed limits)
```

**Customer flow:** portal → browse plans → contact support to activate
(payment is currently disabled) → a **session** is created on the MikroTik
router → customer browses.

**Admin flow:** login at `/admin` (JWT) → dashboard, users, plans, sessions,
payments management.

### Key files

```
backend/
  prisma/schema.prisma      # DB models: User, Plan, Session, Payment, Voucher
  src/server.ts             # Express app, routes, cron cleanup (every 5 min)
  src/routes/               # auth, plans, payments, sessions, admin, public
  src/services/             # mikrotikService, sessionService
  src/database/seed.ts      # seeds admin user + 5 default plans
frontend/
  src/pages/                # CustomerPortal, AdminLogin, AdminDashboard
  src/components/           # Users/Plans/Sessions/Payments management
  src/services/api.ts       # axios clients (public + admin)
docker-compose.yml          # backend + frontend containers
```

### Default admin (after seeding)

- **Email:** `admin@collospot.com`
- **Password:** `admin123`

MikroTik credentials are **not needed to run the UI** — you'll just see API
errors in the logs when something talks to a real router.

---

## 2. Option A — Native setup on WSL (recommended)

### 2.1 One-time prerequisites

In WSL (Ubuntu):

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl

# Node.js 18+ (via nvm — avoid sudo installs)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20        # 18 also works; 20 recommended
node -v
```

> 💡 Keep the repo under `~/projects` (ext4), **not** `/mnt/c/...` — npm and
> file watching are many times slower on the Windows drive.

### 2.2 Get the code

```bash
git clone <repository-url> miktrotik-hotspot-billing
cd miktrotik-hotspot-billing
```

### 2.3 Install dependencies

```bash
npm install                 # root (concurrently)
cd backend  && npm install  # express, prisma, ts-node, nodemon
cd ../frontend && npm install  # react, vite, tailwind
```

(Equivalent: `npm run install:all` from the root.)

### 2.4 Configure environment

```bash
cd backend
cp .env.example .env
```

The placeholder values in `.env` are **fine for local UI development**
(MikroTik calls will simply log errors without a real router).
Only `JWT_SECRET` matters for auth — change it to any long random string:

```bash
JWT_SECRET="some-long-random-string-for-local-dev"
```

### 2.5 Create + seed the database (SQLite — nothing to install)

```bash
cd backend
npm run db:generate   # generates the Prisma client
npm run db:push       # creates backend/prisma/dev.db from the schema
npm run db:seed       # creates admin@collospot.com + the 5 default plans
```

You should see `🌱 Seeding database...` … `🎉 Database seeded successfully!`

### 2.6 Start the servers

From the **repo root**:

```bash
npm run dev
```

This starts both (backend on :5000 via nodemon+ts-node, frontend on :3000 via Vite).
Prefer separate terminals?

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Wait for:

```
🚀 COLLOSPOT Server running on port 5000
  VITE v4.x  ready in ~300 ms
```

> First backend start takes ~10–30 s (ts-node compiles on the fly).
> The backend may print `❌ Failed to connect to MikroTik router` errors —
> expected, ignore them unless you have a real router configured.

### 2.7 Access it

| What | URL |
|------|-----|
| Customer portal | http://localhost:3000 |
| Admin login | http://localhost:3000/admin |
| API health | http://localhost:5000/health |

The Windows-side browser can open `localhost:3000` directly — WSL2 forwards
localhost automatically.

**Smoke test:**

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/public/plans
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@collospot.com","password":"admin123"}'
```

The last one should return `{ "success": true, "data": { "user": ..., "token": "..." } }`.
Then log in at http://localhost:3000/admin with the credentials above.

### 2.8 WSL-specific notes

- **Ports in use:** if Windows already occupies 3000/5000 you'll get an
  `EADDRINUSE`. Check with `netstat -ano | findstr :3000` on the Windows side,
  or change ports in `frontend/vite.config.ts` (and `PORT` in `backend/.env`).
- **MikroTik router access:** put the router's **LAN IP** in `MIKROTIK_HOST`.
  From WSL2 you reach LAN devices directly. If the router is the *Windows host*
  itself, use its WSL-side IP: `ip route show default | awk '{print $3}'`.
- **Reset the database:** stop the server, `rm backend/prisma/dev.db`, then
  re-run `db:push` + `db:seed`.
- **Stop everything:** `Ctrl+C` in each terminal.

---

## 3. Option B — Docker (WSL2 backend)

Prerequisite: **Docker Desktop for Windows** (WSL2 integration enabled) — or
Docker Engine + compose v2 installed inside WSL.

```bash
docker compose version   # must be v2 (no "docker-compose")
```

### 3.1 Build & start

```bash
docker compose up -d --build
docker compose ps        # backend + frontend should be "running"
docker compose logs -f backend   # wait for "COLLOSPOT Server running on port 5000"
```

### 3.2 Initialize the database

The SQLite file lives in the `collospot-db` volume (persists across rebuilds):

```bash
docker compose exec backend npm run db:push
docker compose exec backend npm run db:seed
docker compose restart backend
```

### 3.3 Access it

Same URLs: http://localhost:3000 (portal + /admin), http://localhost:5000/health.

The frontend container's nginx proxies `/api` to the backend container, and the
SQLite DB is persisted in the `collospot-db` volume.

### 3.4 Managing the stack

```bash
docker compose logs -f            # all logs
docker compose down               # stop (keeps the DB volume)
docker compose down -v            # stop + DELETE the database
docker compose up -d --build      # rebuild after code changes
```

### 3.5 What changed in the Docker setup (vs. the old files)

- **Backend Dockerfile** was broken: it ran `npm ci --only=production` and then
  `prisma generate` + `tsc` — those tools are dev dependencies and weren't
  installed, so the image build always failed. It's now a proper
  build→production multi-stage image (health check also fixed: alpine has
  `wget`, not `curl`).
- **Compose file:** removed the `nginx` service (it mounted `./nginx.conf` and
  `./ssl` which don't exist in the repo, so `docker compose up` failed) and the
  idle `postgres` service (the app uses SQLite — a commented template is left
  in case you switch the schema to Postgres later).
- Added `.dockerignore` files so host `node_modules`/`dev.db` don't leak into
  the build context.

---

## 4. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Prisma: ... binaries.prisma.sh ... socket disconnected` during `db:generate` | Corporate/ISP firewall is blocking Prisma's engine CDN. Use a proxy (`HTTPS_PROXY=... npx prisma generate`) or set `PRISMA_ENGINES_MIRROR` to an accessible mirror. |
| Backend log: `Username can't be blank / Api key can't be blank` + crash | Old bug — fixed in this repo (`src/env.ts` now loads `.env` before services load). Pull latest. |
| `EADDRINUSE` | Something else owns the port — kill it or change the port (see WSL notes). |
| Admin login says "Invalid credentials" | Seeding didn't run — `cd backend && npm run db:seed` (or `docker compose exec backend npm run db:seed`). |
| Plans page empty in the portal | Same — seed the DB, and make sure the backend is actually up (`/health`). |
| `502`/blank admin pages in dev | Backend down — Vite proxies `/api` to `http://localhost:5000`; start the backend. |
| Docker build: `prisma: command not found` / `tsc: not found` | You're on the old backend Dockerfile — pull the fixed one. |
| Slow `npm install` in WSL | Repo lives on `/mnt/c` — move it to `~/projects`. |

---

## 5. Useful commands cheat-sheet

```bash
# dev
npm run dev                  # both servers (root)
cd backend && npm run dev    # backend only
cd frontend && npm run dev   # frontend only

# database (SQLite)
cd backend
npm run db:generate / db:push / db:seed

# builds
npm run build                # backend tsc + frontend vite build

# docker
docker compose up -d --build
docker compose exec backend npm run db:push && docker compose exec backend npm run db:seed
```
