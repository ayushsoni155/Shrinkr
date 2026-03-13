# Stage 1: Build & Generate
FROM node:20-slim AS builder

WORKDIR /app

# Install build tools (Prisma needs openssl)
RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install ALL deps
RUN npm ci

# Generate Prisma Client 
# (This must happen while devDependencies are present)
RUN npx prisma generate

# Copy source and build (if you have a build script, add it here)
COPY . .
# RUN npm run build 

# Stage 2: Final Production Image
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src

# --- ADD THIS LINE ---
COPY --from=builder /app/prisma ./prisma 
# ---------------------

RUN npm prune --omit=dev

EXPOSE 4001

CMD ["node", "src/index.js"]