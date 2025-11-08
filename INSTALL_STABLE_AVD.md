# 🚨 CRITICAL: You Only Have API 36 Installed!

## Problem Found
✅ **I've fixed your AVD configurations** (GPU mode, fast boot)  
❌ **But you only have API 36 system images installed**  
❌ **API 36 is unstable and causing crashes**

## ✅ SOLUTION: Install Stable System Image (API 30 or 31)

### Step-by-Step Instructions:

#### Step 1: Open Android Studio SDK Manager
1. Open **Android Studio**
2. Go to **Tools > SDK Manager**
   - Or click the **SDK Manager icon** in the toolbar

#### Step 2: Install Stable System Image
1. Click **SDK Platforms** tab
2. Check **Show Package Details** (bottom right corner)
3. Find **Android 12.0 (S)** or **Android 11.0 (R)**
4. Expand it by clicking the arrow
5. Check these boxes:
   - ✅ **Android SDK Platform 31** (or 30 for Android 11)
   - ✅ **Google APIs Intel x86_64 System Image** (IMPORTANT - must be x86_64, not arm64)
6. Click **Apply** button
7. Accept licenses and wait for download (may take 5-10 minutes)

#### Step 3: Delete Old AVDs
1. Go to **Tools > Device Manager**
2. Delete **Pixel_5**, **Pixel_6**, and **Medium_Phone**:
   - Click dropdown (▼) → **Delete**

#### Step 4: Create New Stable AVD
1. Click **Create Device** (or **+** button)
2. **Select Hardware:**
   - Choose **Pixel 5** or **Pixel 4a**
   - Click **Next**
3. **Select System Image:**
   - You should now see **API 31** or **API 30** in the list
   - Select it
   - Make sure it shows **x86_64** (NOT arm64)
   - Select **Google APIs** (NOT Google Play)
   - Click **Next**
4. **AVD Configuration:**
   - **Name:** Pixel_5_Stable
   - **Graphics:** Hardware - GLES 2.0
   - **RAM:** 2048 MB
   - Click **Finish**
5. **Start the AVD:**
   - Click **Play button (▶️)**
   - Wait for it to start (first time: 2-3 minutes)

## 🎯 Alternative: Use Physical Device (FASTER)

If you have an Android phone, this is the **fastest and most reliable** solution:

### Quick Setup:
1. **On Phone:**
   - Settings > About Phone > Tap Build Number 7 times
   - Settings > Developer Options > Enable USB Debugging
2. **Connect via USB**
3. **Run:**
   ```bash
   npm run cap:android
   ```
4. **In Android Studio:** Select your phone and click Run

## 📋 What You Need to Do

**RIGHT NOW:**
1. Open Android Studio
2. Tools > SDK Manager
3. SDK Platforms tab > Show Package Details
4. Install **API 31** or **API 30** with **x86_64 Google APIs System Image**
5. Create new AVD with the stable API

**This will solve the emulator crashes permanently!**

## ✅ Already Fixed (By Me)
- GPU mode: Changed to software rendering
- Fast boot: Disabled
- But API 36 is still the root cause - you need to install API 30/31

## 🆘 Need Help?
The system image download is the key step. Once you have API 30 or 31 installed, creating a stable AVD is easy!

