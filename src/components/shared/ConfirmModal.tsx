import { AlertTriangle, X } from 'lucide-react'

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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCancel} />
      
      <div className="relative bg-white rounded-[.5em] p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={handleCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all disabled:opacity-50"
        >
          <X size={16} />
        </button>

        <div className={`h-16 w-16 rounded-[.5em] flex items-center justify-center mb-6 shadow-inner ${isDestructive ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
          <AlertTriangle size={32} />
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-[.5em] font-black text-xs uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              handleCancel()
            }}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-[.5em] font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all disabled:opacity-50 ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' 
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
            }`}
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
