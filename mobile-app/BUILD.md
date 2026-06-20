# PO.PU Mobile App — Build Guide

## Prerequisites

- Node.js 18+
- EAS CLI: `npm install -g eas-cli`
- Expo CLI: `npm install -g expo-cli`
- EAS account: `eas login`

## Setup

```bash
cd mobile-app
npm install
cp .env.example .env
# Edit .env with real values
```

## Environment Variables (.env)

```env
EXPO_PUBLIC_API_URL=https://popu-backend.onrender.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_APP_ENV=production
```

## Google Services

1. Create Firebase project at console.firebase.google.com
2. Add Android app with package `com.popu.app`
3. Download `google-services.json` → place in `mobile-app/google-services.json`
4. Enable FCM in Firebase console

## App Icons / Splash (required before build)

Replace these placeholder assets with real images:

- `src/assets/icon.png` — 1024×1024 PNG (app icon)
- `src/assets/adaptive-icon.png` — 1024×1024 PNG (Android adaptive)
- `src/assets/splash.png` — 1284×2778 PNG (splash screen)
- `src/assets/notification-icon.png` — 96×96 PNG (white on transparent)
- `src/assets/logo.png` — 300×100 PNG (in-app logo)

## Local Development

```bash
# Start Expo dev server
npm start

# Run on Android device/emulator
npm run android
```

## Build APK (for testing)

```bash
# Initialize EAS project (first time only)
eas init

# Build debug APK
npm run build:android:debug

# Build preview APK (internal distribution)
npm run build:android:preview
```

Download the APK from the EAS build page and install on device via ADB:

```bash
adb install popu-preview.apk
```

## Build AAB (for Google Play Store)

```bash
npm run build:android:release
```

Upload the `.aab` file to Google Play Console → Production track.

## Google Play Store Checklist

- [ ] App icon 512×512 PNG (no transparency)
- [ ] Feature graphic 1024×500 PNG
- [ ] Screenshots: min 2 phone screenshots per target device
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire completed
- [ ] Target API level ≥ 33 (Android 13)
- [ ] Data safety form completed

## Architecture

```
mobile-app/
├── App.js                    # Root component
├── src/
│   ├── config/
│   │   ├── constants.js      # API_URL, keys
│   │   └── theme.js          # COLORS, SIZES, SHADOWS
│   ├── contexts/
│   │   ├── AuthContext.js    # JWT auth state
│   │   └── CartContext.js    # Cart state
│   ├── navigation/
│   │   ├── RootNavigator.js  # Role-based root
│   │   ├── AuthNavigator.js  # Login/Register/ForgotPassword
│   │   ├── CustomerNavigator.js
│   │   ├── CatererNavigator.js
│   │   ├── RiderNavigator.js
│   │   └── AdminNavigator.js
│   ├── screens/
│   │   ├── auth/             # 3 screens
│   │   ├── customer/         # 12 screens
│   │   ├── caterer/          # 7 screens
│   │   ├── rider/            # 5 screens
│   │   └── admin/            # 5 screens
│   ├── services/
│   │   ├── api.js            # Axios + JWT interceptor
│   │   ├── authService.js    # Login/register/logout
│   │   ├── foodService.js
│   │   ├── orderService.js
│   │   ├── profileService.js
│   │   ├── catererService.js
│   │   ├── locationService.js  # Background GPS
│   │   ├── notificationService.js  # FCM
│   │   └── adminService.js
│   └── components/common/    # Button, Input, Card, etc.
```
