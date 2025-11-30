# Build Production App

## For Android APK
```bash
cd CodersFlow/frontend2/Frontend
npx expo build:android
```

## For iOS IPA
```bash
cd CodersFlow/frontend2/Frontend
npx expo build:ios
```

## Alternative: EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```
