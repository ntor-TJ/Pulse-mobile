# Axiora Pulse Mobile — Security Architecture & Hardening Guide

This document outlines the end-to-end security architecture, cryptographic storage policies, authorization enforcement boundaries, network security controls, and platform-specific protections implemented across Android and iOS in the Axiora Pulse mobile application.

---

## 1. Zero-Trust Client Model & Server Authorization
The Axiora Pulse mobile application operates under a strict **Zero-Trust Client Principle**:
1. **No Client-Side Authorization Trust**: The mobile app NEVER acts as a security boundary. All access control, ownership checks, quota limits, and role validations are strictly enforced on the Axiora Pulse backend (`axiora-pulse-be`).
2. **Strict Exclusion of Admin Code**: All administrative dashboards, user administration tools, AI prompt management, and super-admin routes are completely omitted from the mobile application source.
3. **Workspace Access Guarding**: Every request containing a `workspace_id` parameter is verified server-side against the authenticated user's JWT ID. Attempts to access foreign workspace IDs immediately trigger `403 Forbidden` and are logged for security auditing.

---

## 2. Secure Token Storage & Cryptography

### Android Platform Storage
- **Mechanism**: `expo-secure-store` backed by the **Android Keystore system**.
- **Cryptographic Details**: Tokens and sensitive session keys are encrypted with AES-256 in GCM mode. Master keys are securely generated and kept inside the hardware-backed Trusted Execution Environment (TEE) or StrongBox Keymaster.
- **Shared Preferences Isolation**: Plain `AsyncStorage` and unencrypted `SharedPreferences` are NEVER used to store access tokens, refresh tokens, passwords, or personal health/financial data.

### iOS Platform Storage
- **Mechanism**: `expo-secure-store` backed by the **iOS Keychain Services API**.
- **Access Control Attribute**: `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` ensures cryptographic tokens cannot be migrated across device backups or accessed when the device is locked.

---

## 3. Network & Transport Layer Security (TLS/HTTPS)

1. **Mandatory HTTPS**: All production API traffic is transmitted strictly over TLS 1.3/1.2.
2. **No Cleartext Traffic**: `android:usesCleartextTraffic="false"` is enforced in the Android production release manifest.
3. **Certificate Validation**: All SSL/TLS certificate chains are strictly validated against trusted Certificate Authorities (CAs). Self-signed certificates and permissive `TrustAllCertificates` trust managers are strictly forbidden.
4. **App Transport Security (ATS)**: iOS `NSAppTransportSecurity` enforces `NSAllowsArbitraryLoads = false`.

---

## 4. Biometric Authentication & Session Security

1. **Local Biometric Unlock**: Users can enable Biometric authentication (Face ID, Touch ID, Android BiometricPrompt) in Settings (`biometricService.ts`).
2. **Cryptographic Binding**: Biometric authentication decrypts an encrypted local session key rather than substituting server-side authentication.
3. **Session Expiry & Token Rotation**:
   - Access tokens have a short lifespan (1 hour).
   - Refresh tokens are rotated upon use.
   - On `401 Unauthorized` responses, the `apiClient` attempts a single refresh request. If the refresh token is expired or revoked, the app immediately executes a complete logout, wiping all secure keys and returning the user to the login screen.
4. **Secure Logout**:
   - `logout()` in `AuthContext` wipes both `access_token` and `refresh_token` from hardware Keystore/Keychain, resets cached user state, and resets active workspace contexts to prevent memory lingering.

---

## 5. Android-Specific Hardening

1. **R8 / ProGuard Minification & Obfuscation**:
   - Release builds enable code shrinking, resource stripping, and name obfuscation to prevent reverse-engineering of mobile client logic.
2. **Component Export Security**:
   - Only `MainActivity` is exported with the intent filter for deep linking.
   - All other Activities, Services, and BroadcastReceivers have `android:exported="false"`.
3. **Minimum & Target SDKs**:
   - `minSdkVersion`: 24 (Android 7.0 Nougat) ensuring modern crypto API availability.
   - `targetSdkVersion`: 36 (Android 15) complying with the latest Google Play Store security mandates.
4. **Permission Minimization**:
   - Only `INTERNET` and `RECORD_AUDIO` (for live voice mentor interaction) are declared. No unnecessary SMS, location, or background storage permissions are included.

---

## 6. iOS-Specific Hardening

1. **Keychain Isolation**: Bundle-identifier scoped Keychain access prevents sandbox escalation.
2. **Microphone Privacy Usage**: `NSMicrophoneUsageDescription` explicitly informs the user that microphone access is required only for live voice coaching with Arya AI.
3. **Memory Safety**: No persistent caching of audio buffers or raw AI stream chunks to permanent device disk.

---

## 7. Sanitized Logging & Environment Policy

1. **Production Log Sanitization**: Production builds strip debug logs. Sensitive headers (`Authorization`, `Cookie`), passwords, OTP tokens, and AI response embeddings are never written to `console.log` or mobile crash reports.
2. **No Embedded Server Secrets**: The mobile build contains only client-safe public configuration (e.g., `API_BASE_URL`). Backend database connection strings, JWT signing secrets, and OpenAI/Anthropic API keys are strictly maintained on the server.
