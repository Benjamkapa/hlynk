import React from 'react'

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number

const sizePresetMap: Record<string, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
}

function resolveSize(size: LoaderSize = 'md'): number {
  if (typeof size === 'number') return size
  return sizePresetMap[size] || 24
}

interface InlineLoaderProps {
  /** Optional loading message shown below the spinner */
  message?: string
  /** Additional CSS class names */
  className?: string
  /** Spinner size preset or pixel number */
  size?: LoaderSize
  /** Custom color class (e.g. "text-emerald-600"). Defaults to "text-emerald-600" */
  color?: string
}

export default function InlineLoader({
  message,
  className = '',
  size = 'md',
  color = 'text-emerald-600',
}: InlineLoaderProps) {
  const wh = resolveSize(size)

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`hl-ios-spinner ${color}`}
        style={{ width: wh, height: wh }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="hl-ios-spinner-bar"
            style={{
              transform: `rotate(${i * 30}deg) translateY(-130%)`,
              animationDelay: `-${1.2 - i * 0.1}s`,
            }}
          />
        ))}
      </div>
      {message && (
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * Tiny inline spinner for use inside buttons and tight spaces.
 * Drop-in replacement for <Loader2 className="animate-spin" />.
 */
export function ButtonLoader({
  className = '',
  color = 'currentColor',
  size = 'xs',
}: {
  className?: string
  color?: string
  size?: LoaderSize
}) {
  const wh = resolveSize(size)

  return (
    <span
      className={`hl-ios-spinner inline-flex ${className}`}
      style={{ width: wh, height: wh, color }}
    >
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="hl-ios-spinner-bar"
          style={{
            transform: `rotate(${i * 30}deg) translateY(-130%)`,
            animationDelay: `-${1.2 - i * 0.1}s`,
          }}
        />
      ))}
    </span>
  )
}
