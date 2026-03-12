# ── Stage 1: Install dependencies ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


# ── Stage 2: Build Next.js app ───────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ── Stage 3: Production runtime (distroless) ─────────────────────
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone server
COPY --from=builder /app/.next/standalone ./

# next static files
COPY --from=builder /app/.next/static ./.next/static

# copy public ONLY if it exists
# (remove this line if your project doesn't use public assets)
# COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["server.js"]