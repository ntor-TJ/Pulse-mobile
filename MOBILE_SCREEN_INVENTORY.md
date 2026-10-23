# Axiora Pulse Mobile — Screen Inventory & Matrix

This inventory maps all authenticated user flows, onboarding steps, workspace screens, AI mentor sessions, validation steps, survey/questionnaire pipelines, and settings in the Axiora Pulse mobile application to their web counterparts, APIs, user roles, state handling, and CRUD operations.

---

## 1. Authentication & Onboarding Screens

| ID | Web Screen | Mobile Screen | Mobile Route | Entry Point | Exit Point | API Endpoint(s) | Auth Required | User Role | CRUD | State Handling (Loading / Empty / Error) |
|---|---|---|---|---|---|---|---|---|---|---|
| **AUTH-01** | `/login` | `LoginScreen` | `Login` | App Launch (Unauthenticated) | Dashboard / OtpVerification / ForgotPassword / Register | `POST /auth/login` | No | Anonymous / User | Read / Create Session | Full spinner button, error banner on invalid credentials / lockouts |
| **AUTH-02** | `/register` | `RegisterScreen` | `Register` | Login Screen Link | `OtpVerification` | `POST /auth/register` | No | Anonymous | Create Account | Client & server field validation, duplicate email detection, password strength |
| **AUTH-03** | `/verify-otp` | `OtpVerificationScreen` | `OtpVerification` | Registration / 2FA trigger | `Dashboard` / Login | `POST /auth/verify-otp`, `POST /auth/resend-otp` | No | Anonymous / Pending User | Update Auth State | 6-box auto-focus inputs, 60s resend countdown timer, inline error alert |
| **AUTH-04** | `/forgot-password` | `ForgotPasswordScreen` | `ForgotPassword` | Login Screen Link | `ResetPassword` / Login | `POST /auth/forgot-password` | No | Anonymous | Initiate Reset | Email regex validation, success acknowledgment dialog, error toast |
| **AUTH-05** | `/reset-password` | `ResetPasswordScreen` | `ResetPassword` | Deep Link / Forgot Password flow | Login | `POST /auth/reset-password` | No | Anonymous | Update Password | Token validation, password matching checks, success confirmation |
| **ONBD-01** | `/onboarding` | `OnboardingScreen` | `Onboarding` | First-time Login / Profile trigger | `Dashboard` | `POST /user/onboarding`, `GET /user/profile` | Yes | User | Update Profile | Multi-step wizard, industry/stage selector, progress indicator |

---

## 2. Workspace & Project Management

| ID | Web Screen | Mobile Screen | Mobile Route | Entry Point | Exit Point | API Endpoint(s) | Auth Required | User Role | CRUD | State Handling (Loading / Empty / Error) |
|---|---|---|---|---|---|---|---|---|---|---|
| **WS-01** | `/dashboard` | `DashboardScreen` | `DashboardTab` | App Launch (Authenticated) | WorkspaceDetail / MentorChat / Validation | `GET /workspace/active`, `GET /workspace/recent`, `GET /user/quotas` | Yes | User / Member / Owner | Read | Skeleton cards, empty workspace banner with CTA, quota progress bars |
| **WS-02** | `/workspaces` | `WorkspaceListScreen` | `WorkspacesTab` | Bottom Tab | WorkspaceDetail / CreateModal | `GET /workspace/list`, `POST /workspace/archive` | Yes | User / Member / Owner | Read / Update | Search filter, pull-to-refresh, empty search states, swipe-to-archive |
| **WS-03** | Modal `/workspace/new` | `CreateWorkspaceModal` | `CreateWorkspaceModal` | Header '+' / Dashboard CTA | WorkspaceDetail | `POST /workspace/create` | Yes | User / Member / Owner | Create Workspace | Dynamic industry/stage dropdowns, debounced validation, loading overlay |
| **WS-04** | `/workspace/:id` | `WorkspaceDetailScreen` | `WorkspaceDetail` | Dashboard / Workspace List | Mentor / Validation / Surveys / Attachments | `GET /workspace/:id`, `PUT /workspace/:id`, `DELETE /workspace/:id` | Yes | User / Member / Owner | Read / Update / Delete | Tabbed interface (Overview, Progress, Team, Settings), delete confirmations |
| **WS-05** | `/workspace/:id/attachments` | `WorkspaceAttachmentsScreen` | `WorkspaceAttachments` | WorkspaceDetail Menu | WorkspaceDetail | `GET /workspace/:id/attachments`, `POST /workspace/:id/attachments` | Yes | User / Member / Owner | Create / Read / Delete | Document picker, upload progress indicator, empty list placeholder |
| **WS-06** | `/workspace/archive` | `WorkspaceArchiveScreen` | `WorkspaceArchive` | Workspace Settings | WorkspaceList | `GET /workspace/archived`, `POST /workspace/:id/restore` | Yes | User / Member / Owner | Read / Update | Filter archived vs active, restore action with confirmation dialog |

---

## 3. AI Mentor & Arya Voice Assistant

| ID | Web Screen | Mobile Screen | Mobile Route | Entry Point | Exit Point | API Endpoint(s) | Auth Required | User Role | CRUD | State Handling (Loading / Empty / Error) |
|---|---|---|---|---|---|---|---|---|---|---|
| **AI-01** | `/mentor` | `MentorChatScreen` | `MentorTab` | Bottom Tab / Dashboard CTA | Validation / Workspace | `GET /chat/:workspaceId/history`, `POST /chat/:workspaceId/message`, `POST /chat/:workspaceId/regenerate` | Yes | User / Member / Owner | Create / Read | Real-time chat streaming, suggested prompt chips, markdown rendering, copy & regenerate buttons, empty conversation splash |
| **AI-02** | Modal `/voice` | `AryaVoiceAssistantModal` | `AryaVoiceModal` | Bottom Floating Action Button (FAB) / Chat Mic | MentorChat / Dismiss | `POST /chat/voice/session`, `POST /chat/voice/transcribe`, WebSocket Real-time Voice | Yes | User / Member / Owner | Real-time Stream | Pulsing acoustic visualizer ring, live speech-to-text transcript banner, audio playback state |

---

## 4. 12-Stage Validation Journey & Intelligence

| ID | Web Screen | Mobile Screen | Mobile Route | Entry Point | Exit Point | API Endpoint(s) | Auth Required | User Role | CRUD | State Handling (Loading / Empty / Error) |
|---|---|---|---|---|---|---|---|---|---|---|
| **VAL-01** | `/validation` | `ValidationScreen` | `ValidationTab` | Bottom Tab | Questionnaire / Surveys / Reports | `GET /workspace/:id/validation/status` | Yes | User / Member / Owner | Read | 12-stage interactive stepper, readiness radar score, completed badge vs active status |
| **VAL-02** | `/workspace/:id/step/:stepId` | `QuestionnaireScreen` | `Questionnaire` | Validation Step Click | Validation / Next Step | `GET /workspace/:id/step/:stepId/questions`, `POST /workspace/:id/step/:stepId/answers`, `POST /workspace/:id/step/:stepId/ai-assist` | Yes | User / Member / Owner | Read / Create / Update | Multi-question paginator, AI Auto-Suggest answer button, draft auto-save, unsaved changes warning |
| **VAL-03** | `/workspace/:id/surveys` | `SurveysScreen` | `Surveys` | Validation Step 4 (Survey Intelligence) | Create Survey / Results | `GET /workspace/:id/surveys`, `POST /workspace/:id/surveys`, `GET /workspace/:id/surveys/:surveyId/results` | Yes | User / Member / Owner | CRUD | Survey builder preview, response metric charts, shareable survey link copy modal |

---

## 5. Intelligence Reports & Verification

| ID | Web Screen | Mobile Screen | Mobile Route | Entry Point | Exit Point | API Endpoint(s) | Auth Required | User Role | CRUD | State Handling (Loading / Empty / Error) |
|---|---|---|---|---|---|---|---|---|---|---|
| **REP-01** | `/workspace/:id/report` | `ValidationReportScreen` | `ValidationReport` | Validation Step 12 / Dashboard CTA | Dashboard / Share Sheet | `GET /workspace/:id/report`, `GET /workspace/:id/certificate`, `POST /workspace/:id/report/generate` | Yes | User / Member / Owner | Read / Export | Viability gauge (0-100), SWOT breakdown cards, Risk & Market charts, native PDF certificate download & OS share sheet |

---

## 6. Profile, Plans, Settings & System

| ID | Web Screen | Mobile Screen | Mobile Route | Entry Point | Exit Point | API Endpoint(s) | Auth Required | User Role | CRUD | State Handling (Loading / Empty / Error) |
|---|---|---|---|---|---|---|---|---|---|---|
| **PROF-01** | `/profile` | `ProfileScreen` | `Profile` | Header Avatar / Settings | Edit Profile / Logout | `GET /user/profile`, `PUT /user/profile`, `POST /user/avatar` | Yes | User / Member / Owner | Read / Update | User avatar picker, personal detail form, current active plan badge |
| **SET-01** | `/settings` | `SettingsScreen` | `Settings` | Profile / Header Gear | Pricing / Terms / Biometrics | `GET /user/settings`, `PUT /user/settings` | Yes | User / Member / Owner | Read / Update | Light/Dark theme toggle, Biometric lock toggle (Face ID/Fingerprint), push notification toggles |
| **PLAN-01** | `/pricing` | `PricingScreen` | `Pricing` | Dashboard Quota / Settings | Checkout / Stripe Webview | `GET /billing/plans`, `POST /billing/checkout-session` | Yes | User / Member / Owner | Read / Subscribe | Free, Starter, Pro, Enterprise tier comparison cards, feature matrices, secure payment redirect |
| **LEGAL-01**| `/legal` | `TermsPrivacyScreen` | `TermsPrivacy` | Auth / Settings | Back | Static / `GET /legal/content` | No | All | Read | Privacy policy, Terms of Service, and GDPR compliance disclosure |
| **FEED-01** | Modal `/feedback` | `UserFeedbackModal` | `UserFeedbackModal` | Settings / Shake-to-report | Dismiss | `POST /feedback/submit` | Yes | User / Member / Owner | Create | 5-star rating selector, category picker (Bug, Feature, Other), screenshot attachment |

---

## 7. Administrative Boundaries (Mobile Exclusion Verification)
The following administrative web screens are strictly **EXCLUDED** from the mobile client:
- `/admin/dashboard`
- `/admin/users`
- `/admin/analytics`
- `/admin/workspaces`
- `/admin/subscriptions`
- `/admin/ai-prompts`
- `/admin/audit-logs`
- `/admin/system-health`

*Note: All corresponding `/admin/*` backend endpoints are guarded by JWT role verification (`role === 'super_admin'`) returning `403 Forbidden` for all standard mobile sessions.*
