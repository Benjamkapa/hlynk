import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X, Check, Delete } from 'lucide-react'
import { saveOfflinePin, markPinPrompted } from '../../lib/offline/offlinePin'
import { toast } from 'sonner'

interface Props {
  onDone: () => void
}

const PIN_LENGTH = 6

export default function PinSetupModal({ onDone }: Props) {
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [pin, setPin] = useState('')
  const [firstPin, setFirstPin] = useState('')
  const [mismatch, setMismatch] = useState(false)
  const [saving, setSaving] = useState(false)

  const appendDigit = (d: string) => {
    if (pin.length >= PIN_LENGTH) return
    const next = pin + d
    setPin(next)
    setMismatch(false)
    if (next.length === PIN_LENGTH) handleComplete(next)
  }

  const deleteDigit = () => setPin(p => p.slice(0, -1))

  const handleComplete = async (completed: string) => {
    if (step === 'create') {
      setFirstPin(completed)
      setTimeout(() => { setPin(''); setStep('confirm') }, 200)
    } else {
      if (completed !== firstPin) {
        setMismatch(true)
        setTimeout(() => { setPin(''); setMismatch(false) }, 700)
        return
      }
      setSaving(true)
      await saveOfflinePin(completed)
      setSaving(false)
      toast.success('Offline PIN saved! You can now access the app offline.')
      onDone()
    }
  }

  const handleSkip = () => {
    markPinPrompted()
    onDone()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'white', borderRadius: 24,
          padding: 32, maxWidth: 340, width: '100%',
          boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
          textAlign: 'center', position: 'relative',
        }}
      >
        {/* Close / skip */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: '#f1f5f9', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8',
          }}
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
        }}>
          <ShieldCheck size={24} color="white" />
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          Set an Offline PIN
        </h3>

        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24, minHeight: 40 }}
          >
            {step === 'create'
              ? 'Create a 6-digit PIN. You\'ll use this to unlock the app when you\'re offline.'
              : 'Re-enter your PIN to confirm.'}
          </motion.p>
        </AnimatePresence>

        {/* PIN dots */}
        <motion.div
          animate={mismatch ? {
            x: [-8, 8, -8, 8, 0],
            transition: { duration: 0.4 }
          } : {}}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: pin.length > i ? 1.2 : 1,
                background: mismatch
                  ? '#ef4444'
                  : pin.length > i
                    ? '#10b981'
                    : '#e2e8f0',
              }}
              transition={{ type: 'spring', stiffness: 500 }}
              style={{ width: 12, height: 12, borderRadius: '50%' }}
            />
          ))}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {mismatch && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: '#ef4444', fontSize: 12, marginBottom: 12, fontWeight: 500 }}
            >
              PINs don't match. Try again.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numpad */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, marginBottom: 20,
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <PadBtn key={n} label={String(n)} onClick={() => appendDigit(String(n))} />
          ))}
          <div />
          <PadBtn label="0" onClick={() => appendDigit('0')} />
          <PadBtn label={<Delete size={16} />} onClick={deleteDigit} muted />
        </div>

        {/* Skip */}
        <button
          onClick={handleSkip}
          style={{
            fontSize: 12, color: '#94a3b8', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Skip for now (not recommended)
        </button>
      </motion.div>
    </motion.div>
  )
}

function PadBtn({ label, onClick, muted = false }: { label: React.ReactNode; onClick: () => void; muted?: boolean }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        padding: '14px 0',
        background: pressed ? '#f1f5f9' : '#f8fafc',
        border: '1px solid #f1f5f9',
        borderRadius: 12, cursor: 'pointer',
        fontSize: 18, fontWeight: 500,
        color: muted ? '#94a3b8' : '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, transform 0.1s',
        transform: pressed ? 'scale(0.94)' : 'scale(1)',
        userSelect: 'none', fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}
