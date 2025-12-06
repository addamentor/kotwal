# Kotwal Platform: Technical & Functional Specification





## 9. Endpoint-Level Flow Documentation

This section details the step-by-step flow for each main API endpoint, including the route, controller, and model files involved.

### 1. User Registration
- **Route:** `src/routes/auth.js` (`POST /create-user`)
- **Controller:** `src/controllers/authController.js` (`register`)
- **Model:** `src/models/user.js` (User)
- **Flow:**
  1. Request hits `/create-user` route, protected by JWT middleware.
  2. Calls `register` in `authController.js`.
  3. Validates input, hashes password, creates user in Users table (multi-tenant via `companyId`).

### 2. User Login
- **Route:** `src/routes/auth.js` (`POST /login`)
- **Controller:** `src/controllers/loginController.js` (`login`)
- **Model:** `src/models/user.js` (User)
- **Flow:**
  1. Request hits `/login` route.
  2. Calls `login` in `loginController.js`.
  3. Validates credentials, issues JWT with user and company info.

### 3. Onboard Tenant (Company)
- **Route:** `src/routes/index.js` (`POST /onboard-tenant`)
- **Controller:** `src/controllers/tenantController.js` (`onboardTenant`)
- **Model:** `src/models/company.js` (Tenant), `src/models/user.js` (User)
- **Flow:**
  1. Request hits `/onboard-tenant` route.
  2. Calls `onboardTenant` in `tenantController.js`.
  3. Creates new tenant and admin user in a transaction.

### 4. Send Chat Message
- **Route:** `src/routes/index.js` (`POST /chat`)
- **Controller:** `src/controllers/chat/chatController.js` (`sendChat`)
- **Model:** `src/models/chatLog.js` (ChatLog), `src/models/chatModel.js` (ChatModel), `src/models/company.js` (Tenant)
- **Flow:**
  1. Request hits `/chat` route, protected by JWT middleware.
  2. Calls `sendChat` in `chatController.js`.
  3. Checks chat model availability, runs PII detection, logs chat, applies billing logic (prepaid/postpaid).

### 5. List Chat Models
- **Route:** `src/routes/index.js` (`GET /chat-models`)
- **Controller:** `src/controllers/chatModelController.js` (`listChatModels`)
- **Model:** `src/models/chatModel.js` (ChatModel)
- **Flow:**
  1. Request hits `/chat-models` route, protected by JWT middleware.
  2. Calls `listChatModels` in `chatModelController.js`.
  3. Returns global and company-specific models.

### 6. Create/Update Chat Model (Admin)
- **Route:** `src/routes/index.js` (`POST /chat-models`, `PUT /chat-models/:id`)
- **Controller:** `src/controllers/chatModelAdminController.js` (`createChatModel`, `updateChatModel`)
- **Model:** `src/models/chatModel.js` (ChatModel)
- **Flow:**
  1. Request hits `/chat-models` or `/chat-models/:id` route, protected by JWT middleware.
  2. Calls respective controller function.
  3. Creates or updates chat model for company.

### 7. Billing Records & Aggregation
- **Route:** `src/routes/billing.js` (`GET /`, `POST /aggregate`, `POST /aggregate-monthly`)
- **Controller:** `src/controllers/billingController.js` (`aggregateBillingForPeriod`, `aggregateBillingForCurrentMonth`)
- **Model:** `src/models/billingRecord.js` (BillingRecord), `src/models/usageLog.js` (UsageLog)
- **Flow:**
  1. Request hits billing route, protected by JWT middleware.
  2. Aggregates usage logs and updates/returns billing records for tenant.

### 8. Prepaid Admin Controls
- **Route:** `src/routes/prepaidAdmin.js` (`POST /topup`, `GET /balance`)
- **Model:** `src/models/company.js` (Tenant)
- **Flow:**
  1. Request hits `/topup` or `/balance` route, protected by JWT middleware.
  2. Only admin can access.
  3. Top-up or view prepaid token balance for tenant.

---

For each endpoint, the flow starts at the route file, passes through authentication middleware (if protected), then calls the controller, which interacts with the relevant model(s) for database operations.
Kotwal is a multi-tenant SaaS platform for secure AI chat, PII detection, and flexible billing (prepaid/postpaid). It supports company onboarding, user management, chat model selection, usage tracking, and billing aggregation.

---

## 2. File Structure & Key Components

- **src/models/**
  - `company.js` (Tenant model)
  - `user.js` (User model)
  - `chatModel.js` (Chat model config)
  - `chatLog.js` (Chat message logs)
  - `usageLog.js` (Usage/billing logs)
  - `billingRecord.js` (Aggregated billing records)
- **src/controllers/**
  - `tenantController.js` (Onboarding logic)
  - `authController.js` (User registration)
  - `loginController.js` (User login)
  - `refreshController.js` (JWT refresh)
  - `passwordController.js` (User password change)
  - `adminPasswordController.js` (Admin password change for users)
  - `chatModelController.js` (List chat models)
  - `chatModelAdminController.js` (Create/update chat models)
  - `chat/chatController.js` (Chat API logic)
  - `billingController.js` (Billing aggregation)
- **src/routes/**
  - `index.js` (Main API routes)
  - `auth.js` (Auth/user routes)
  - `billing.js` (Billing endpoints)
  - `prepaidAdmin.js` (Prepaid admin controls)

---

## 3. API Endpoints Reference

### Onboarding & User Management
- `POST /api/onboard-tenant` — Onboard new company/tenant (choose billing type, set initial tokens)
- `POST /api/auth/create-user` — Admin creates user in their company
- `POST /api/auth/login` — User login
- `POST /api/auth/refresh` — Refresh JWT token
- `POST /api/auth/change-password` — User changes own password
- `POST /api/auth/admin-change-password` — Admin changes password for any user in their company

### Chat & Chat Models
- `GET /api/chat-models` — List available chat models (name, provider, id)
- `POST /api/chat-models` — Admin creates new chat model
- `PUT /api/chat-models/:id` — Admin updates chat model
- `POST /api/chat` — Send/receive chat (PII detection, billing logic)

### Billing & Usage
- `GET /api/billing` — Get billing records for current tenant
- `POST /api/billing/aggregate` — Aggregate billing for any period (admin)
- `POST /api/billing/aggregate-monthly` — Aggregate billing for current month (admin)

### Prepaid Admin Controls
- `POST /api/prepaid-admin/topup` — Top up prepaid tokens (admin)
- `GET /api/prepaid-admin/balance` — View current prepaid token balance (admin)
- `GET /api/prepaid-admin/usage` — View usage logs for tenant (admin)

---

## 4. Application Flow

### Onboarding
- Admin provides company details, billing type, and initial tokens (if prepaid).
- Tenant and admin user are created atomically.

### User Management
- Admin creates users for their company.
- Users log in and receive JWT tokens for API access.

### Chat
- User selects chat model and sends message.
- PII detection runs (all layers). If sensitive, user can override.
- If billing type is prepaid, system checks and deducts tokens; blocks if insufficient.
- If postpaid, usage is logged for later billing.
- Chat logs and usage logs are maintained for all chats.

### Billing
- Usage is tracked per chat.
- Billing records are aggregated for any period or monthly.
- Admins can view billing records, usage, and (for prepaid) top up tokens and view balance.

---

## 5. Technical Details

### Multi-Tenancy
- All user, chat, and billing data is scoped by tenantId.
- Admins can only manage users and billing for their own company.

### PII Detection
- Chat messages are checked for sensitive data before sending to AI models.
- If PII is found, user must confirm override to proceed.
- All PII findings and overrides are logged.

### Billing Logic
- **Prepaid**: Tokens are checked and deducted per chat. Usage is blocked if balance is insufficient.
- **Postpaid**: Usage is logged and aggregated for later invoicing.
- UsageLogs and BillingRecords tables support both models.

### Chat Model Management
- Chat models can be global or company-specific.
- Admins can create, update, and list models for their company.
- Model config is only fetched when needed for chat.

---

## 6. Security & Access Control
- All sensitive endpoints require JWT authentication.
- Admin-only endpoints are protected by role checks.
- Data access is always scoped by tenant/company.

---

## 7. Extensibility
- Easily add new chat models, billing types, or admin controls.
- Modular structure supports future features (invoicing, analytics, etc.).

---

## 8. How It Works (Summary)
- Companies onboard with chosen billing type.
- Admins manage users and chat models.
- Users chat with AI, with PII detection and billing logic enforced.
- Usage and billing are tracked and exposed via APIs.
- Admins control prepaid balances and view all usage/billing data.

---

*This document can be copy-pasted into MS Word or any Markdown editor for further formatting or sharing.*
