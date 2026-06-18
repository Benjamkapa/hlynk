import React from 'react'

export default function InlineLoader({ message = 'Loading...', className = '' }: { message?: string, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="hl-ios-spinner text-emerald-600">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="hl-ios-spinner-bar" 
            style={{ 
              transform: `rotate(${i * 30}deg) translateY(-130%)`, 
              animationDelay: `-${1.2 - i * 0.1}s` 
            }} 
          />
        ))}
      </div>
      {message && <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{message}</p>}
    </div>
  )
}
