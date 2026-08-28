# ── Build stage ──────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Install ALL dependencies (dev deps needed for prisma CLI + tsc)
COPY package*.json ./
RUN npm ci

# Generate Prisma client, then build TypeScript
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

# Prisma schema + generated client (includes the query engine)
COPY prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Compiled app
COPY --from=build /app/dist ./dist

RUN mkdir -p logs

EXPOSE 5000

# Alpine ships wget, not curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
