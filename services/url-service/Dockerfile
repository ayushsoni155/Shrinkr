# ── Stage 1: Builder ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src


# ── Stage 2: Distroless Runtime ─────────────────────────────────
# FROM gcr.io/distroless/nodejs20-debian11
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4002

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

EXPOSE 4002

CMD ["src/index.js"]