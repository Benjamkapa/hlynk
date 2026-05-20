import { useState } from 'react'
import { Phone, Mail, MessageSquare, Check, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react'
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
    <section id="contact" className="py-24 bg-transparent relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">

          <FadeUp>
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] block">Get in Touch</span>
                <h2 className="text-4xl md:text-6xl font-black font-thin text-white tracking-tighter leading-[0.9] font-ubuntu">
                  Need help?<br />
                  <span className="text-emerald-500 font-ubuntu">We're here.</span>
                </h2>
                <p className="text-lg text-emerald-100/50 font-medium leading-relaxed max-w-md">
                  Have a question about hlynk or need help setting up your account? Our team is ready to support your business growth.
                </p>
              </div>

              <div className="space-y-6 pt-8">
                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Phone size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Call or WhatsApp</div>
                    <div className="text-xl font-black text-white hl-mono tracking-tight font-thin">+254 790 590 653</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Mail size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Email Us</div>
                    <div className="text-xl font-black text-white hl-mono tracking-tight font-thin">info@hlynk.co.ke</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="bg-white/5 backdrop-blur-2xl p-10 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
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
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
                    <Check size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight font-ubuntu">Message Sent!</h3>
                    <p className="text-emerald-100/50 font-medium">We'll get back to you within 24 hours.</p>
                  </div>
                  <button
                    onClick={() => setSent(false)}
                    className="text-emerald-500 text-xs font-black uppercase tracking-widest hover:text-emerald-400 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Wanjiku"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 px-6 text-white text-sm outline-none transition-all font-bold placeholder:text-white/20"
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
                      className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 px-6 text-white text-sm outline-none transition-all font-bold placeholder:text-white/20"
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
                      className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 px-6 text-white text-sm outline-none transition-all font-bold placeholder:text-white/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Message'}
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
