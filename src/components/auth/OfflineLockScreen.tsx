import { useState, useEffect, useCallback } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Delete, WifiOff, LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { hasOfflinePin } from '../../lib/offline/offlinePin'

const PIN_LENGTH = 6

export default function OfflineLockScreen() {
  const { user, unlock, logout } = useAuth()
  const [pin, setPin] = useState('')
  const [shaking, setShaking] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')
  const [showForceLogout, setShowForceLogout] = useState(false)
  const [confirmForceLogout, setConfirmForceLogout] = useState(false)
  const noPinSet = !hasOfflinePin()

  // Auto-verify when PIN is fully entered
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      verifyPin()
    }
  }, [pin])

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') appendDigit(e.key)
      else if (e.key === 'Backspace') deleteDigit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pin])

  const appendDigit = useCallback((d: string) => {
    if (pin.length >= PIN_LENGTH || status === 'checking') return
    setPin(p => p + d)
    setStatus('idle')
  }, [pin.length, status])

  const deleteDigit = useCallback(() => {
    setPin(p => p.slice(0, -1))
    setStatus('idle')
  }, [])

  const verifyPin = async () => {
    setStatus('checking')
    const ok = await unlock(pin)
    if (ok) return // AuthContext unlocks automatically

    // Wrong PIN
    setStatus('error')
    setShaking(true)
    setTimeout(() => {
      setShaking(false)
      setPin('')
      setStatus('idle')
    }, 600)

    const newAttempts = wrongAttempts + 1
    setWrongAttempts(newAttempts)
    if (newAttempts >= 3) setShowForceLogout(true)
  }

  const handleForceLogout = async () => {
    await logout({ force: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #0a2e25 0%, #0d3d2e 40%, #071e18 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Subtle animated background blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', top: -100, left: -100,
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300,
        borderRadius: '50%', bottom: -80, right: -80,
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Offline badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 100, padding: '6px 14px',
          marginBottom: 32, fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <WifiOff size={12} />
        Offline Mode
      </motion.div>

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, color: 'white',
          marginBottom: 16,
          boxShadow: '0 0 0 4px rgba(16,185,129,0.2), 0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        {user?.photoUrl || user?.avatar
          ? <img src={user.photoUrl || user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          : initials
        }
      </motion.div>

      {/* Name & business */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ textAlign: 'center', marginBottom: 8 }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 4 }}>
          {user?.name || 'User'}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
          {user?.businessName}
        </div>
      </motion.div>

      {/* Lock icon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ marginBottom: 28, color: 'rgba(255,255,255,0.25)' }}
      >
        <Lock size={16} />
      </motion.div>

      {/* No PIN set message */}
      {noPinSet ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            maxWidth: 300, textAlign: 'center',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 16, padding: '20px 24px',
            marginBottom: 24,
          }}
        >
          <AlertTriangle size={20} style={{ color: '#f59e0b', margin: '0 auto 10px' }} />
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            You don't have an offline PIN set up.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6 }}>
            Connect to the internet to log back in, then set up an offline PIN from Settings to avoid this next time.
          </p>
        </motion.div>
      ) : (
        <>
          {/* PIN dots */}
          <motion.div
            animate={shaking ? {
              x: [-8, 8, -8, 8, -4, 4, 0],
              transition: { duration: 0.5, ease: 'easeInOut' }
            } : {}}
            style={{ display: 'flex', gap: 12, marginBottom: 32 }}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: pin.length > i ? 1.15 : 1,
                  background: status === 'error' && pin.length === 0
                    ? 'rgba(239,68,68,0.6)'
                    : pin.length > i
                      ? '#10b981'
                      : 'rgba(255,255,255,0.15)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  color: '#f87171', fontSize: 12, marginBottom: 16,
                  fontWeight: 500, textAlign: 'center',
                }}
              >
                Incorrect PIN. {wrongAttempts >= 3 ? 'Too many attempts.' : `${3 - wrongAttempts} attempt${wrongAttempts === 2 ? '' : 's'} left.`}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Number pad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10, width: '100%', maxWidth: 260, marginBottom: 28,
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <PinButton key={n} label={String(n)} onClick={() => appendDigit(String(n))} />
            ))}
            {/* Empty left cell */}
            <div />
            <PinButton label="0" onClick={() => appendDigit('0')} />
            <PinButton
              label={<Delete size={18} />}
              onClick={deleteDigit}
              style={{ color: 'rgba(255,255,255,0.5)' }}
            />
          </motion.div>
        </>
      )}

      {/* Force logout section */}
      <AnimatePresence>
        {(showForceLogout || noPinSet) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center' }}
          >
            {!confirmForceLogout ? (
              <button
                onClick={() => setConfirmForceLogout(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                  color: 'rgba(239,68,68,0.7)', fontSize: 12, fontWeight: 500,
                  margin: '0 auto', transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)')}
              >
                <LogOut size={13} />
                Log out completely
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, maxWidth: 240, lineHeight: 1.6 }}>
                  ⚠️ You'll need internet to log back in. Continue?
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setConfirmForceLogout(false)}
                    style={{
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForceLogout}
                    style={{
                      background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                      borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                      color: '#f87171', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    Yes, log me out
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PinButton({
  label,
  onClick,
  style: extraStyle = {},
}: {
  label: ReactNode
  onClick: () => void
  style?: CSSProperties
}) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', aspectRatio: '1',
        background: pressed ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14, cursor: 'pointer',
        fontSize: 20, fontWeight: 500, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, transform 0.1s',
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        userSelect: 'none',
        fontFamily: 'inherit',
        ...extraStyle,
      }}
    >
      {label}
    </button>
  )
}
