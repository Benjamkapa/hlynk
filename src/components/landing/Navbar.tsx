import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AlignRight, X } from 'lucide-react'

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const lastScroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      if (current <= 60) setNavVisible(true)
      else if (current > lastScroll.current + 4) setNavVisible(false)
      else if (current < lastScroll.current - 4) setNavVisible(true)
      lastScroll.current = current
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${navVisible ? "translate-y-0" : "-translate-y-full"} ${window.scrollY > 20 ? "top-4 bg-white/80 w-[95%] lg:w-3/5 mx-auto backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg shadow-black/5" : "top-0 bg-transparent w-full"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 md:h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="HudumaLynk" className="h-10 w-auto group-hover:scale-105 transition-transform" />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map(n => (
              <a
                key={n.label}
                href={n.href}
                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 transition-colors"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden lg:block text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors px-4">
              Sign In
            </Link>
            <Link
              to="/register"
              className="hidden lg:block px-6 py-3.5 bg-[#0D4A3E] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <AlignRight size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[200] bg-white transition-all duration-500 lg:hidden ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
              <img src="/logo.png" alt="HudumaLynk" className="h-10 w-auto" />
            </Link>
            <button onClick={() => setMenuOpen(false)} className="p-2 text-slate-900 hover:bg-slate-100 rounded-xl">
              <X size={32} />
            </button>
          </div>

          <nav className="flex flex-col gap-6">
            {navItems.map(n => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-black text-slate-900 tracking-tighter hover:text-emerald-600 transition-colors"
              >
                {n.label}
              </a>
            ))}
            <div className="h-px bg-slate-100 my-4" />
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-xl font-bold text-slate-500">Sign In</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full py-5 bg-[#0D4A3E] text-white rounded-xl font-black text-center uppercase tracking-widest shadow-xl shadow-emerald-900/20">
              Get Started Free
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}
