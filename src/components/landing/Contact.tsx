import { useState } from 'react'
import { Phone, Mail, Check, ArrowRight, AlertCircle, X } from 'lucide-react'
import { ButtonLoader } from '../shared/InlineLoader'
import { FadeUp } from './Animations'
import emailjs from '@emailjs/browser'
import { motion, AnimatePresence } from 'framer-motion'
import { HLYNK_SOCIALS } from '../../lib/socials'

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
                  Have a question about hlynk or need help setting up your account? Our team is ready to support your business growth.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-5 group">
                  <a
                    href={HLYNK_SOCIALS.whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/40 transition-all hover:scale-105"
                    aria-label="Chat on WhatsApp"
                  >
                    <Phone size={20} />
                  </a>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Call or WhatsApp</div>
                    <a
                      href={HLYNK_SOCIALS.whatsapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-black text-white hover:text-emerald-400 tracking-tight transition-colors"
                    >
                      {HLYNK_SOCIALS.whatsapp.displayNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <a
                    href={HLYNK_SOCIALS.email.url}
                    className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/40 transition-all hover:scale-105"
                    aria-label="Send email"
                  >
                    <Mail size={20} />
                  </a>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Email Us</div>
                    <a
                      href={HLYNK_SOCIALS.email.url}
                      className="text-lg font-black text-white hover:text-emerald-400 tracking-tight transition-colors"
                    >
                      {HLYNK_SOCIALS.email.address}
                    </a>
                  </div>
                </div>

                {/* Social media connections */}
                <div className="pt-2">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Connect With Us</div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={HLYNK_SOCIALS.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs font-bold transition-all hover:scale-105"
                    >
                      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                      <span>Instagram</span>
                    </a>

                    <a
                      href={HLYNK_SOCIALS.tiktok.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs font-bold transition-all hover:scale-105"
                    >
                      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.93-4.49V8.55a8.28 8.28 0 0 0 4.84 1.57V6.69z" />
                      </svg>
                      <span>TikTok</span>
                    </a>

                    <a
                      href={HLYNK_SOCIALS.whatsapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs font-bold transition-all hover:scale-105"
                    >
                      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>
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
                    {loading ? <ButtonLoader size={16} /> : 'Send message'}
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