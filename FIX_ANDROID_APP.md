# 🔴 FIX: Android App Error - Pixel_6 Crashing

## Problem
Pixel_6 emulator keeps crashing because it's using **API 36** (unstable).

## ✅ SOLUTION: Use Physical Device (FASTEST & BEST)

### Step 1: Enable USB Debugging on Your Phone
1. On your Android phone:
   - **Settings > About Phone**
   - Tap **Build Number** 7 times (until you see "You are now a developer!")
2. Go back to **Settings > Developer Options**
3. Enable **USB Debugging**
4. Enable **Install via USB** (optional)

### Step 2: Connect Phone to PC
1. Connect your phone to PC via USB cable
2. On your phone, allow USB debugging when prompted
3. Select **"Always allow from this computer"** (optional)

### Step 3: Verify Connection
1. In Android Studio, check if your phone appears in the device dropdown (top toolbar)
2. Or run in terminal:
   ```bash
   adb devices
   ```
   You should see your device listed

### Step 4: Run Your App
1. In Android Studio, select your **physical phone** from the device dropdown (where it says "Pixel 6")
2. Click **Run (▶️)** button
3. Your app will install and run on your phone!

## ✅ ALTERNATIVE: Create Stable Emulator

If you MUST use an emulator:

### Step 1: Delete All API 36 AVDs
1. In Android Studio: **Tools > Device Manager**
2. Delete **Pixel_6**, **Pixel_5**, and **Medium_Phone**
   - Click dropdown (▼) → **Delete**

### Step 2: Install Stable System Image
1. **Tools > SDK Manager**
2. **SDK Platforms** tab
3. Check **"Show Package Details"**
4. Find **Android 12.0 (S)** or **Android 11.0 (R)**
5. Check:
   - ✅ **Android SDK Platform 31** (or 30)
   - ✅ **Google APIs Intel x86_64 System Image**
6. Click **Apply** (downloads ~5-10 minutes)

### Step 3: Create New Stable AVD
1. **Tools > Device Manager > Create Device**
2. Choose **Pixel 5** or **Pixel 4a**
3. Select **API 31** or **API 30** (x86_64, Google APIs)
4. Configure:
   - Graphics: **Hardware - GLES 2.0**
   - RAM: **2048 MB**
5. Click **Finish**
6. Start the new AVD - it should work!

## 🎯 RECOMMENDED: Use Physical Device

**Why?**
- ✅ No crashes
- ✅ Faster than emulator
- ✅ Real device testing
- ✅ Works immediately
- ✅ Better performance

**Steps are simple:**
1. Enable USB Debugging (2 minutes)
2. Connect phone (30 seconds)
3. Run app (1 click)

## 📋 Quick Checklist

**If using Physical Device:**
- [ ] Enable Developer Options on phone
- [ ] Enable USB Debugging
- [ ] Connect phone via USB
- [ ] Select phone in Android Studio
- [ ] Click Run

**If using Emulator:**
- [ ] Delete all API 36 AVDs
- [ ] Install API 30/31 system image
- [ ] Create new AVD with stable API
- [ ] Run app

## 🚀 Next Steps

**Right now:** Use a physical device - it's the fastest solution!

Your web app is already running at http://localhost:3000
Now let's get the Android app running on your phone!















