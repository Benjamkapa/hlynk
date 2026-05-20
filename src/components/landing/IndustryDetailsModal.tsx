import React from 'react'
import { X, CheckCircle2, Zap, ArrowRight, ShieldCheck, Rocket } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface IndustryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  category: {
    icon: React.ReactNode
    label: string
    description: string
    features: string[]
    onboarding: string[]
    integration: string
  } | null
}

export default function IndustryDetailsModal({ isOpen, onClose, category }: IndustryDetailsModalProps) {
  if (!category) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#070B0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative p-8 md:p-10 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg shadow-white/5">
                  {React.cloneElement(category.icon as React.ReactElement, { size: 32 })}
                </div>
                <div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1 block">Industry Spotlight</span>
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{category.label}</h3>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar space-y-12">
              
              {/* Value Proposition */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/40">
                  <Zap size={18} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Digital records for your business</h4>
                </div>
                <p className="text-white/60 leading-relaxed text-lg font-medium">
                  {category.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {category.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-white/20 transition-all">
                      <div className="mt-1 text-emerald-500">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-sm font-bold text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Integration / Value */}
              <section className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-white/40">
                  <ShieldCheck size={18} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Why choose hlynk?</h4>
                </div>
                <p className="text-white/80 leading-relaxed font-bold italic">
                  "{category.integration}"
                </p>
              </section>

              {/* Onboarding Steps */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-white/40">
                  <Rocket size={18} />
                  <h4 className="text-sm font-black uppercase tracking-widest">Get Started in 3 Steps</h4>
                </div>
                <div className="space-y-4">
                  {category.onboarding.map((step, i) => (
                    <div key={i} className="flex items-center gap-6 group">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                        {i + 1}
                      </div>
                      <p className="text-white/70 font-bold group-hover:text-white transition-colors capitalize">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Footer Action */}
            <div className="p-8 border-t border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-white/40 text-xs font-bold text-center md:text-left">
                Ready to take your business to the next level? Join other smart business owners today.
              </p>
              <button 
                onClick={() => window.location.href = '/register'}
                className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all shadow-xl flex items-center justify-center gap-3 group"
              >
                Onboard Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
