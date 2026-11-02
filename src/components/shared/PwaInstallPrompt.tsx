import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { usePwaInstall } from '../../lib/pwa-install';

export default function PwaInstallPrompt() {
  const { user } = useAuth();
  const location = useLocation();
  const { canInstall, isInstalled, isStandalone, isIOS, promptInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (
      sessionStorage.getItem('hlynk_pwa_dismissed') === 'true' ||
      sessionStorage.getItem('hlynk_pwa_installed') === 'true'
    );
  });
  const [installing, setInstalling] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      setIsDismissed(true);
    }
  }, [isInstalled]);

  // Restrict prompt: ONLY show after user is signed in AND inside the portal (/dashboard or /admin).
  // Strictly excluded: landing page (/), auth pages (/login, /register, etc.), and stay/storefront pages (/stay, /shop).
  const isPortalRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const isExcludedRoute =
    location.pathname === '/' ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/verify') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/stay') ||
    location.pathname.startsWith('/shop') ||
    location.pathname.startsWith('/store') ||
    location.pathname.startsWith('/privacy-policy') ||
    location.pathname.startsWith('/terms-conditions') ||
    location.pathname.startsWith('/google') ||
    location.pathname.startsWith('/partners');

  if (!user || !isPortalRoute || isExcludedRoute) {
    return null;
  }

  // If running standalone, already installed, dismissed, or browser can't install, render nothing
  if (isStandalone || isInstalled || isDismissed || (!canInstall && !isIOS)) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosSteps(prev => !prev);
      return;
    }

    setInstalling(true);
    try {
      const accepted = await promptInstall();
      if (accepted) {
        setIsDismissed(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hlynk_pwa_dismissed', 'true');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[999] w-[calc(100vw-2rem)] sm:w-[310px] bg-[#0f1013]/95 backdrop-blur-md text-white rounded-sm shadow-xl p-3 shadow-2xl"
        role="region"
        aria-label="Install App"
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/fav.png"
            alt="hlynk"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 p-0.5 "
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-[13px] font-semibold text-white tracking-tight leading-tight">
              Install hlynk
            </h4>
            <p className="text-[11px] text-[#8e929a] font-normal leading-tight mt-0.5 truncate">
              Install for quick access and offline support
            </p>
          </div>
        </div>

        {showIosSteps && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2.5 pt-2.5 border-t border-white/10 text-[11px] text-[#b5b8c0] space-y-1.5"
          >
            <p className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center shrink-0 text-white">1</span>
              <span>Tap the <strong className="text-white">Share</strong> button in Safari ⬆️</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center shrink-0 text-white">2</span>
              <span>Scroll down & select <strong className="text-white">Add to Home Screen</strong></span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center shrink-0 text-white">3</span>
              <span>Tap <strong className="text-white">Add</strong> in top right</span>
            </p>
          </motion.div>
        )}

        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-1.5 px-3 rounded-sm bg-[#1c1d22] hover:bg-[#262830] text-[#b5b8c0] font-normal text-xs transition-colors text-center active:scale-98"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="flex-1 py-1.5 px-3 rounded-sm bg-[#e8491d] hover:bg-[#d63f15] text-white font-normal text-xs transition-all shadow-sm flex items-center justify-center text-center active:scale-98 disabled:opacity-50"
          >
            {installing ? 'Installing...' : showIosSteps ? 'Got it' : 'Install'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * An inline button that can be embedded anywhere (e.g. in sidebar, settings, navbar)
 */
export function PwaInstallButton({
  className = '',
  label = 'Install App',
  iconOnly = false,
}: {
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const { canInstall, isInstalled, isStandalone, isIOS, promptInstall } = usePwaInstall();
  const [showIosModal, setShowIosModal] = useState(false);

  if (isStandalone || isInstalled) return null;

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIosModal(true)}
          className={className || "flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-all"}
          title="Install hlynk on iOS"
        >
          {!iconOnly && <span>{label}</span>}
        </button>

        {showIosModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f1013] text-white rounded-[20px] max-w-sm w-full p-5 shadow-2xl border border-[#22242a]">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-white">Install on iPhone / iPad</h4>
                <button
                  onClick={() => setShowIosModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-xs text-[#b5b8c0] bg-white/5 p-3 rounded-xl border border-white/5">
                <p>1. Tap the <strong>Share</strong> button in Safari ⬆️</p>
                <p>2. Scroll down & select <strong>Add to Home Screen</strong></p>
                <p>3. Tap <strong>Add</strong> in top right corner</p>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="mt-4 w-full py-2 bg-[#e8491d] hover:bg-[#d63f15] text-white rounded-full text-xs font-bold transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!canInstall) return null;

  return (
    <button
      onClick={() => promptInstall()}
      className={className || "flex items-center gap-2 text-xs font-bold text-white bg-[#e8491d] hover:bg-[#d63f15] px-3 py-2 rounded-xl transition-all shadow-sm"}
      title="Install App"
    >
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
