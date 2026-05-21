# EduTrack API — Frontend Integration Guide
> Hand this file to your AI model (Copilot, Gemini, Claude etc) to generate the entire frontend.

## Project Overview
EduTrack is a student finance tracker. Parents deposit money for students, set monthly spending limits, and monitor how students spend. Students log their expenses and view their balance.

**Two roles:** `PARENT` and `STUDENT`

---

## Base URL
```
Local:      http://localhost:3000/api/v1
Production: http://104.248.250.176:30080/api/v1
Swagger UI: http://104.248.250.176:30080/api/docs
```

---

## Authentication Flow

All protected routes require a Bearer token:
```
Authorization: Bearer <accessToken>
```

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PARENT"
}
```
Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "PARENT" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "john@example.com", "password": "password123" }
```
Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "PARENT" }
  }
}
```

Store both tokens. Use `accessToken` for all requests. Use `refreshToken` to get a new access token when expired.

> **Note:** IDs are integers, not UUIDs.

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGci..." }
```
Response:
```json
{ "success": true, "data": { "accessToken": "eyJhbGci...", "refreshToken": "eyJhbGci..." } }
```

---

## Role-Based Routing

```javascript
if (user.role === "PARENT") {
  // redirect to /parent/dashboard
} else if (user.role === "STUDENT") {
  // redirect to /student/dashboard
}
```

---

## Parent Endpoints

### List My Students
```http
GET /api/v1/parent/students
Authorization: Bearer <accessToken>
```
Response:
```json
{
  "success": true,
  "message": "Students fetched",
  "data": {
    "students": [
      {
        "id": 1,
        "userId": 2,
        "parentId": 1,
        "user": { "id": 2, "name": "Jane Doe", "email": "jane@example.com" },
        "wallet": { "id": 1, "totalBudget": 1000000, "monthlyLimit": 100000, "currentBalance": 850000 }
      }
    ]
  }
}
```

> Use `student.userId` when calling deposit, set-limit, or transactions endpoints as `studentId`.

### Link a Student
```http
POST /api/v1/parent/link-student
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "studentEmail": "jane@example.com" }
```
Response:
```json
{
  "success": true,
  "message": "Student linked successfully",
  "data": {
    "student": {
      "id": 1,
      "userId": 2,
      "parentId": 1,
      "user": { "id": 2, "name": "Jane Doe", "email": "jane@example.com" },
      "wallet": { "id": 1, "totalBudget": 0, "monthlyLimit": 0, "currentBalance": 0 }
    }
  }
}
```

### Deposit Money
```http
POST /api/v1/parent/deposit
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "studentId": 2, "amount": 500000, "description": "School fees for semester" }
```
> `studentId` is the student's **userId** (integer), not the student record id.

Response:
```json
{
  "success": true,
  "message": "Deposit successful",
  "data": {
    "transaction": { "id": 1, "amount": 500000, "type": "DEPOSIT", "description": "School fees for semester", "createdAt": "2026-05-19T00:00:00Z" },
    "newBalance": 1350000
  }
}
```

### Set Monthly Limit
```http
POST /api/v1/parent/set-limit
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "studentId": 2, "monthlyLimit": 100000 }
```
> `studentId` is the student's **userId** (integer).

Response:
```json
{ "success": true, "message": "Monthly limit updated", "data": { "monthlyLimit": 100000 } }
```

### View Student Spending History
```http
GET /api/v1/parent/transactions/:studentId
Authorization: Bearer <accessToken>
```
> `:studentId` is the student's **userId** (integer).

Response:
```json
{
  "success": true,
  "message": "Transactions fetched",
  "data": {
    "transactions": [
      { "id": 1, "amount": 15000, "type": "SPEND", "description": "Lunch", "createdAt": "2026-05-19T12:00:00Z" }
    ],
    "summary": { "totalSpent": 15000, "monthlyLimit": 100000, "remaining": 85000 }
  }
}
```

---

## Student Endpoints

### View Balance
```http
GET /api/v1/student/balance
Authorization: Bearer <accessToken>
```
Response:
```json
{
  "success": true,
  "message": "Balance fetched",
  "data": {
    "currentBalance": 850000,
    "totalBudget": 1000000,
    "monthlyLimit": 100000,
    "spentThisMonth": 15000,
    "remainingThisMonth": 85000
  }
}
```

### Log an Expense
```http
POST /api/v1/student/spend
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "amount": 5000, "description": "Transport to school" }
```
Response:
```json
{
  "success": true,
  "message": "Expense logged successfully",
  "data": {
    "transaction": { "id": 1, "amount": 5000, "type": "SPEND", "description": "Transport to school", "createdAt": "2026-05-19T08:00:00Z" },
    "newBalance": 845000,
    "insight": "You've used 20% of your monthly limit. You have 85,000 FCFA left for this month."
  }
}
```

### View Transaction History
```http
GET /api/v1/student/transactions
Authorization: Bearer <accessToken>
```
Response:
```json
{
  "success": true,
  "message": "Transactions fetched",
  "data": {
    "transactions": [
      { "id": 1, "walletId": 1, "amount": 5000, "type": "SPEND", "description": "Transport", "createdAt": "2026-05-19T08:00:00Z" }
    ]
  }
}
```

---

## Error Format

All errors:
```json
{ "success": false, "message": "Error description", "code": 400 }
```

| Code | Meaning |
|------|---------|
| 400 | Bad request |
| 401 | Unauthorized — redirect to login |
| 403 | Forbidden — wrong role |
| 404 | Not found |
| 500 | Server error |

---

## Important Notes for Frontend

1. **All IDs are integers** — not UUIDs. Store and send them as numbers.
2. **`studentId` in deposit/set-limit/transactions** refers to the student's `userId` field from the `/parent/students` response, not the `id` field.
3. **`insight`** on the spend response is an AI-generated or computed string — always display it to the student after logging an expense.
4. **Amounts are in FCFA** — format with thousand separators (e.g. `100,000 FCFA`).
5. **Token storage** — store `accessToken` and `refreshToken` in `localStorage` or `SecureStore` (React Native). On 401, call `/auth/refresh` then retry the original request.

---

## Suggested Screens

**Auth:** `/login`, `/register`

**Parent:** `/parent/dashboard` (student cards with balances), `/parent/student/:userId` (detail + history), `/parent/deposit`, `/parent/link-student`

**Student:** `/student/dashboard` (balance card + monthly progress bar), `/student/spend`, `/student/history`

---

## Prompt to paste into your AI model

```
Build a React Native (Expo) frontend for EduTrack — a student finance tracker app.

Base API URL: http://104.248.250.176:30080/api/v1
Swagger docs: http://104.248.250.176:30080/api/docs

Two roles: PARENT and STUDENT.
After login check user.role and route to the correct dashboard.

Auth: JWT. Store accessToken and refreshToken in SecureStore.
Add Authorization: Bearer <accessToken> to all protected requests.
On 401, refresh token via POST /api/v1/auth/refresh then retry the original request.

All IDs are integers. The studentId used in deposit, set-limit, and transactions endpoints
is the student's userId field from the GET /parent/students response.

PARENT screens:
- Dashboard: list linked students with name, balance, monthly limit progress bar
- Link student: form with email input → POST /parent/link-student
- Deposit: pick student, enter amount + description → POST /parent/deposit
- Set limit: pick student, enter monthly limit → POST /parent/set-limit
- Student detail: spending history + summary → GET /parent/transactions/:studentId

STUDENT screens:
- Dashboard: balance card, monthly limit progress bar (spentThisMonth / monthlyLimit), remaining amount
- Log expense: amount + description form → POST /student/spend, show insight from response
- Transaction history: list → GET /student/transactions

All responses: { success: boolean, data: any, message: string }
All errors: { success: false, message: string, code: number }

Amounts are in FCFA (Central African Franc). Format all numbers with thousand separators.
```
