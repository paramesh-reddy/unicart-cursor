# 📱 Android APK Build Setup Guide

## 🎯 Current Status
✅ Capacitor is configured and synced
✅ Android project is ready
✅ App will connect to: https://unicart-cursor-pro.vercel.app

## 🔧 Required Software

To build the Android APK, you need to install:

### 1. Install Java Development Kit (JDK 17)
Download from: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- Choose Windows x64 Installer
- Run the installer
- Add to PATH if not automatic

**Verify installation:**
```bash
java -version
javac -version
```

### 2. Install Android Studio
Download from: https://developer.android.com/studio
- Run the installer
- Follow the setup wizard
- Install Android SDK (latest version)
- Accept licenses

**After installation, add to PATH:**
```bash
# Add to your PATH environment variable:
%LOCALAPPDATA%\Android\Sdk\platform-tools
%LOCALAPPDATA%\Android\Sdk\tools
```

### 3. Set Environment Variables
Add these to your system PATH:
```
ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17
```

## 🚀 Build the APK

Once Android Studio is installed:

### Option 1: Using Android Studio (Recommended)
1. Open Android Studio
2. File → Open → Select `android` folder
3. Wait for Gradle sync to complete
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Using Command Line
```bash
# Navigate to android folder
cd android

# Build debug APK
.\gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

## 📦 Production Build (For Play Store)

### Generate Signed APK
1. In Android Studio: Build → Generate Signed Bundle / APK
2. Choose APK
3. Create new keystore or use existing
4. Build release APK

### Or use command line:
```bash
# First, create keystore
keytool -genkey -v -keystore unicart-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias unicart

# Then build release
cd android
.\gradlew assembleRelease -Pandroid.injected.signing.store.file=../unicart-key.jks -Pandroid.injected.signing.store.password=YOUR_PASSWORD -Pandroid.injected.signing.key.alias=unicart -Pandroid.injected.signing.key.password=YOUR_PASSWORD
```

## 🔄 After Code Changes

When you update your Next.js app:

```bash
# 1. Rebuild your web app
npm run build

# 2. Sync to Capacitor
npm run cap:sync

# 3. Open Android Studio to build APK
npx cap open android

# Or build via command line
cd android && .\gradlew assembleDebug
```

## 📝 Important Notes

1. **Server Mode**: Your app is currently configured to load from Vercel
   - You can change this in `capacitor.config.ts`
   - Comment out `server.url` for local builds

2. **Permissions**: Add required permissions in `android/app/src/main/AndroidManifest.xml`

3. **Signing**: Debug builds are automatically signed. Production builds need your keystore.

4. **Testing**: You can test on:
   - Android emulator (in Android Studio)
   - Physical device (connect via USB, enable Developer Mode)

## 🐛 Troubleshooting

### "java command not found"
- Install JDK 17
- Add to PATH

### "gradlew not found"
- CD to android folder
- Use `.\gradlew.bat` on Windows

### "Android SDK not found"
- Open Android Studio
- Tools → SDK Manager
- Install latest SDK

### "Build failed"
- Clean build: `cd android && .\gradlew clean`
- Rebuild: `.\gradlew assembleDebug`

## 📱 Installing APK on Device

1. Transfer `app-debug.apk` to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Open the APK file to install

## 🎉 Success!

Your Android app will:
- Connect to your live Vercel deployment
- Work offline when cached
- Have native Android features
- Be ready for Play Store submission

## 📚 Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Android Docs: https://developer.android.com/
- Android Studio: https://developer.android.com/studio


