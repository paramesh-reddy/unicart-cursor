import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unicart.app',
  appName: 'UniCart',
  webDir: '.next',
  server: {
    // For production: Point to your Vercel deployment URL
    // Replace 'your-app.vercel.app' with your actual Vercel URL
    // For development: Comment out server config and use local dev server
     url: 'https://unicart-cursor-pro.vercel.app',
    cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3B82F6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    App: {
      textZoom: 100,
    },
  },
};

export default config;
