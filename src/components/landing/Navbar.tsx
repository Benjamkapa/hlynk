import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AlignRight, X } from 'lucide-react'

const navItems = [
  { label: "About",    href: "#about"    },
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
  { label: "Contact",  href: "#contact"  },
]

export default function Navbar() {
  const [menuOpen,    setMenuOpen]   = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
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
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-decoration: none;
          color: rgba(255,255,255,0.85);
          transition: color 0.2s;
          white-space: nowrap;
        }
        .hl-nav-link:hover { color: #fff; }
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
          text-transform: uppercase;
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
          border-radius: 9999px;
          background: #0D4A3E;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
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
          font-size: 1.6rem;
          font-weight: 900;
          color: #0f172a;
          text-decoration: none;
          letter-spacing: -0.02em;
          line-height: 1;
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
        position:   'fixed',
        top:         0,
        left:        0,
        width:       '100%',
        zIndex:      100,
        transform:  `translateY(${navVisible ? '0' : '-100%'})`,
        background:     scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom:   scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
        boxShadow:      scrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        transition:     'background 0.3s ease, border-color 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1), height 0.4s ease',
      }}>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          height:          '96px',
          padding:         '0 clamp(20px, 5vw, 64px)',
          maxWidth:        '1280px',
          margin:          '0 auto',
          transition:      'all 0.3s ease',
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="hlynk"
              style={{
                height:     '40px',
                width:      'auto',
                transition: 'all 0.3s ease',
                filter:     scrolled ? 'none' : 'brightness(0) invert(1)',
              }}
            />
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
            {/* <Link to="/login" className={`hl-btn-ghost${scrolled ? ' scrolled' : ''}`}>
              <span style={{
                width: 18,
                height: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                background: scrolled ? '#ffffff' : 'rgba(255,255,255,0.95)',
                boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
                flexShrink: 0,
              }}>
                <svg width="11" height="11" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.58 2.68-3.9 2.68-6.62Z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.31-1.58-5.02-3.7H1.96v2.33A9 9 0 0 0 9 18Z" />
                  <path fill="#FBBC05" d="M3.98 10.72A5.41 5.41 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.95H1.96A9 9 0 0 0 1 9c0 1.45.35 2.82.96 4.05l2.02-2.33Z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 1.96 4.95l2.02 2.33c.71-2.12 2.68-3.7 5.02-3.7Z" />
                </svg>
              </span>
              Google Sign-In
            </Link> */}
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
          position:      'fixed',
          inset:          0,
          zIndex:         200,
          background:    '#fff',
          display:       'flex',
          flexDirection: 'column',
          opacity:        menuOpen ? 1 : 0,
          pointerEvents:  menuOpen ? 'auto' : 'none',
          transform:      menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition:    'opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Mobile header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="hlynk" style={{ height: 30, width: 'auto' }} />
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
          {/* <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              padding: '15px', textAlign: 'center',
              border: '1px solid #e2e8f0', borderRadius: 12,
              fontSize: '0.78rem', fontWeight: 800,
              color: '#475569', textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.58 2.68-3.9 2.68-6.62Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.31-1.58-5.02-3.7H1.96v2.33A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.98 10.72A5.41 5.41 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.95H1.96A9 9 0 0 0 1 9c0 1.45.35 2.82.96 4.05l2.02-2.33Z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 1.96 4.95l2.02 2.33c.71-2.12 2.68-3.7 5.02-3.7Z" />
            </svg>
            Sign In With Google
          </Link> */}
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
