# Axiora Pulse Mobile — API Mapping & Integration Specification

This document maps all REST and WebSocket endpoints consumed by the Axiora Pulse mobile application to their HTTP method, authentication model, payload structures, role access, workspace scoping, caching behavior, and retry policies.

---

## 1. Authentication & Session Management

### `POST /auth/login`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "usr_12345",
      "email": "user@example.com",
      "name": "Alex Mercer",
      "role": "user",
      "avatar_url": null,
      "email_verified": true,
      "is_onboarded": true,
      "created_at": "2026-01-15T08:00:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
  ```
- **Errors**: `400 Bad Request` (Validation), `401 Unauthorized` (Invalid credentials), `429 Too Many Requests`
- **Caching**: None
- **Retry Policy**: No automatic retry on 401. Exponential backoff on 5xx/network errors (up to 3 attempts).

### `POST /auth/register`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Verification code sent to user@example.com",
    "email": "user@example.com",
    "requires_otp": true
  }
  ```
- **Errors**: `400 Bad Request`, `409 Conflict` (Email already registered)
- **Idempotency**: Client debounced.

### `POST /auth/verify-otp`
- **Method**: `POST`
- **Authentication**: None (Public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response (200 OK)**: Same user & token schema as `/auth/login`.
- **Errors**: `400 Bad Request` (Invalid or expired OTP)

### `POST /auth/refresh`
- **Method**: `POST`
- **Authentication**: Bearer (Refresh Token in Authorization header or body)
- **Request Body**: `{ "refresh_token": "..." }`
- **Response (200 OK)**: `{ "access_token": "...", "expires_in": 3600 }`
- **Errors**: `401 Unauthorized` (Forces clean logout and redirects to Login)

---

## 2. Workspace Management

### `GET /workspace/list`
- **Method**: `GET`
- **Authentication**: Bearer `access_token`
- **Response (200 OK)**:
  ```json
  {
    "workspaces": [
      {
        "id": "ws_987",
        "name": "EcoCharge Network",
        "industry": "CleanTech",
        "stage": "MVP & Execution Planning",
        "description": "Smart ultra-fast EV charging nodes.",
        "progress_percentage": 58,
        "is_active": true,
        "created_at": "2026-02-10T12:00:00Z"
      }
    ]
  }
  ```
- **Caching**: 5 minutes TTL in memory. Invalidated on workspace creation/deletion.

### `POST /workspace/create`
- **Method**: `POST`
- **Authentication**: Bearer `access_token`
- **Request Body**:
  ```json
  {
    "name": "EcoCharge Network",
    "industry": "CleanTech",
    "stage": "Idea Validation",
    "description": "Smart ultra-fast EV charging nodes."
  }
  ```
- **Response (201 Created)**: Returns created `Workspace` object.

### `GET /workspace/:id`
- **Method**: `GET`
- **Authentication**: Bearer `access_token`
- **Response (200 OK)**: Full workspace metadata including attached assets, members, validation state, and quota usage.
- **Errors**: `403 Forbidden` (User does not own or have membership in this workspace), `404 Not Found`

---

## 3. AI Mentor & Arya Voice Streaming

### `GET /chat/:workspaceId/history`
- **Method**: `GET`
- **Authentication**: Bearer `access_token`
- **Response (200 OK)**:
  ```json
  {
    "messages": [
      {
        "id": "msg_001",
        "role": "assistant",
        "content": "Hello! I am your AI Startup Mentor. Let's analyze your target customer persona.",
        "created_at": "2026-02-10T12:01:00Z",
        "suggested_prompts": [
          "Help me define my ICP",
          "What are key competitors?",
          "Review my unit economics"
        ]
      }
    ]
  }
  ```

### `POST /chat/:workspaceId/message`
- **Method**: `POST`
- **Authentication**: Bearer `access_token`
- **Request Body**:
  ```json
  {
    "content": "What are the biggest regulatory risks in CleanTech charging?",
    "stream": true
  }
  ```
- **Response (200 OK or Server-Sent Events / Chunked)**:
  ```json
  {
    "id": "msg_002",
    "role": "assistant",
    "content": "Key regulatory risks include grid interconnection queue timelines, OSHA compliance, and municipal zoning permits...",
    "created_at": "2026-02-10T12:02:15Z"
  }
  ```

### `POST /chat/voice/session` (Arya Live Voice)
- **Method**: `POST`
- **Authentication**: Bearer `access_token`
- **Request Body**: `{ "workspace_id": "ws_987", "voice": "arya_natural_v2" }`
- **Response (200 OK)**: `{ "session_id": "vses_543", "websocket_url": "wss://api.axiorapulse.com/v1/voice/ws/vses_543" }`

---

## 4. 12-Stage Validation Pipeline

### `GET /workspace/:id/validation/status`
- **Method**: `GET`
- **Authentication**: Bearer `access_token`
- **Response (200 OK)**:
  ```json
  {
    "overall_readiness_score": 74,
    "completed_steps": 7,
    "total_steps": 12,
    "steps": [
      { "id": "step_1", "step_number": 1, "name": "Idea Validation", "status": "completed", "score": 88 },
      { "id": "step_2", "step_number": 2, "name": "Market Research", "status": "completed", "score": 82 },
      { "id": "step_3", "step_number": 3, "name": "Business Model", "status": "completed", "score": 79 },
      { "id": "step_4", "step_number": 4, "name": "Survey Intelligence", "status": "in_progress", "score": null },
      { "id": "step_5", "step_number": 5, "name": "Financial & Capital Planning", "status": "locked", "score": null },
      { "id": "step_6", "step_number": 6, "name": "MVP & Execution Planning", "status": "locked", "score": null },
      { "id": "step_7", "step_number": 7, "name": "Business Setup", "status": "locked", "score": null },
      { "id": "step_8", "step_number": 8, "name": "Go-To-Market", "status": "locked", "score": null },
      { "id": "step_9", "step_number": 9, "name": "Testing / Pilot / Improvement", "status": "locked", "score": null },
      { "id": "step_10", "step_number": 10, "name": "Launch & Traction", "status": "locked", "score": null },
      { "id": "step_11", "step_number": 11, "name": "Break-Even & Growth", "status": "locked", "score": null },
      { "id": "step_12", "step_number": 12, "name": "Scale & Expansion", "status": "locked", "score": null }
    ]
  }
  ```

### `POST /workspace/:id/step/:stepId/answers`
- **Method**: `POST`
- **Authentication**: Bearer `access_token`
- **Request Body**:
  ```json
  {
    "answers": {
      "q_target_customers": "Commercial fleets and B2B logistics depots.",
      "q_pricing_tier": "Subscription + per-kWh margin."
    }
  }
  ```
- **Response (200 OK)**: `{ "status": "saved", "step_score": 84, "feedback": "Strong B2B focus identified." }`

---

## 5. Reports & Certificates

### `GET /workspace/:id/report`
- **Method**: `GET`
- **Authentication**: Bearer `access_token`
- **Response (200 OK)**:
  ```json
  {
    "viability_score": 82,
    "executive_summary": "High commercial potential with verified market traction...",
    "swot": {
      "strengths": ["Proprietary dynamic load balancing", "High gross margin"],
      "weaknesses": ["Capital intensive hardware installation"],
      "opportunities": ["Federal Clean Energy Subsidies"],
      "threats": ["Grid capacity constraints"]
    },
    "recommendations": [
      { "priority": "high", "title": "Pilot with regional delivery fleet", "impact": "Demonstrates initial recurring revenue." }
    ],
    "certificate_available": true
  }
  ```

### `GET /workspace/:id/certificate`
- **Method**: `GET`
- **Authentication**: Bearer `access_token`
- **Response**: `application/pdf` (Binary stream downloaded to local app storage)

---

## 6. User Profile, Settings, & Quotas

### `GET /user/quotas`
- **Method**: `GET`
- **Authentication**: Bearer `access_token`
- **Response (200 OK)**:
  ```json
  {
    "plan_name": "Pro Plan",
    "ai_messages_used": 142,
    "ai_messages_limit": 500,
    "workspaces_created": 3,
    "workspaces_limit": 10,
    "reports_generated": 2,
    "reports_limit": 10
  }
  ```
