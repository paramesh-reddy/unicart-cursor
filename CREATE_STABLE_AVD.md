# 🚀 Create Stable Android Emulator - Step by Step

## Problem
Pixel 5 is using **API 36** (Android 36) which is too new and unstable, causing crashes.

## Solution: Create New Stable AVD

### Step-by-Step Instructions:

1. **Delete the problematic Pixel_5 AVD:**
   - In Android Studio **Device Manager** (right panel)
   - Find **Pixel 5**
   - Click the **dropdown arrow (▼)** next to it
   - Select **Delete**
   - Confirm deletion

2. **Create New Stable AVD:**
   - In Device Manager, click **Create Device** (or the **+** button)
   
3. **Select Device:**
   - Choose **Pixel 5** or **Pixel 4a** (smaller, faster)
   - Click **Next**

4. **Select System Image (CRITICAL):**
   - **DO NOT** choose API 36 (too new)
   - Choose **API 31** (Android 12) or **API 30** (Android 11)
   - **IMPORTANT:** Select **x86_64** architecture (NOT arm64)
   - Choose **Google APIs** (not Google Play - it's lighter)
   - If you don't see it, click **Download** next to it
   - Click **Next**

5. **Configure AVD:**
   - **AVD Name:** Pixel_5_Stable (or any name)
   - **Graphics:** Hardware - GLES 2.0
   - **RAM:** 2048 MB (reduce if your PC has less RAM)
   - **VM heap:** 512 MB
   - **Internal Storage:** 2048 MB
   - **SD Card:** None (optional - saves space)
   - Click **Finish**

6. **Start the New AVD:**
   - In Device Manager, find your new AVD
   - Click the **Play button (▶️)** or **Cold Boot Now**
   - Wait for it to start (first time may take 2-3 minutes)

### Alternative: Try Medium Phone API 36.1

I see you have **"Medium Phone API 36.1"** in your Device Manager. Try that one:
- Click the **Play button (▶️)** next to it
- It might work better than Pixel 5

### Quick Checklist:

✅ **API Level:** 30 or 31 (NOT 36)
✅ **Architecture:** x86_64 (NOT arm64)  
✅ **Graphics:** Hardware - GLES 2.0
✅ **RAM:** 2048 MB (or less if needed)
✅ **System Image:** Google APIs (lighter than Google Play)

### If Still Crashing:

1. **Check BIOS Virtualization:**
   - Restart computer
   - Enter BIOS (F2, F10, F12, or Del)
   - Enable **Virtualization Technology** (VT-x or AMD-V)
   - Save and restart

2. **Use Physical Device (BEST):**
   - Enable USB Debugging on phone
   - Connect via USB
   - Select phone in Android Studio
   - Much faster and more reliable!

### Recommended: Use API 30 or 31

**Why API 30/31?**
- Stable and well-tested
- Good performance
- Compatible with most apps
- Less resource-intensive

**Why NOT API 36?**
- Too new, may have bugs
- Higher system requirements
- May not be fully optimized yet

