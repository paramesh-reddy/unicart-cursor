import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.unicart.app',
  appName: 'UniCart',
  webDir: '.next',
  server: {
    url: 'https://unicart-frontend3.vercel.app/',
    cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https'
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
