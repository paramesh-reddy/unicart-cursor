# Fix Android Emulator Error

## Quick Fix Steps:

### Option 1: Delete and Recreate AVD (Recommended)
1. Open Android Studio
2. Go to **Tools > Device Manager** (or **Tools > AVD Manager** in older versions)
3. Find "Pixel_6" AVD
4. Click the **dropdown arrow** (▼) next to it
5. Select **Delete**
6. Click **Create Device**
7. Select **Pixel 6** (or any device)
8. Choose a system image (recommended: **API 33 or 34** with Google Play)
9. Click **Next** > **Finish**

### Option 2: Cold Boot the AVD
1. In AVD Manager, click the dropdown arrow next to Pixel_6
2. Select **Cold Boot Now**
3. This resets the emulator state

### Option 3: Check Hardware Acceleration
1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. Click **SDK Tools** tab
4. Check if **Android Emulator** is installed
5. Check if **Intel x86 Emulator Accelerator (HAXM installer)** is installed (for Intel CPUs)
   - Or **Hypervisor Driver** for Windows Hyper-V

### Option 4: Use a Physical Device Instead
1. Enable **Developer Options** on your Android phone
2. Enable **USB Debugging**
3. Connect via USB
4. Run: `npm run cap:android` or open in Android Studio

### Option 5: Check System Requirements
- Ensure you have at least **8GB RAM** free
- Ensure **VT-x/AMD-V** is enabled in BIOS (for virtualization)
- Close other heavy applications

### Option 6: Try Different AVD
Create a new AVD with:
- **Lower API level** (API 30 or 31 instead of 33/34)
- **x86_64 architecture** (not arm64)
- **Less RAM allocation** (2GB instead of 4GB)

