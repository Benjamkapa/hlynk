import { Link } from 'react-router-dom'
import { HLYNK_SOCIALS } from '../../lib/socials'

export default function Footer() {
  return (
    <footer className="py-20 bg-transparent border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/hlynk.png" alt="hlynk" className="h-10 w-auto brightness-0 invert" />
            <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '400', marginBlock: '4px', marginRight: '4px' }}>lynk</span>
          </Link>

          {/* Socials */}
          <div className="flex items-center gap-3">
            <a
              href={HLYNK_SOCIALS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow hlynk on Instagram"
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all hover:scale-110 group"
              title="Instagram @hlynk_inc"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>

            <a
              href={HLYNK_SOCIALS.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow hlynk on TikTok"
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all hover:scale-110 group"
              title="TikTok @hlynk_inc"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.93-4.49V8.55a8.28 8.28 0 0 0 4.84 1.57V6.69z" />
              </svg>
            </a>

            <a
              href={HLYNK_SOCIALS.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with hlynk on WhatsApp"
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all hover:scale-110 group"
              title="WhatsApp: 0750954980"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="text-[13px] font-black font-thin tracking-[0.2em] text-white">
              © {new Date().getFullYear()} hlynk 
            </div>
            <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <Link to="/privacy-policy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link>
              <Link to="/google/privacy" className="hover:text-emerald-500 transition-colors">Google Privacy</Link>
              <Link to="/terms-conditions" className="hover:text-emerald-500 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
