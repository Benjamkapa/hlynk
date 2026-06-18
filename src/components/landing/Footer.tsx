import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="py-20 bg-transparent border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/hlynk.png" alt="hlynk" className="h-10 w-auto brightness-0 invert" />
            <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '400', margin: '4px' }}>lynk</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-8 md:gap-12">
            {['About', 'Features', 'Pricing', 'Contact'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-emerald-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="text-[13px] font-black font-thin tracking-[0.2em] text-white">
              © {new Date().getFullYear()} hlynk Portal
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
