## Project: EduTrack — Student Finance Tracker

### Stack
- Node.js 20 + TypeScript (strict mode)
- Express 4.18
- Prisma 6 + PostgreSQL (already migrated)
- JWT (access + refresh tokens)
- Resend SDK (email notifications(use this domain noreply@teamnest.me))
- Node.js EventEmitter (internal event bus)
- Jest + Supertest (80%+ coverage REQUIRED by exam)
- Swagger (swagger-jsdoc + swagger-ui-express) — REQUIRED
- Zod (request validation)
- prom-client (Prometheus metrics)

### Architecture — Event-Driven Modular Monolith
src/
  modules/
    auth/          (routes, controller, service, schema, tests)
    users/         (routes, controller, service, schema, tests)
    wallet/        (routes, controller, service, schema, tests)
    transactions/  (routes, controller, service, schema, tests)
    notifications/ (listener, emailService)
  events/
    eventBus.ts    (singleton EventEmitter)
  middleware/
    auth.ts        (JWT guard)
    roles.ts       (isParent, isStudent)
    errorHandler.ts
  lib/
    prisma.ts      (Prisma client singleton)
    resend.ts      (Resend client)
  app.ts
  server.ts

### Event-Driven Pattern (ALWAYS USE THIS)
- Services emit events via eventBus after state changes
- Notification module ONLY listens to events, never called directly
- Events:
    eventBus.emit('wallet:deposited', { studentId, amount, parentId })
    eventBus.emit('student:spent', { studentId, amount, parentId })
    eventBus.emit('limit:exceeded', { studentId, monthlyLimit, parentId })

### Response Format (ALWAYS)
{ success: boolean, data: any, message: string }
Errors: { success: false, message: string, code: number }

### Swagger Documentation (REQUIRED ON EVERY CONTROLLER)
- Every route must have full JSDoc with @swagger annotation
- Include: summary, description, requestBody schema, response schemas
- Swagger UI served at /api/docs
- Example:
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [PARENT, STUDENT]
 *     responses:
 *       201:
 *         description: User registered successfully
 */

### Prometheus Metrics (REQUIRED)
- Add prom-client to app.ts
- Expose GET /metrics endpoint
- Track: http_request_duration_seconds, http_requests_total

### Testing Rules (80%+ REQUIRED)
- Every service function must have a Jest unit test
- Every route must have a Supertest integration test
- Mock Prisma client in unit tests
- Mock EventEmitter in service tests
- Run: npm test -- --coverage

### Code Rules
- Strict TypeScript, no any
- Zod schema for every request body
- JSDoc + @swagger on every controller
- Max 30 lines per function
- async/await only
- All DB calls in service layer only
- Prisma transactions for multi-step writes

### Domain Models (Already migrated in Neon DB)
User { id, name, email, password, role: PARENT | STUDENT, createdAt }
Student { id, userId, parentId }
Wallet { id, studentId, totalBudget, monthlyLimit, currentBalance }
Transaction { id, walletId, amount, type: DEPOSIT | SPEND, description, createdAt }

### Key Endpoints
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/parent/students
POST /api/v1/parent/deposit
POST /api/v1/parent/set-limit
GET  /api/v1/parent/transactions/:studentId
POST /api/v1/student/spend
GET  /api/v1/student/balance
GET  /health
GET  /metrics
GET  /api/docs