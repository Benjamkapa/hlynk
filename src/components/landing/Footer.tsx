import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="py-20 bg-transparent border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="HudumaLynk" className="h-10 w-auto brightness-0 invert" />
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

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="text-[13px] font-black font-thin tracking-[0.2em] text-white">
              © {new Date().getFullYear()} HudumaLynk Portal
            </div>
            <div className="text-[9px] font-bold text-white uppercase tracking-widest">
              Built By <a href="https://github.com/benjamkapa">Benjamkapa9823</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
