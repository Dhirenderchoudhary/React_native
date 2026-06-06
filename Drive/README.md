# Clutch - Driver Safety Companion

**Created and Maintained by Dhirender Choudhary**

A modern, skeuomorphic React Native application that analyzes your driving in real-time using on-device sensors. No cloud required. All data stays entirely on your device.

---

## 🌟 Key Features

- **Live Drive Recording** - High-frequency sampling (up to 120 Hz) of accelerometer, gyroscope, and GPS data.
- **Intelligent Event Detection** - Automatically detects harsh braking, hard acceleration, sharp turns, aggressive steering, and phone handling.
- **Dynamic Safety Score** - Start with a perfect 100, dynamically adjusted based on real-time event penalties.
- **Advanced Analytics & Trends** - Detailed bar charts and line graphs breaking down your driving habits.
- **AI-Powered Coaching** - Optional Groq API integration provides personalized coaching suggestions based on your ride telemetry.
- **Custom Avatars** - Choose from 27 unique avatars including illustrated, monochrome, and 3D styles (with initials fallback).
- **Privacy-First Design** - Everything runs locally. SQLite on-device storage with encrypted keys using `expo-secure-store`.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 56 / React Native 0.85 |
| **Navigation** | expo-router (file-based) |
| **Database** | expo-sqlite (WAL mode) |
| **Sensors** | expo-sensors, expo-location |
| **State Management** | Zustand |
| **AI Integration** | Groq API (Optional, encrypted storage) |
| **UI Design** | Custom skeuomorphic design system, expo-linear-gradient, react-native-svg |

---

## 🚀 Getting Started

To get started with the project locally:

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

Scan the QR code with Expo Go or run on your preferred iOS/Android simulator. **Note:** Location and motion permissions are required for the drive recording to function properly.

### Optional: Enabling AI Coaching

1. Obtain a free API key from [console.groq.com](https://console.groq.com).
2. Navigate to **Settings → AI Coaching → Add Key**.
3. Your key will be securely encrypted and stored in your device's secure enclave.

---

## 📊 How Scoring Works

Your safety score starts at **100** for every drive and is adjusted when events are detected:

| Event Severity | Penalty |
|---|---|
| Light | −4 to −5 pts |
| Moderate | −7 to −10 pts |
| Severe | −15 pts |

### Rating Tiers

The home screen displays your **average score** across all completed drives.

| Score Range | Rating |
|---|---|
| 90–100 | **A** - Excellent |
| 75–89 | **B** - Good |
| 60–74 | **C** - Fair |
| < 60 | **D** - Poor |

---

*Engineered with precision for the modern driver.*
