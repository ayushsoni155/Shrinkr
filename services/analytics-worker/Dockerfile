# ── Stage 1: Builder ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src


# ── Stage 2: Distroless Runtime ──────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

CMD ["src/index.js"]