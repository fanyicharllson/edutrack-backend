# EduTrack API — Frontend Integration Guide
> Hand this file to your AI model (Copilot, Gemini, Claude etc) to generate the entire frontend.

## Project Overview
EduTrack is a student finance tracking app. Parents deposit money for students, set monthly spending limits, and monitor how students spend. Students log their expenses and view their balance.

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
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "PARENT" }
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
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "PARENT" }
  }
}
```

Store both tokens. Use `accessToken` for all requests. Use `refreshToken` to get new access token when expired.

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGci..." }
```
Response:
```json
{ "success": true, "data": { "accessToken": "eyJhbGci..." } }
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
  "data": {
    "students": [
      {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "wallet": { "totalBudget": 1000000, "monthlyLimit": 100000, "currentBalance": 850000 }
      }
    ]
  }
}
```

### Link a Student
```http
POST /api/v1/parent/link-student
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "studentEmail": "jane@example.com" }
```
Response:
```json
{ "success": true, "message": "Student linked successfully", "data": { "student": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } } }
```

### Deposit Money
```http
POST /api/v1/parent/deposit
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "studentId": "uuid", "amount": 500000, "description": "School fees for semester" }
```
Response:
```json
{
  "success": true,
  "message": "Deposit successful",
  "data": {
    "transaction": { "id": "uuid", "amount": 500000, "type": "DEPOSIT", "description": "School fees for semester", "createdAt": "2026-05-19T00:00:00Z" },
    "newBalance": 1350000
  }
}
```

### Set Monthly Limit
```http
POST /api/v1/parent/set-limit
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "studentId": "uuid", "monthlyLimit": 100000 }
```
Response:
```json
{ "success": true, "message": "Monthly limit updated", "data": { "monthlyLimit": 100000 } }
```

### View Student Spending History
```http
GET /api/v1/parent/transactions/:studentId
Authorization: Bearer <accessToken>
```
Response:
```json
{
  "success": true,
  "data": {
    "transactions": [
      { "id": "uuid", "amount": 15000, "type": "SPEND", "description": "Lunch", "createdAt": "2026-05-19T12:00:00Z" }
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
  "data": {
    "currentBalance": 850000,
    "monthlyLimit": 100000,
    "spentThisMonth": 15000,
    "remainingThisMonth": 85000,
    "totalBudget": 1000000
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
    "transaction": { "id": "uuid", "amount": 5000, "type": "SPEND", "description": "Transport to school", "createdAt": "2026-05-19T08:00:00Z" },
    "newBalance": 845000,
    "insight": "You've spent 20% of your monthly limit. You're on track!"
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
  "data": {
    "transactions": [
      { "id": "uuid", "amount": 5000, "type": "SPEND", "description": "Transport", "createdAt": "2026-05-19T08:00:00Z" }
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

## Suggested Screens

**Auth:** `/login`, `/register`

**Parent:** `/parent/dashboard` (student cards), `/parent/student/:id` (detail + history), `/parent/deposit`, `/parent/link-student`

**Student:** `/student/dashboard` (balance + progress bar), `/student/spend`, `/student/history`

---

## Prompt to paste into your AI model

```
Build a React frontend for EduTrack — a student finance tracker.

Base API URL: http://104.248.250.176:30080/api/v1
Swagger docs: http://104.248.250.176:30080/api/docs

Two roles: PARENT and STUDENT.
After login check user.role and route to the correct dashboard.

Auth: JWT. Store accessToken and refreshToken in localStorage.
Add Authorization: Bearer <accessToken> to all protected requests.
On 401, refresh token via POST /api/v1/auth/refresh then retry.

PARENT screens: dashboard (list students + balances), deposit form, set limit form, link student by email, spending history per student.
STUDENT screens: dashboard (balance card + monthly progress bar), log expense form, transaction history.

All responses: { success: boolean, data: any, message: string }
All errors: { success: false, message: string, code: number }

Amounts are in FCFA (Central African Franc). Format numbers with thousand separators.
```