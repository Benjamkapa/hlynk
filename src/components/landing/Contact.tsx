import { useState } from 'react'
import { Phone, Mail, Check, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react'
import { FadeUp } from './Animations'
import emailjs from '@emailjs/browser'
import { motion, AnimatePresence } from 'framer-motion'

export default function Contact() {
  const [form, setForm] = useState({ name: "", contact: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // NOTE: Configure these from your EmailJS Dashboard (https://dashboard.emailjs.com/)
  const EMAILJS_SERVICE_ID = "service_clo9cr9"
  const EMAILJS_TEMPLATE_ID = "template_ml6oqfd"
  const EMAILJS_PUBLIC_KEY = "cdOVwZZzAEa5Lfeq9"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const templateParams = {
        user_name: form.name,
        user_email: form.contact,
        user_message: form.message,
        to_email: "info@hlynk.co.ke", // Ensuring the recipient is never empty
      };

      const res = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      // console.log("EmailJS Success:", res)
      setSent(true)
      setForm({ name: "", contact: "", message: "" })
    } catch (err: any) {
      console.error("EmailJS Full Error Object:", err)
      setError(err?.text || "Failed to send message. Please check your credentials.")
      setTimeout(() => setError(null), 8000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-24 bg-[#14181A] relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#064E3B]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7C93B0]/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">

          <FadeUp>
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-[#064E3B] uppercase tracking-[0.2em] block">Get in Touch</span>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.9] font-ubuntu">
                  Need help?<br />
                  <span className="text-[#064E3B] font-ubuntu">We're here.</span>
                </h2>
                <p className="text-lg text-white/45 font-medium leading-relaxed max-w-md">
                  Have a question about Hlynk or need help setting up your account? Our team is ready to support your business growth.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-5 group">
                  <div className="h-13 w-13 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Call or WhatsApp</div>
                    <div className="text-lg font-black text-white tracking-tight">+254 790 590 653</div>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="h-13 w-13 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Email Us</div>
                    <div className="text-lg font-black text-white tracking-tight">info@hlynk.co.ke</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="bg-[#1B212B] p-8 md:p-10 rounded-[28px] border border-white/5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-400"
                  >
                    <AlertCircle size={20} className="shrink-0" />
                    <div className="flex-1 text-xs font-bold leading-relaxed">
                      {error}
                    </div>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {sent ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-16 h-16 bg-[#7FB89C] rounded-full flex items-center justify-center mx-auto text-[#14181A]">
                    <Check size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight font-ubuntu">Message sent!</h3>
                    <p className="text-white/45 font-medium">We'll get back to you within 24 hours.</p>
                  </div>
                  <button
                    onClick={() => setSent(false)}
                    className="text-[#064E3B] text-xs font-black uppercase tracking-widest hover:opacity-80 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Okombe Mabenjo"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-[#064E3B]/50 rounded-2xl py-3.5 px-5 text-white text-sm outline-none transition-all font-bold placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Contact Info</label>
                    <input
                      type="text"
                      required
                      placeholder="Email"
                      value={form.contact}
                      onChange={e => setForm({ ...form, contact: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-[#064E3B]/50 rounded-2xl py-3.5 px-5 text-white text-sm outline-none transition-all font-bold placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">How can we help?</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your business..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-[#064E3B]/50 rounded-2xl py-3.5 px-5 text-white text-sm outline-none transition-all font-bold placeholder:text-white/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#064E3B] text-[#14181A] rounded-full font-bold text-sm hover:opacity-85 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send message'}
                    {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
              )}
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  )
}