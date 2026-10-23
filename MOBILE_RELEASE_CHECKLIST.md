# Axiora Pulse Mobile — Release & Verification Checklist

This checklist must be executed and confirmed before promoting any mobile build (`APK` / `AAB` / `IPA`) to production distribution channels (Google Play Store, Apple App Store, internal enterprise distribution).

---

## 1. Backend & API Integration
- [x] **Production API Endpoints Verified**: All endpoints route to valid HTTPS endpoints (`https://api.axiorapulse.com`).
- [x] **Zero Mock Data in Production Code**: All services connect to real REST / WebSocket backend implementations.
- [x] **Backward Compatibility**: Mobile payloads match existing web schemas without breaking `axiora-pulse-fe`.
- [x] **Admin Route Isolation**: Verify that `/admin/*` routes return `403 Forbidden` for standard mobile tokens.

---

## 2. Authentication & Session Security
- [x] **Email & Password Login**: Validated with server hashing.
- [x] **6-Digit OTP Verification**: Tested with countdown timer and resend triggers.
- [x] **Hardware Keystore / Keychain Storage**: Verified using `expo-secure-store`.
- [x] **Token Refresh Lifecycle**: Automatic token refresh on 401, clean purge on invalid token.
- [x] **Secure Logout**: Hardware-stored tokens and cache wiped immediately.
- [x] **Biometric Authentication**: Local biometric authentication enabled via `LocalAuthentication`.

---

## 3. Core Functional Workflows
- [x] **Workspace CRUD**: Create, read, switch, update, archive, and delete workspaces.
- [x] **AI Startup Mentor**: Real-time message streaming, prompt chips, markdown, and regeneration.
- [x] **Arya Live Voice Assistant**: Microphone permission requesting, acoustic ring visualizer, voice streaming modal.
- [x] **12-Stage Validation Stepper**: All 12 validation steps render with accurate state and progress percentages.
- [x] **Validation Questionnaire & AI Assist**: Step questions editable with AI suggestions and auto-save.
- [x] **Survey Intelligence**: Survey preview and response telemetry.
- [x] **Validation Report & Viability Gauge**: Detailed SWOT, recommendations, and PDF certificate export.
- [x] **User Quotas & Pricing**: Active subscription tier display and upgrade flow.

---

## 4. Android Build & Package Validation
- [x] **Application ID**: `com.axiora.pulse` confirmed in `app.json` and `build.gradle`.
- [x] **Target SDK**: Configured for Android 15 (API level 36).
- [x] **Min SDK**: Configured for Android 7.0 (API level 24).
- [x] **Release Keystore Signing**: Release build configured and signed.
- [x] **Standalone APK Generated**: `axiora-pulse.apk` (85.8 MB) verified and installable.
- [x] **Google Play Bundle Generated**: `app-release.aab` generated for Play Store Console upload.
- [x] **Permissions Minimized**: Only `android.permission.INTERNET` and `android.permission.RECORD_AUDIO`.

---

## 5. iOS Readiness
- [x] **Bundle Identifier**: Configured as `com.axiora.pulse`.
- [x] **Privacy Permission Strings**: `NSMicrophoneUsageDescription` defined in `app.json`.
- [x] **App Transport Security**: Strict TLS enforced; no arbitrary HTTP loads permitted.
- [x] **Safe Area & Dynamic Island**: Layouts use `react-native-safe-area-context` and adaptive flex spacing.

---

## 6. Offline & Error Handling
- [x] **Network Offline Banner**: `OfflineNotice` component detects connection drops via NetInfo.
- [x] **Graceful Error States**: `PulseErrorState` with retry buttons on failed network calls.
- [x] **Debounce on Submissions**: Double-tap protection on form submits and AI message triggers.
