# SpeakFlow Mobile Application (iOS & Android)

This turnkey mobile client is built on **React Native** and **Expo SDK 51+**, consuming the 100% shared platform-agnostic business logic, AI engines, and pronunciation scorers directly from `@speakflow/core`.

## Prerequisites
- Node.js 20+
- Expo CLI (`npm install -g expo-cli eas-cli`)
- For iOS: macOS with Xcode (or cloud builds via EAS)
- For Android: Android Studio & JDK 17 (or cloud builds via EAS)

## Development
Run in the monorepo root:
```bash
# Start Metro bundler
npm run start --workspace=@speakflow/mobile

# Run directly on connected Android device / emulator
npm run android --workspace=@speakflow/mobile

# Run directly on iOS simulator (macOS)
npm run ios --workspace=@speakflow/mobile
```

## Production App Store & Google Play Store Builds (EAS)

1. **Login to Expo Application Services**:
   ```bash
   eas login
   ```

2. **Configure Project**:
   ```bash
   cd apps/mobile
   eas project:init
   ```

3. **Build Android Production App Bundle (.aab)**:
   ```bash
   npm run build:android
   ```
   This generates a release `.aab` ready for upload to the **Google Play Console**.

4. **Build iOS Production Archive (.ipa)**:
   ```bash
   npm run build:ios
   ```
   This generates an App Store signed `.ipa` ready for **TestFlight** and **Apple App Store Review**.
