# 🚀 How to Run Your UniCart Project

## Option 1: Run Web App (Development Server)

### Step 1: Install Dependencies (if not done)
```bash
npm install
```

### Step 2: Setup Database (if needed)
```bash
# Generate Prisma client
npm run db:generate

# Push database schema (if database is set up)
npm run db:push
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
- Open: **http://localhost:3000**
- Your app should be running!

## Option 2: Run Android App

### Step 1: Build Web App First
```bash
npm run build
```

### Step 2: Sync to Native Projects
```bash
npm run cap:sync
```

### Step 3: Open in Android Studio
```bash
npm run cap:android
```

### Step 4: Run in Android Studio
1. Wait for Android Studio to open and sync
2. Select your device (physical phone or stable AVD)
3. Click **Run (▶️)** button

## Option 3: Build for Production

### Web App
```bash
npm run build
npm start
```

### Android APK
```bash
npm run build:android
```

## Quick Start Commands

| What You Want | Command |
|--------------|---------|
| **Run Web App** | `npm run dev` |
| **Open Android Studio** | `npm run cap:android` |
| **Build for Mobile** | `npm run build:mobile` |
| **Sync Code to Native** | `npm run cap:sync` |

## Common Issues

### If dependencies are missing:
```bash
npm install
```

### If database errors:
```bash
npm run db:generate
npm run db:push
```

### If Android build fails:
- Make sure you have stable AVD (API 30/31) or physical device
- Run `npm run cap:sync` first

