import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.3ddde744d4c5403da1791a35102805bc",
  appName: "Guides Directly",
  webDir: "dist",
  server: {
    url: "https://3ddde744-d4c5-403d-a179-1a35102805bc.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#e8edf3",
      showSpinner: false,
    },
  },
};

export default config;
