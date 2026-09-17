import { AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
  onClose?: () => void
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false
}: ConfirmModalProps) {
  const handleCancel = onCancel || onClose || (() => {})

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCancel}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-[1.25rem] p-6 max-w-sm w-full mx-auto shadow-2xl border border-slate-100 z-10"
          >
            <button 
              onClick={handleCancel}
              disabled={isLoading}
              className="absolute right-4 top-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all disabled:opacity-50"
            >
              <X size={16} />
            </button>

            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 ${isDestructive ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight">{title}</h3>
            <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  handleCancel()
                }}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all disabled:opacity-50 ${
                  isDestructive 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' 
                    : 'bg-[#0D4A3E] hover:bg-[#08362D] shadow-emerald-900/20'
                }`}
              >
                {isLoading ? 'Loading...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
