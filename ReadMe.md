# EduTrack — Student Finance Tracker API

> A backend API that helps parents track and manage finances for their student children. Parents deposit funds, set monthly limits, and monitor spending in real time.

---

## Tech Stack

| Technology | Role |
|---|---|
| Node.js 20 + TypeScript | Runtime + Language |
| Express 4 | HTTP Framework |
| Prisma 6 + PostgreSQL | ORM + Database (Neon cloud) |
| JWT | Authentication |
| Zod | Request validation |
| EventEmitter | Internal event bus (event-driven architecture) |
| Resend | Email notifications |
| Jest + Supertest | Testing (80%+ coverage) |
| Swagger | API documentation |
| Docker | Containerization |
| k3s (Kubernetes) | Orchestration |
| Jenkins | CI/CD pipeline |
| Prometheus + Grafana | Monitoring |
| Ansible | Infrastructure as Code |

---

## Architecture

EduTrack uses an **Event-Driven Modular Monolith** pattern.

```
src/
  modules/
    auth/           → register, login, refresh token
    users/          → profile, parent-student linking
    wallet/         → balance, deposits, monthly limits
    transactions/   → expense logging, history
    notifications/  → email listener (EventEmitter)
  events/
    eventBus.ts     → singleton EventEmitter bus
  middleware/
    auth.ts         → JWT guard
    roles.ts        → isParent, isStudent guards
    errorHandler.ts → central error handling
  lib/
    prisma.ts       → Prisma client singleton
  app.ts
  server.ts
```

**Event flow:**
```
walletService.deposit()
  → eventBus.emit('wallet:deposited', { studentId, amount })
    → notificationService listens
      → sends email to parent via Resend
```

---

## Domain Models

```
User        { id, name, email, password, role: PARENT | STUDENT }
Student     { id, userId, parentId }
Wallet      { id, studentId, totalBudget, monthlyLimit, currentBalance }
Transaction { id, walletId, amount, type: DEPOSIT | SPEND, description, createdAt }
```

---

## API Endpoints

### Auth
```
POST /api/v1/auth/register   → Register as PARENT or STUDENT
POST /api/v1/auth/login      → Login, returns access + refresh tokens
POST /api/v1/auth/refresh    → Refresh access token
```

### Parent
```
GET  /api/v1/parent/students              → List linked students with balances
POST /api/v1/parent/deposit               → Deposit funds to student wallet
POST /api/v1/parent/set-limit             → Set monthly spending limit
GET  /api/v1/parent/transactions/:studentId → View student spending history
```

### Student
```
POST /api/v1/student/spend    → Log an expense
GET  /api/v1/student/balance  → View current balance and monthly limit
```

### System
```
GET /health   → Health check
GET /metrics  → Prometheus metrics
GET /api/docs → Swagger UI
```

**Response format (all endpoints):**
```json
{ "success": true, "data": {}, "message": "string" }
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/edutrack-backend.git
cd edutrack-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file at the root:
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/edutrack?sslmode=require"
JWT_SECRET="your_jwt_secret_here"
RESEND_API_KEY="your_resend_api_key"
PORT=3000
```

### 4. Generate Prisma client and run migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run in development mode
```bash
npm run dev
```

### 6. Run tests
```bash
npm test
```

---

## Docker (local test)

```bash
docker build -t edutrack-api:test .
docker run -p 3000:3000 --env-file .env edutrack-api:test
```

Test: `http://localhost:3000/health`

---

## Infrastructure

**VPS:** DigitalOcean Ubuntu 22.04 (2GB RAM)

| Service | URL |
|---|---|
| App API | http://104.248.250.176:30080 |
| Jenkins | http://104.248.250.176:8080 |
| Prometheus | http://104.248.250.176:30090 |
| Grafana | http://104.248.250.176:30030 |
| Swagger Docs | http://104.248.250.176:30080/api/docs |

---

## CI/CD Pipeline (Jenkins)

Every push to `main` triggers:

```
Checkout → Install → Test → Build Docker Image → Push to Docker Hub → Deploy to k3s
```

Pipeline defined in `Jenkinsfile` at repo root.

---

## Contributing (Grista — Frontend Integration)

1. Base URL: `http://104.248.250.176:30080/api/v1`
2. All protected routes require: `Authorization: Bearer <token>`
3. Full API docs: `http://104.248.250.176:30080/api/docs`
4. All responses follow: `{ success, data, message }`

---



## License

MIT