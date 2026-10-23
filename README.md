# Pulse-mobile — Axiora Pulse Mobile (React Native / Expo)

> **Mobile AI Founder Co-pilot & Idea Validation Suite**
> Connects directly with the [Axiora Pulse Backend (FastAPI)](../axiora-pulse-be) to provide on-the-go AI mentoring, multi-agent market research feeds, interactive validation questionnaires, and customer survey management.

---

## 📱 Features

1. **AI Mentor Streaming Chat**:
   - Guided conversational idea validation powered by multi-agent orchestration.
   - Interactive action chips, real-time message streaming, and web research citations.
2. **Validation Workspaces**:
   - Manage startup concepts, track idea maturity scores, and view validation pipelines.
3. **Interactive 4-Pillar Questionnaire**:
   - Step-by-step problem definition, buyer profiling, urgency scaling, and alternative solution mapping.
4. **Market Surveys**:
   - View survey responses, monitor targets, and share instant validation links.
5. **Token Consumption Analytics**:
   - Real-time LLM token usage tracking and quota monitoring.
6. **Configurable Backend Target**:
   - Easily switch between Android Emulator (`http://10.0.2.2:8000/api/v1`), local network IP, or production endpoints from the Profile settings screen.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- [Expo Go app](https://play.google.com/store/apps/details?id=host.exp.exponent) on your physical Android device, OR Android Studio with an Android Emulator.

### 2. Start the Development Server
```bash
cd axiora-pulse-mobile
npm start
```

### 3. Run on Android
- **Android Emulator**: Press `a` in the terminal after running `npm start`.
- **Physical Device (Expo Go)**: Scan the QR code displayed in your terminal using the Expo Go Android app.

---

## 🏗️ Project Structure

```
Pulse-mobile/
├── App.tsx                     # Main application entry
├── axiora-pulse.apk            # Pre-built Android preview release APK
├── src/
│   ├── components/             # Reusable UI components (Header, Card, Button, Input, ChatBubble, Badge)
│   ├── context/                # AuthContext & WorkspaceContext
│   ├── navigation/             # RootNavigator & Bottom Tabs
│   ├── screens/
│   │   ├── auth/               # Login, Register, OTP Verification
│   │   ├── dashboard/          # Workspaces & Metrics
│   │   ├── workspace/          # Validation Hub & Stage Detail
│   │   ├── chat/               # AI Mentor Streaming Chat
│   │   ├── questionnaire/      # Interactive 4-Pillar Framework
│   │   ├── surveys/            # Customer Surveys & Links
│   │   └── profile/            # Profile, Tokens & API Settings
│   ├── services/               # API Client, Auth, Workspace, Chat, Survey services
│   ├── theme/                  # Brand colors, typography, spacing
│   └── types/                  # TypeScript data contracts
├── AxioraPulse_Test_Reports/   # Cross-stage validation reports, test scripts & evidence
└── Docs/                       # Stage capabilities, AI Mentor voice & execution workbooks
```

---

## 📦 Building Standalone APK / AAB
To generate a release Android build using EAS Build:
```bash
npx eas-cli build -p android --profile preview
```
