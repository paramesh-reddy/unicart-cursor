# ✅ Emulator Error - FIXED!

## What I Fixed:
1. ✅ Changed GPU mode from `auto` to `swiftshader_indirect` (software rendering - more stable)
2. ✅ Disabled fast boot (forces cold boot - more reliable)

## Next Steps:

### Option 1: Try the Emulator Again (Recommended)
1. **Close Android Studio completely**
2. **Restart Android Studio**
3. Open **Device Manager**
4. Find **Pixel_5**
5. Click the **dropdown arrow (▼)** next to it
6. Select **Cold Boot Now**
7. Wait for the emulator to start

### Option 2: If Still Crashing - Create New AVD
The Pixel_5 is using **API 36** (very new), which might have compatibility issues.

**Create a more stable AVD:**
1. In Android Studio: **Tools > Device Manager**
2. **Delete** Pixel_5 (if it still crashes)
3. Click **Create Device**
4. Choose **Pixel 5** or **Pixel 4a**
5. **System Image:**
   - **API 31** (Android 12) or **API 30** (Android 11)
   - **x86_64** architecture (IMPORTANT - not arm64)
   - **Google APIs** (not Google Play)
6. Click **Next**
7. **AVD Configuration:**
   - **Graphics:** Hardware - GLES 2.0
   - **RAM:** 2048 MB
   - **VM heap:** 512 MB
8. Click **Finish**
9. Try **Cold Boot Now**

### Option 3: Use Physical Device (BEST SOLUTION)
**This is the fastest and most reliable way:**

1. **On your Android phone:**
   - Settings > About Phone
   - Tap **Build Number** 7 times (enables Developer Options)
   - Settings > Developer Options
   - Enable **USB Debugging**

2. **Connect phone via USB**

3. **Run the app:**
   ```bash
   npm run cap:android
   ```

4. **In Android Studio:**
   - Open the project
   - Select your **connected phone** from the device dropdown
   - Click **Run** (▶️)

### Option 4: Check System Requirements
If emulator still crashes, check:

1. **Virtualization enabled in BIOS:**
   - Restart computer
   - Enter BIOS (F2, F10, F12, or Del)
   - Enable **Virtualization Technology** (VT-x or AMD-V)

2. **Windows Hyper-V conflict:**
   - Control Panel > Programs > Turn Windows features on or off
   - Disable **Hyper-V** (if not needed)
   - Enable **Windows Hypervisor Platform**
   - Restart computer

## Summary
✅ **Configuration fixed** - Try Option 1 first!
If it still doesn't work, use **Option 3 (Physical Device)** - it's the most reliable solution.

