# Android Emulator Fix Guide - Comprehensive Solutions

## Problem
The emulator process for AVD Pixel_5/Pixel_6 keeps terminating.

## Root Causes & Solutions

### 1. Hardware Acceleration Not Enabled
**Check:**
- Open Android Studio
- Go to **Tools > SDK Manager > SDK Tools**
- Check if **Android Emulator** is installed
- Check if **Intel x86 Emulator Accelerator (HAXM)** or **Hypervisor Driver** is installed

**Fix:**
- Install missing components
- Restart Android Studio
- Restart computer

### 2. BIOS Virtualization Disabled
**Check:**
- Restart your computer
- Enter BIOS/UEFI settings (usually F2, F10, F12, or Del during boot)
- Look for "Virtualization Technology" or "Intel VT-x" or "AMD-V"
- Ensure it's **Enabled**

**Fix:**
- Enable virtualization in BIOS
- Save and exit
- Restart computer

### 3. Windows Hyper-V Conflict
**Check if Hyper-V is enabled:**
```powershell
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V
```

**If Hyper-V is enabled:**
- Android Emulator may conflict with Hyper-V
- **Solution:** Use Windows Hypervisor Platform instead
  - Go to **Control Panel > Programs > Turn Windows features on or off**
  - Enable **Windows Hypervisor Platform**
  - Disable **Hyper-V** (if not needed)
  - Restart computer

### 4. Insufficient Resources
**Check:**
- Close other heavy applications
- Ensure at least **8GB RAM** free
- Ensure at least **10GB disk space** free

**Fix:**
- Close unnecessary applications
- Free up disk space
- Restart computer

### 5. AVD Configuration Issues
**Create a new AVD with minimal settings:**

1. Open Android Studio
2. **Tools > Device Manager**
3. **Create Device**
4. Choose **Pixel 5** or **Pixel 6**
5. Select **System Image:**
   - Choose **API 30 (Android 11)** or **API 31 (Android 12)** 
   - **IMPORTANT:** Select **x86_64** architecture (not arm64)
   - Choose **Release Name** with **Google APIs** (not Google Play)
6. Click **Next**
7. **AVD Configuration:**
   - Graphics: **Hardware - GLES 2.0**
   - RAM: **2048 MB** (reduce if needed)
   - VM heap: **512 MB**
   - Internal Storage: **2048 MB**
8. Click **Finish**

### 6. Use Physical Device (BEST SOLUTION)
**This is often faster and more reliable:**

1. **Enable Developer Options on Android phone:**
   - Settings > About Phone
   - Tap **Build Number** 7 times
   
2. **Enable USB Debugging:**
   - Settings > Developer Options
   - Enable **USB Debugging**
   - Enable **Install via USB** (optional)

3. **Connect Phone:**
   - Connect via USB cable
   - Allow USB debugging when prompted on phone

4. **Verify Connection:**
   ```bash
   # Check if device is detected
   adb devices
   ```

5. **Run the app:**
   ```bash
   npm run cap:android
   ```
   Then open in Android Studio and select your physical device

### 7. Alternative: Use Android Studio Emulator from Command Line
**Try running emulator directly:**
```bash
# Find emulator path (usually in Android SDK)
cd %LOCALAPPDATA%\Android\Sdk\emulator
.\emulator -list-avds
.\emulator -avd Pixel_5 -verbose
```

Check the verbose output for specific errors.

### 8. Check Windows Event Viewer
**Look for specific errors:**
1. Press **Win + X**
2. Select **Event Viewer**
3. Check **Windows Logs > Application**
4. Look for errors related to emulator or virtualization

### 9. Try Different AVD
**Create a minimal AVD:**
- Device: **Pixel 3** (smaller, less resource-intensive)
- System Image: **API 30 x86_64**
- RAM: **1536 MB**
- Graphics: **Hardware - GLES 2.0**

### 10. Reinstall Android Emulator
**In Android Studio:**
1. **Tools > SDK Manager**
2. **SDK Tools** tab
3. Uncheck **Android Emulator**
4. Click **Apply** (uninstall)
5. Check **Android Emulator** again
6. Click **Apply** (reinstall)
7. Restart Android Studio

## Quick Diagnostic Commands

```powershell
# Check if virtualization is enabled (Windows)
systeminfo | findstr /C:"Hyper-V"

# Check Android SDK location
echo $env:ANDROID_HOME
echo $env:LOCALAPPDATA\Android\Sdk

# List available AVDs
%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -list-avds

# Check connected devices
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe devices
```

## Recommended Solution
**Use a physical Android device** - it's faster, more reliable, and gives you a better development experience. The emulator is useful but not essential for development.

