/**
 * HLynk Admin Design System
 * Premium SaaS Tokens & Styles - Sharp Edition
 */

export const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --ink: #0F172A;
  --ink2: #475569;
  --ink3: #94A3B8;
  --forest: #064E3B;
  --forest-light: #065F46;
  --mint: #10B981;
  --mint-soft: #ECFDF5;
  --amber: #F59E0B;
  --red: #EF4444;
  --bg: #F8FAFC;
  --surface: #FFFFFF;
  --border: #F1F5F9;
  --border-strong: #E2E8F0;
  
  /* Balanced Border Radius */
  --radius-lg: 12px;
  --radius-md: 8px;
  --radius-sm: 4px;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.hl-dash {
  font-family: 'Ubuntu', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

.hl-dash h1, .hl-dash h2, .hl-dash h3, .hl-dash h4 {
  font-family: 'Ubuntu', sans-serif;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.hl-mono {
  font-family: 'JetBrains Mono', monospace !important;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* ── Components ── */

.hl-card {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.hl-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--mint);
}

.hl-input {
  background: #FDFDFD;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  transition: all 0.2s;
}
.hl-input:focus {
  outline: none;
  border-color: var(--mint);
  box-shadow: 0 0 0 4px var(--mint-soft);
  background: #fff;
}

.hl-btn-primary {
  background: var(--forest);
  color: #fff;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--forest);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.hl-btn-primary:hover {
  background: var(--forest-light);
  transform: translateY(-1px);
}

.hl-badge {
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Sidebar Styles */
.hl-sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink2);
  transition: all 0.2s;
}
.hl-sidebar-item:hover {
  background: var(--mint-soft);
  color: var(--forest);
}
.hl-sidebar-item.active {
  background: var(--forest);
  color: #fff;
}

/* Rounded Utilities */
.rounded-sharp { border-radius: var(--radius-lg) !important; }
.rounded-sharp-md { border-radius: var(--radius-md) !important; }
.rounded-sharp-sm { border-radius: var(--radius-sm) !important; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
`

export const PROVIDER_CSS = ADMIN_CSS
