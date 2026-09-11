import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 glass-modal"
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`relative w-full max-w-lg glass-sheet pt-5 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] border-b border-white/30">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'Ubuntu' }}>{title}</h3>
          <button 
            onClick={onClose}
            className="glass-btn p-2 rounded-xl transition-all text-gray-500 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isOpen && children}
        </div>
      </div>
    </div>
  );
}
