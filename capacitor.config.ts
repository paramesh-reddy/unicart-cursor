import { CapacitorConfig } from '@capacitor/cli'

const serverUrl = process.env.CAP_SERVER_URL

const isHttp = serverUrl?.startsWith('http://') ?? false

const config: CapacitorConfig = {
  appId: 'com.unicart.app',
  appName: 'UniCart',
  webDir: '.next',
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: isHttp,
        androidScheme: isHttp ? 'http' : 'https',
        iosScheme: isHttp ? 'http' : 'https'
      }
    : {
        // Default to production deployment URL when no override is provided
        url: 'https://unicart-cursor.vercel.app',
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
