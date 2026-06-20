import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AlignRight, X } from 'lucide-react'

const navItems = [
  { label: "Who Uses", href: "#who" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const lastScroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY

      setScrolled(current > 60)

      if (current <= 60) {
        setNavVisible(true)                          // always show near top
      } else if (current > lastScroll.current + 6) {
        setNavVisible(false)                         // scrolling DOWN → hide
      } else if (current < lastScroll.current - 6) {
        setNavVisible(true)                          // scrolling UP   → show
      }

      lastScroll.current = current
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <style>{`
        .hl-nav-link {
          font-size: 1rem;
          font-weight: 400;
          text-transform: capitalize;
          letter-spacing: 0.12em;
          text-decoration: none;
          color: rgba(255,255,255,0.8);
          transition: color 0.2s;
          white-space: nowrap;
          position: relative;
        }
        .hl-nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -4px;
          left: 0;
          background-color: #059669;
          transition: width 0.3s ease-in-out;
        }
        .hl-nav-link:hover::after {
          width: 100%;
        }
        .hl-nav-link.scrolled { color: #475569; }
        .hl-nav-link.scrolled:hover { color: #059669; }

        .hl-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.4);
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: capitalize;
          letter-spacing: 0.1em;
          text-decoration: none;
          color: rgba(255,255,255,0.9);
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          white-space: nowrap;
          background: transparent;
        }
        .hl-btn-ghost:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.7);
          color: #fff;
        }
        .hl-btn-ghost.scrolled {
          border-color: #d1d5db;
          color: #475569;
        }
        .hl-btn-ghost.scrolled:hover {
          border-color: #059669;
          color: #059669;
          background: rgba(5,150,105,0.05);
        }

        .hl-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          border-radius: .5rem;
          background: #0D4A3E;
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: capitalize;
          letter-spacing: 0.1em;
          text-decoration: none;
          color: #fff;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(13,74,62,0.3);
        }
        .hl-btn-primary:hover {
          background: #064E3B;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13,74,62,0.4);
        }

        .hl-mobile-link {
          font-size: 1.1rem;
          font-weight: 300;
          color: #0f172a;
          text-decoration: none;
          letter-spacing: -0.02em;
          line-height: 1;
          text-align: center;
          padding: 20px 0;
          display: block;
          transition: color 0.2s;
          border-bottom: 1px solid #f1f5f9;
        }
        .hl-mobile-link:hover { color: #059669; }

        /* Hamburger: hidden on desktop, shown on mobile */
        .hl-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
          color: rgba(255,255,255,0.9);
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .hl-hamburger.scrolled { color: #0f172a; }
        .hl-hamburger:hover { background: rgba(0,0,0,0.06); }

        /* Desktop nav: visible on lg+, hidden below */
        .hl-desktop-nav  { display: flex; }
        .hl-desktop-ctas { display: flex; }

        @media (max-width: 1023px) {
          .hl-desktop-nav  { display: none !important; }
          .hl-desktop-ctas { display: none !important; }
          .hl-hamburger    { display: flex !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        transform: `translateY(${navVisible ? '0' : '-100%'})`,
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1), height 0.4s ease',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '96px',
          padding: '0 clamp(20px, 5vw, 64px)',
          maxWidth: '1280px',
          margin: '0 auto',
          transition: 'all 0.3s ease',
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/hlynk.png"
              alt="hlynk"
              style={{
                height: '40px',
                width: 'auto',
                transition: 'all 0.3s ease',
                filter: scrolled ? 'none' : 'brightness(0) invert(1)',
              }}
            />
            <span style={{ color: scrolled ? '#00694B' : '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: '4px' }}>lynk</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hl-desktop-nav" style={{ alignItems: 'center', gap: 36 }}>
            {navItems.map(n => (
              n.href.startsWith('/#') || n.href.startsWith('#') ? (
                <a key={n.label} href={n.href} className={`hl-nav-link${scrolled ? ' scrolled' : ''}`}>
                  {n.label}
                </a>
              ) : (
                <Link key={n.label} to={n.href} className={`hl-nav-link${scrolled ? ' scrolled' : ''}`}>
                  {n.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hl-desktop-ctas" style={{ alignItems: 'center', gap: 10 }}>
            <Link to="/register" className="hl-btn-primary">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`hl-hamburger${scrolled ? ' scrolled' : ''}`}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <AlignRight size={22} />
          </button>

        </div>
      </header>

      {/* ── Mobile full-screen menu ── */}
      <div
        aria-hidden={!menuOpen}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Mobile header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <img src="/hlynk.png" alt="hlynk" style={{ height: 30, width: 'auto' }} />
            <span style={{ color: '#00694B', fontSize: '1.5rem', fontWeight: 'bold', margin: '4px' }}>lynk</span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', padding: 6, borderRadius: 8 }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav links — centred vertically */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px' }}>
          {navItems.map(n => (
            n.href.startsWith('/#') || n.href.startsWith('#') ? (
              <a
                key={n.label}
                href={n.href}
                className="hl-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {n.label}
              </a>
            ) : (
              <Link
                key={n.label}
                to={n.href}
                className="hl-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {n.label}
              </Link>
            )
          ))}
        </nav>

        {/* Bottom CTAs */}
        <div style={{ padding: '0 28px 52px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            style={{
              padding: '17px', textAlign: 'center',
              background: '#0D4A3E', borderRadius: 12,
              fontSize: '0.78rem', fontWeight: 800,
              color: '#fff', textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              boxShadow: '0 8px 24px rgba(13,74,62,0.25)',
            }}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </>
  )
}
