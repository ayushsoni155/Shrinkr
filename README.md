# Shrinkr — Microservices URL Shortener

A production-grade URL shortener built on a microservices architecture with real-time analytics.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (3000)              │
└────────────────┬────────────────────┬───────────────────────┘
                 │                    │
    ┌────────────▼──────┐   ┌─────────▼──────────┐
    │  Auth Service     │   │  URL Service        │
    │  Port: 4001       │   │  Port: 4002         │
    │  PG + Redis       │   │  Mongo + Redis      │
    └───────────────────┘   └────────────────────┘
                                       │
                            ┌──────────▼─────────┐
                            │  Redirect Service   │
                            │  Port: 4003         │
                            │  Redis → Mongo      │
                            │  Kafka Producer     │
                            └──────────┬──────────┘
                                       │ Kafka (url_clicks)
                            ┌──────────▼──────────┐
                            │  Analytics Worker   │
                            │  No HTTP server     │
                            │  Kafka Consumer     │
                            │  → Mongo (clicks)   │
                            └─────────────────────┘
```

## Quick Start

```bash
# Clone and enter the project
cd newProject

# Start all services (first run builds Docker images)
docker-compose up --build -d

# Check service health
curl http://localhost:4001/health  # Auth
curl http://localhost:4002/health  # URL Management
curl http://localhost:4003/health  # Redirect Engine
curl http://localhost:3000         # Frontend
```

## Environment Variables

### Auth Service (`services/auth-service/.env`)

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Service port | `4001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://urluser:urlpassword@postgres:5432/authdb` |
| `REDIS_HOST` | Redis hostname | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | `redispassword` |
| `JWT_ACCESS_SECRET` | **⚠️ Change this!** JWT signing secret (access) | `super-secret-access-key-change-me` |
| `JWT_REFRESH_SECRET` | **⚠️ Change this!** JWT signing secret (refresh) | `super-secret-refresh-key-change-me` |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` |
| `SMTP_HOST` | SMTP server host (leave blank for Ethereal dev inbox) | *(blank)* |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `SMTP_USER` | SMTP username | *(blank)* |
| `SMTP_PASS` | SMTP password | *(blank)* |
| `SMTP_FROM` | Sender address | `noreply@urlshortener.app` |
| `CORS_ORIGIN` | Allowed origin | `http://localhost:3000` |

> **Nodemailer Note**: When `SMTP_HOST` is left empty, the service automatically creates a free [Ethereal](https://ethereal.email/) test account and logs a **preview URL** to the container logs. Use `docker logs auth-service` to see it.

---

### URL Management Service (`services/url-service/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Service port | `4002` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongouser:mongopassword@mongo:27017/urldb?authSource=admin` |
| `REDIS_HOST` | Redis hostname | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | `redispassword` |
| `JWT_ACCESS_SECRET` | **Must match Auth Service** | `super-secret-access-key-change-me` |
| `BASE_SHORT_URL` | Base URL for constructing short links | `http://localhost:4003` |
| `CORS_ORIGIN` | Allowed origin | `http://localhost:3000` |

---

### Redirect Engine (`services/redirect-service/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Service port | `4003` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongouser:mongopassword@mongo:27017/urldb?authSource=admin` |
| `REDIS_HOST` | Redis hostname | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | `redispassword` |
| `KAFKA_BROKERS` | Comma-separated Kafka brokers | `kafka:9092` |

---

### Analytics Worker (`services/analytics-worker/.env`)

| Variable | Description | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongouser:mongopassword@mongo:27017/urldb?authSource=admin` |
| `KAFKA_BROKERS` | Comma-separated Kafka brokers | `kafka:9092` |
| `KAFKA_GROUP_ID` | Kafka consumer group ID | `analytics-group` |

---

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_AUTH_URL` | Auth service URL (client-side) | `http://localhost:4001` |
| `NEXT_PUBLIC_URL_SERVICE` | URL management service URL | `http://localhost:4002` |
| `NEXT_PUBLIC_REDIRECT_BASE` | Redirect base URL (for short link preview) | `http://localhost:4003` |

---

## API Reference

### Auth Service (`localhost:4001`)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | `{email, password}` | Register + send OTP |
| `POST` | `/api/auth/verify-otp` | `{email, otp}` | Verify OTP, receive JWT |
| `POST` | `/api/auth/login` | `{email, password}` | Login, receive JWT |
| `POST` | `/api/auth/refresh` | `{refreshToken}` | Rotate tokens |
| `POST` | `/api/auth/resend-otp` | `{email}` | Resend OTP |

### URL Management Service (`localhost:4002`)

> All routes require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Body/Params | Description |
|---|---|---|---|
| `POST` | `/api/urls` | `{originalUrl, alias?}` | Create short URL |
| `GET` | `/api/urls` | `?page=1&limit=10` | Get paginated URLs |
| `DELETE` | `/api/urls/:shortId` | — | Soft-delete a URL |
| `GET` | `/api/analytics/:shortId` | — | Get click analytics |

### Redirect Engine (`localhost:4003`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:shortId` | 301 redirect + publish Kafka event |

---

## Production Checklist

- [ ] Change **all** JWT secrets to cryptographically random strings (`openssl rand -hex 64`)
- [ ] Change Postgres/Mongo/Redis passwords
- [ ] Configure real SMTP credentials (SendGrid, Mailgun, Amazon SES)
- [ ] Set `BASE_SHORT_URL` and `NEXT_PUBLIC_*` to your real domain
- [ ] Enable Redis password auth (already configured)
- [ ] Add Nginx Ingress / reverse proxy in front of all services
- [ ] Set up Kafka with replication factor > 1 for production
- [ ] Run `prisma migrate deploy` on Auth Service start (already in entrypoint)

---

## Running Locally (Without Docker)

```bash
# Install deps for each service
cd services/auth-service && npm install
cd services/url-service && npm install
cd services/redirect-service && npm install
cd services/analytics-worker && npm install
cd frontend && npm install

# Run Prisma migration (Auth Service)
cd services/auth-service && npx prisma migrate dev

# Start services (in separate terminals)
npm run dev  # in each service directory
```

---

## Docker Images

All images use a strict **multi-stage + distroless** build:

| Service | Builder | Final Base |
|---|---|---|
| `auth-service` | `node:20-alpine` | `gcr.io/distroless/nodejs20-debian11` |
| `url-service` | `node:20-alpine` | `gcr.io/distroless/nodejs20-debian11` |
| `redirect-service` | `node:20-alpine` | `gcr.io/distroless/nodejs20-debian11` |
| `analytics-worker` | `node:20-alpine` | `gcr.io/distroless/nodejs20-debian11` |
| `frontend` | `node:20-alpine` (3-stage) | `gcr.io/distroless/nodejs20-debian11` |

Distroless images contain **no shell**, **no package manager**, and **no OS utilities** — drastically reducing the attack surface.
