import React, { createContext, useContext, useState, useEffect } from 'react';

interface MobileViewportContextType {
  isZoomedOut: boolean;
  toggleZoom: () => void;
}

const MobileViewportContext = createContext<MobileViewportContextType | undefined>(undefined);

export function MobileViewportProvider({ children }: { children: React.ReactNode }) {
  const [isZoomedOut, setIsZoomedOut] = useState(() => {
    const saved = localStorage.getItem('hlynk_mobile_zoomed_out');
    // Default to normal (expanded) for mobile to ensure readability for non-tech users
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('hlynk_mobile_zoomed_out', isZoomedOut.toString());
    
    if (isZoomedOut) {
      document.documentElement.classList.add('mobile-compact');
      document.documentElement.classList.remove('mobile-expanded');
    } else {
      document.documentElement.classList.add('mobile-expanded');
      document.documentElement.classList.remove('mobile-compact');
    }
  }, [isZoomedOut]);

  const toggleZoom = () => setIsZoomedOut(prev => !prev);

  return (
    <MobileViewportContext.Provider value={{ isZoomedOut, toggleZoom }}>
      {children}
    </MobileViewportContext.Provider>
  );
}

export function useMobileViewport() {
  const context = useContext(MobileViewportContext);
  if (context === undefined) {
    throw new Error('useMobileViewport must be used within a MobileViewportProvider');
  }
  return context;
}
