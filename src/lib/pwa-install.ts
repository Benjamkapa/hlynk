import { useState, useEffect } from 'react';

declare global {
  interface Window {
    __deferredPrompt?: any;
  }
}

let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  if (window.__deferredPrompt) {
    deferredPrompt = window.__deferredPrompt;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa:can-install'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa:installed'));
  });
}

export function onBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  deferredPrompt = e;
  if (typeof window !== 'undefined') {
    window.__deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa:can-install'));
  }
}

export async function promptInstall(): Promise<boolean> {
  const promptEvt = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);
  if (!promptEvt) return false;

  try {
    promptEvt.prompt();
    const { outcome } = await promptEvt.userChoice;
    deferredPrompt = null;
    if (typeof window !== 'undefined') {
      window.__deferredPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa:installed'));
    }
    return outcome === 'accepted';
  } catch (err) {
    console.error('[PWA] Failed to prompt install:', err);
    return false;
  }
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(deferredPrompt || window.__deferredPrompt);
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [standalone, setStandalone] = useState<boolean>(() => isStandalone());
  const [isIosDevice, setIsIosDevice] = useState<boolean>(() => isIOS());

  useEffect(() => {
    setStandalone(isStandalone());
    setIsIosDevice(isIOS());

    if (deferredPrompt || (typeof window !== 'undefined' && window.__deferredPrompt)) {
      setCanInstall(true);
    }

    const handleCanInstall = () => setCanInstall(true);
    const handleInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hlynk_pwa_installed', 'true');
      }
    };

    window.addEventListener('pwa:can-install', handleCanInstall);
    window.addEventListener('pwa:installed', handleInstalled);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwa:can-install', handleCanInstall);
      window.removeEventListener('pwa:installed', handleInstalled);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  return {
    canInstall,
    isInstalled,
    isStandalone: standalone,
    isIOS: isIosDevice,
    promptInstall,
  };
}

