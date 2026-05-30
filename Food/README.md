# Juniper

> seasonal plates, steady delivery

A food delivery app built with React Native + Expo, focused on demonstrating all major React Navigation patterns in one complete app.

---




## Tech Stack

- **React Native** + **Expo** (SDK 55)
- **React Navigation** — Native Stack, Bottom Tabs, Drawer
- **AsyncStorage** — auth persistence
- **expo-linear-gradient** — Netflix-style gradients
- **react-native-svg** — custom SVG icons
- **lucide-react-native** — additional icons

---

## How to Run

```bash
cd Food
npm install
npx expo start --clear
```

Scan the QR code with Expo Go, or press `a` for Android emulator.

---

## Navigation Structure

```
Root Stack
├── Login                        ← unauthenticated
└── (authenticated)
    ├── Onboarding               ← shown after login
    └── MainTabs (Bottom Tabs)
        ├── Home Tab
        │   └── HomeStack (Native Stack)
        │       ├── HomeScreen
        │       ├── RestaurantDetail  ← tab bar hidden, params: name, price, image
        │       └── Cart              ← tab bar hidden, slide_from_bottom
        ├── Search Tab
        ├── Orders Tab            ← badge = cart item count
        └── Profile Tab
            └── ProfileDrawer (Drawer)
                ├── Profile
                ├── My Orders
                ├── Settings
                ├── Help
                └── Logout → clears auth → back to Login
```

---

## Auth Flow

- Auth state stored in `AsyncStorage` via `AuthContext`
- On app start: reads token → shows loading spinner → routes correctly
- Login: any social button or email → 800ms mock delay → `isLoggedIn = true` → navigator swaps automatically
- Logout: removes token → `isLoggedIn = false` → navigator swaps automatically
- No manual `navigation.navigate()` for auth transitions — conditional rendering handles it

---

## Programmatic Navigation

| Method | Where |
|--------|-------|
| `navigate` | Home → RestaurantDetail (with params) |
| `navigate` | RestaurantDetail → Cart (with params) |
| `goBack` | Cart "Keep Browsing" button |
| `replace` | Onboarding → MainTabs |
| `reset` | Cart "Place Order" → clears stack to Home |
| `openDrawer` | Profile screen menu button |

---

## Deep Linking

Scheme: `juniper://`

```
juniper://restaurant/123  →  opens RestaurantDetail with id = "123"
```

**Test on Android:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "juniper://restaurant/1"
```

**Test on iOS:**
```bash
xcrun simctl openurl booted "juniper://restaurant/1"
```

Config in `src/navigation/linking.ts`.

---

## Assumptions

- Authentication is mocked — any credentials work
- Cart state is in-memory (resets on app restart)
- Restaurant data is hardcoded
- Food images sourced from Unsplash (free tier)
