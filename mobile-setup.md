# Mobile App Setup with Capacitor

This guide explains how to convert the Raza Accounting Portal into mobile apps for iOS and Android using Capacitor.

## Prerequisites

### For Android:
- Android Studio
- Android SDK
- Java Development Kit (JDK) 11 or higher

### For iOS (macOS only):
- Xcode 14 or higher
- iOS SDK
- CocoaPods

## Setup Steps

### 1. Install Capacitor

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### 2. Initialize Capacitor

```bash
npx cap init
```

### 3. Build the Web App

```bash
npm run build
```

### 4. Add Mobile Platforms

```bash
# Add Android
npx cap add android

# Add iOS (macOS only)
npx cap add ios
```

### 5. Sync Web Assets

```bash
npx cap sync
```

### 6. Open in Native IDEs

```bash
# Open Android project in Android Studio
npx cap open android

# Open iOS project in Xcode (macOS only)
npx cap open ios
```

## Recommended Capacitor Plugins

### Already Configured:
- Splash Screen
- Status Bar
- Keyboard
- Storage

### Additional Plugins for Accounting Portal:

```bash
# File system access
npm install @capacitor/filesystem

# Camera for document scanning
npm install @capacitor/camera

# Local notifications
npm install @capacitor/local-notifications

# Push notifications
npm install @capacitor/push-notifications

# Biometric authentication
npm install @capacitor-community/biometric-auth

# PDF viewer
npm install @capacitor-community/pdf-viewer

# File opener
npm install @capacitor-community/file-opener
```

## Mobile-Specific Features

### 1. Document Scanning
Use the Camera plugin to scan receipts and documents directly in the app.

### 2. Biometric Authentication
Implement fingerprint/face recognition for secure login.

### 3. Offline Storage
Cache important files locally using the Storage plugin.

### 4. Push Notifications
Notify users when new documents are uploaded.

### 5. File Management
Allow users to download and view files offline.

## Build Configuration

### Android (android/app/build.gradle)
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.razaaccounting.portal"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### iOS (ios/App/App/Info.plist)
```xml
<key>CFBundleDisplayName</key>
<string>Raza Accounting</string>
<key>CFBundleIdentifier</key>
<string>com.razaaccounting.portal</string>
<key>CFBundleVersion</key>
<string>1.0.0</string>
```

## Production Build Commands

### Development Build:
```bash
npm run build
npx cap sync
npx cap run android
npx cap run ios
```

### Production Build:
```bash
npm run build
npx cap sync
npx cap build android
npx cap build ios
```

## Security Considerations for Mobile

1. **API Endpoints**: Use HTTPS for all API communication
2. **Token Storage**: Store JWT tokens securely using Capacitor Storage
3. **Biometric Auth**: Implement biometric authentication for sensitive operations
4. **Certificate Pinning**: Pin SSL certificates for enhanced security
5. **Code Obfuscation**: Obfuscate the production build

## Testing

### On Device:
```bash
# Android
npx cap run android --target=device

# iOS
npx cap run ios --target=device
```

### In Emulator:
```bash
# Android
npx cap run android --target=emulator

# iOS Simulator
npx cap run ios --target=simulator
```

## App Store Deployment

### Android (Google Play):
1. Generate signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Configure app listing and privacy policy

### iOS (App Store):
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Submit for review

## Maintenance

- Keep Capacitor and plugins updated
- Test on multiple device sizes and OS versions
- Monitor crash reports and user feedback
- Regular security updates