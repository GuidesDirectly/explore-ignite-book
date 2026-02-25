import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, Smartphone, Monitor, Share2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Get the App
          </h1>
          <p className="text-muted-foreground">
            Install Guides Directly on your device for the fastest, app-like experience — no app store needed.
          </p>
        </div>

        {installed ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-2">
            <Check className="w-8 h-8 text-green-600 mx-auto" />
            <p className="font-semibold text-green-800">App Installed!</p>
            <p className="text-sm text-green-700">Open it from your home screen.</p>
          </div>
        ) : isIOS ? (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-left">
            <p className="font-semibold text-foreground text-center">Install on iPhone / iPad</p>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Tap the <Share2 className="inline w-4 h-4" /> Share button in Safari</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Tap <strong>"Add"</strong> in the top right</span>
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full gap-2 text-lg py-6">
            <Download className="w-5 h-5" />
            Install App
          </Button>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <Monitor className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Open this page on your mobile device's browser to install the app, or use your browser menu to "Install" or "Add to Home Screen".
            </p>
          </div>
        )}

        <div className="pt-4 space-y-2">
          <p className="text-xs text-muted-foreground">✓ Works offline · ✓ No storage used · ✓ Always up to date</p>
          <a href="/" className="text-sm text-primary hover:underline">← Back to website</a>
        </div>
      </div>
    </div>
  );
};

export default Install;
