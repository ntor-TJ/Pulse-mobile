# Axiora Pulse Mobile Application 🚀

**Axiora Pulse Mobile** is the official cross-platform mobile counterpart to the Axiora Pulse Web Application. Built with **React Native**, **TypeScript**, and **Expo Prebuild (Native Android/iOS toolchains)**, it delivers a high-fidelity, production-grade mobile experience for startup founders to validate ideas, converse with AI startup mentors, run voice coaching sessions with Arya, track 12-stage validation journeys, conduct market surveys, and generate investment-grade reports.

---

## 📱 Features & Highlights

- **Exact Brand Identity**: Custom Axiora Pulse design tokens (Axiora Orange `#FF4500`, dark & light surface tiers, smooth border radii, and elevated glass styling).
- **12-Stage Validation Stepper**: Complete interactive tracking for Idea Validation, Market Research, Business Model, Survey Intelligence, Financial Planning, MVP, Setup, Go-To-Market, Pilot Testing, Launch, Break-Even, and Scale.
- **AI Startup Mentor**: Full-duplex interactive mentor chat with markdown rendering, suggested prompts, and answer regeneration.
- **Arya Live Voice Assistant**: Voice coaching modal with dynamic acoustic pulse visualizer and low-latency audio streaming.
- **Hardware-Backed Cryptography**: JWT tokens stored securely via `expo-secure-store` leveraging **Android Keystore** and **iOS Keychain**.
- **Biometric Security**: Touch ID, Face ID, and Android BiometricPrompt authentication.
- **Validation Reports & PDF Export**: Executive viability scoring, SWOT breakdown, recommendations, and local PDF certificate download & OS sharing.
- **Zero Admin Access**: Pure client-side and server-side isolation for standard users.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React Native 0.86.3 + Expo SDK 54 / 57
- **Language**: TypeScript (Strict type checking, 0 compilation errors)
- **Navigation**: React Navigation (Bottom Tabs + Stack Navigator + Modals)
- **State Management**: React Context (`AuthContext`, `WorkspaceContext`, `ThemeContext`)
- **Icons**: Lucide React Native & Ionicons
- **Security**: Expo SecureStore, Expo LocalAuthentication
- **File System & Sharing**: Expo FileSystem, Expo Sharing
- **Audio & Haptics**: Expo AV, Expo Haptics

---

## 📂 Project Structure

```
axiora-pulse-mobile/
├── android/                   # Native Android project (Gradle 9.3.1, SDK 36, NDK 27.1)
├── ios/                       # Native iOS project
├── src/
│   ├── assets/                # Logos, icons, and illustrations
│   ├── components/            # Reusable design system (Buttons, Cards, Inputs, Loaders, Headers)
│   ├── context/               # AuthContext, WorkspaceContext, ThemeContext
│   ├── navigation/            # RootNavigator, TabNavigator, AuthNavigator
│   ├── screens/
│   │   ├── auth/              # Login, Register, OTP Verification, Forgot/Reset Password
│   │   ├── onboarding/        # Onboarding wizard
│   │   ├── dashboard/         # Active Workspace overview & quick actions
│   │   ├── workspace/         # Workspace List, Creation, Details, Archive, Attachments
│   │   ├── chat/              # AI Mentor Chat Screen
│   │   ├── voice/             # Arya Live Voice Assistant Modal
│   │   ├── validation/        # 12-Stage Validation Stepper & Questionnaire
│   │   ├── surveys/           # Survey Intelligence & Response Metrics
│   │   ├── reports/           # Validation Report & Certificate Download
│   │   ├── pricing/           # Subscription Plans & Quota Limits
│   │   ├── profile/           # User Profile & Avatar Settings
│   │   └── settings/          # Theme, Biometrics, Notifications, Legal
│   ├── services/              # API clients, auth, workspaces, chat, validation, billing
│   ├── theme/                 # Design tokens, color palettes (Dark/Light), typography
│   └── types/                 # Comprehensive TypeScript interface definitions
├── app.json                   # Expo & Native configuration
├── package.json               # Dependencies and scripts
├── MOBILE_SCREEN_INVENTORY.md # Full screen-to-API matrix
├── MOBILE_API_MAPPING.md      # API contract and payload mapping
├── MOBILE_SECURITY.md         # Security, cryptography, and network protection guide
└── MOBILE_RELEASE_CHECKLIST.md# Release QA checklist
```

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- Node.js (v18+)
- Java JDK 17
- Android SDK (API 34-36) and NDK (`27.1.12297006`)
- Android Emulator or physical device with USB debugging enabled

### 2. Installation
```bash
cd e:\Pulse\axiora-pulse-mobile
npm install
```

### 3. Run Development Server
```bash
npm start
# or run directly on Android
npm run android
```

---

## 📦 Building Standalone Release Artifacts

### 1. Build Standalone Release APK
```bash
cd android
.\gradlew.bat assembleRelease
```
*Output artifact:* `android/app/build/outputs/apk/release/app-release.apk` (or top-level `axiora-pulse.apk`).

### 2. Build Google Play Store Android App Bundle (AAB)
```bash
cd android
.\gradlew.bat bundleRelease
```
*Output artifact:* `android/app/build/outputs/bundle/release/app-release.aab`.

---

## 🔒 Security Configuration
- All communication with `axiora-pulse-be` is secured via HTTPS/WSS.
- Client requests validate JWT bearer tokens.
- Secure storage keys: `axiora_access_token`, `axiora_refresh_token`, `axiora_biometrics_enabled`.
