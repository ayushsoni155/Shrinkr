# ── Stage 1: Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# ── Stage 2: Distroless Runtime ───────────────────────────────────
# Analytics worker is a pure background process (no exposed ports)
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

ENV NODE_ENV=production

# No EXPOSE — this is a background worker only
CMD ["src/index.js"]
