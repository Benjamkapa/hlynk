/**
 * HLynk Admin Design System
 * Shared tokens, CSS, and helper components used across all admin pages.
 * Import this in every admin page to keep styles consistent with AdminDashboardPage.
 */

/* ─── GLOBAL CSS (inject once via <style>{ADMIN_CSS}</style>) ─── */
export const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Saira:ital,wght@0,100..900;1,100..900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Figtree:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

.hl-dash {
  --ink:      #0D1B12;
  --ink2:     #4A5E52;
  --ink3:     #8FA398;
  --forest:   #0D2419;
  --forest2:  #0d5534;
  --mint:     #1DBA87;
  --mint2:    #B8F0DA;
  --amber:    #F5A623;
  --red:      #EF4444;
  --bg:       #F0F2EE;
  --surface:  #FFFFFF;
  --surface2: #F7F8F6;
  --border:   rgba(13,36,25,0.08);
  --shadow:   0 2px 4px rgba(13,36,25,0.04), 0 8px 24px rgba(13,36,25,0.06);
  --shadow-lg: 0 12px 48px rgba(13,36,25,0.12), 0 2px 4px rgba(13,36,25,0.04);
  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;

  font-family: 'Figtree', 'Nunito', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
.hl-dash * { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Animations ── */
@keyframes hl-up    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes hl-blink { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes hl-count { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
@keyframes hl-spin  { to { transform: rotate(360deg); } }
@keyframes hl-fade  { from { opacity:0; } to { opacity:1; } }

/* ── Cards ── */
.hl-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  transition: box-shadow 0.25s, transform 0.25s;
  position: relative;
  overflow: hidden;
}
.hl-card-dark {
  background: var(--forest);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 48px rgba(13,36,25,0.25);
  position: relative;
  overflow: hidden;
}
.hl-card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.hl-card-header {
  padding: 16px 22px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.hl-card-header h3 {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.hl-card-body { padding: 22px; }

/* ── KPI cards ── */
.hl-kpi { transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s; cursor: default; }
.hl-kpi:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.hl-kpi-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: .58rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 6px;
}
.hl-kpi-value {
  font-family: 'Saira', sans-serif;
  font-weight: 800;
  font-size: 2.1rem;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -.02em;
}

/* ── Buttons ── */
.hl-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; border-radius: var(--radius-md);
  background: var(--forest); color: #fff;
  font-family: 'Figtree',sans-serif; font-size: .83rem; font-weight: 700;
  border: none; cursor: pointer; transition: all .2s; white-space: nowrap;
}
.hl-btn-primary:hover { background: var(--forest2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(13,36,25,.25); }
.hl-btn-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; }

.hl-btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: var(--radius-md);
  background: var(--surface); color: var(--ink2);
  font-family: 'Figtree',sans-serif; font-size: .83rem; font-weight: 600;
  border: 1.5px solid var(--border); cursor: pointer; transition: all .2s; white-space: nowrap;
}
.hl-btn-outline:hover { border-color: rgba(13,36,25,.22); color: var(--ink); }

.hl-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  background: var(--surface2); border: 1px solid var(--border);
  cursor: pointer; transition: all .2s; color: var(--ink2);
}
.hl-btn-ghost:hover { background: var(--forest); border-color: var(--forest); color: #fff; }
.hl-btn-ghost.danger:hover { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.25); color: var(--red); }

/* ── Page header ── */
.hl-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  animation: hl-up .4s ease both;
}
.hl-page-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: clamp(1.4rem, 2.8vw, 2.1rem);
  color: var(--ink);
  letter-spacing: -.03em;
  line-height: 1.1;
  text-transform: uppercase;
}
.hl-page-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: .6rem;
  color: var(--ink3);
  letter-spacing: .06em;
  text-transform: uppercase;
}

/* ── KPI Typography ── */
.hl-kpi-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: .6rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 6px;
}
.hl-kpi-value {
  font-family: 'Saira', sans-serif;
  font-weight: 800;
  font-size: 1.8rem;
  color: var(--ink);
  line-height: 1.1;
  letter-spacing: -0.01em;
}

/* ── Form elements ── */
.hl-form-label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: .58rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 7px;
  font-weight: 600;
}
.hl-form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: 'Figtree', sans-serif;
  font-size: .85rem;
  color: var(--ink);
  background: var(--surface);
  transition: border-color .2s, box-shadow .2s;
  outline: none;
}
.hl-form-input:focus { border-color: var(--mint); box-shadow: 0 0 0 3px rgba(29,186,135,.1); }
.hl-form-input.icon-left { padding-left: 38px; }
.hl-input-wrap { position: relative; }
.hl-input-wrap .hl-input-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--ink3); pointer-events: none;
}
.hl-form-input.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA398' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

/* ── Table ── */
.hl-table { width: 100%; border-collapse: collapse; }
.hl-table thead tr { background: var(--surface2); }
.hl-table th {
  padding: 11px 20px;
  text-align: left;
  font-family: 'JetBrains Mono', monospace;
  font-size: .53rem;
  letter-spacing: .13em;
  text-transform: uppercase;
  color: var(--ink3);
  font-weight: 500;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.hl-table td {
  padding: 13px 20px;
  border-bottom: 1px solid var(--border);
  font-size: .86rem;
  color: var(--ink);
  vertical-align: middle;
}
.hl-table tbody tr:last-child td { border-bottom: none; }
.hl-table tbody tr:hover td { background: var(--surface2); }

/* ── Badges ── */
.hl-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: .52rem;
  font-weight: 700;
  letter-spacing: .05em;
  display: inline-block;
  white-space: nowrap;
}
.hl-badge-active   { background: rgba(29,186,135,.12); color: #0d8a62; border: 1px solid rgba(29,186,135,.25); }
.hl-badge-trial    { background: rgba(245,166,35,.12);  color: #D97706; border: 1px solid rgba(245,166,35,.25); }
.hl-badge-expired  { background: rgba(239,68,68,.1);   color: #DC2626; border: 1px solid rgba(239,68,68,.2); }
.hl-badge-suspended{ background: rgba(239,68,68,.08);  color: #EF4444; border: 1px solid rgba(239,68,68,.15); }
.hl-badge-sent     { background: rgba(29,186,135,.1);  color: #0d8a62; border: 1px solid rgba(29,186,135,.2); }
.hl-badge-open     { background: rgba(245,166,35,.1);  color: #D97706; border: 1px solid rgba(245,166,35,.2); }
.hl-badge-progress { background: rgba(59,130,246,.1);  color: #2563EB; border: 1px solid rgba(59,130,246,.2); }
.hl-badge-resolved { background: rgba(29,186,135,.1);  color: #0d8a62; border: 1px solid rgba(29,186,135,.2); }

/* ── Trend chips ── */
.hl-trend {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 8px; border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: .54rem; font-weight: 700;
}
.hl-trend-up { background: rgba(29,186,135,.1); color: #1DBA87; }
.hl-trend-dn { background: rgba(239,68,68,.08); color: #EF4444; }

/* ── Live dot ── */
.hl-live {
  display: inline-block; width: 7px; height: 7px; border-radius: 50%;
  background: var(--mint); box-shadow: 0 0 0 2px rgba(29,186,135,.22);
  animation: hl-blink 2s ease-in-out infinite;
}

/* ── Stat highlight box (sidebar) ── */
.hl-stat-highlight {
  padding: 14px;
  border-radius: 6px;
  background: rgba(29,186,135,.06);
  border: 1px solid rgba(29,186,135,.15);
}

/* ── Tab bar ── */
.hl-tab-bar {
  display: flex; gap: 2px;
  background: var(--surface2);
  padding: 4px; border-radius: 6px;
  width: fit-content;
}
.hl-tab {
  padding: 7px 16px; border-radius: 4px;
  font-family: 'Figtree', sans-serif; font-size: .78rem; font-weight: 700;
  cursor: pointer; border: none; background: none;
  color: var(--ink3); transition: all .2s;
}
.hl-tab.active { background: var(--surface); color: var(--ink); box-shadow: 0 1px 4px rgba(13,36,25,.08); }

/* ── Bar progress ── */
.hl-bar-track { height: 5px; border-radius: 100px; background: rgba(13,36,25,.07); overflow: hidden; margin-top: 6px; }
.hl-bar-fill  { height: 100%; border-radius: 100px; }

/* ── Uptime bar (dark card) ── */
.hl-uptime-track { height: 4px; border-radius: 100px; background: rgba(255,255,255,.08); overflow: hidden; }
.hl-uptime-fill  { height: 100%; background: linear-gradient(90deg, #1DBA87, #0d8a62); border-radius: 100px; }

/* ── Risk / attention card ── */
.hl-attention-card {
  padding: 12px 14px;
  border-radius: 6px;
  border: 1px solid rgba(239,68,68,.12);
  background: rgba(239,68,68,.02);
  transition: all .2s;
}
.hl-attention-card:hover { border-color: rgba(239,68,68,.28); box-shadow: 0 4px 16px rgba(239,68,68,.07); }

/* ── Resource link button ── */
.hl-resource-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 15px; border-radius: 6px;
  background: var(--surface2); border: 1px solid var(--border);
  cursor: pointer; transition: all .2s;
  font-family: 'Figtree', sans-serif; font-weight: 700; font-size: .85rem; color: var(--ink);
}
.hl-resource-btn:hover { border-color: rgba(13,36,25,.18); background: var(--surface); }

/* ── Announcement history card ── */
.hl-broadcast-card {
  padding: 13px 15px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--surface);
  cursor: pointer; transition: all .2s;
}
.hl-broadcast-card:hover { border-color: rgba(29,186,135,.3); }

/* ── Settings status row ── */
.hl-status-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 14px; border-radius: 6px;
  background: rgba(29,186,135,.06); border: 1px solid rgba(29,186,135,.15);
}

/* ── Main content grid ── */
.hl-main-grid { display: grid; grid-template-columns: 1fr 336px; gap: 20px; }
.hl-grid-2    { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.hl-grid-3    { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.hl-grid-4    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

/* ── Utilities ── */
.hl-stack-md { display: flex; flex-direction: column; gap: 40px; align-items: center; }
@media (min-width: 768px) { .hl-stack-md { flex-direction: row; } }

/* ── Responsive ── */
@media (max-width: 1200px) { .hl-main-grid { grid-template-columns: 1fr !important; } }
@media (max-width: 1060px) { .hl-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
                              .hl-grid-2 { grid-template-columns: 1fr !important; } }
@media (max-width: 700px)  { .hl-page-header { flex-direction: column !important; }
                              .hl-grid-3 { grid-template-columns: 1fr !important; }
                              .hl-grid-4 { grid-template-columns: 1fr 1fr !important; }
                              .hl-dash   { padding: 18px 14px 48px !important; } }
`

/* ─── Export alias for provider pages ─── */
export const PROVIDER_CSS = ADMIN_CSS

/* ─── Shared formatting helpers ─── */
export const fmt = (v: number) => 
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v)

export const fmtDate = (d: string | Date) => 
  new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })

/* ─── Colour helper for avatar initials ─── */
export function avatarHue(index: number) {
  const hues = [140, 210, 30, 280, 180, 350, 60, 310]
  return hues[index % hues.length]
}
