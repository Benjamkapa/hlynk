import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Zap, LayoutDashboard, ShieldCheck, BarChart3, PackageSearch,
  TrendingUp, Receipt, Users, ArrowRight, Check, Menu, X, AlignRight,
  Star, Bell,
  Scissors, Wrench, Smartphone, Sparkles, Utensils, Shirt, Camera,
  Monitor, GraduationCap, Cpu, Plus, Phone, Mail, MessageSquare
} from "lucide-react";

/* ─── STYLES ─── */
const HL_AESTHETICS = `
:root {
  --teal: #20C997;
  --teal-dim: rgba(32,201,151,0.12);
  --teal-glow: rgba(32,201,151,0.25);
  --blue: #4A90E2;
  --orange: #FF8C42;
  --bg: #080C10;
  --bg2: #0D1319;
  --bg3: #111820;
  --surface: rgba(255,255,255,0.03);
  --surface2: rgba(255,255,255,0.06);
  --border: rgba(255,255,255,0.07);
  --border-teal: rgba(32,201,151,0.2);
  --text: #F0F4F8;
  --text-muted: #A0B0C0;
  --text-dim: #506070;
}

.hl-landing-wrap {
  background: var(--bg);
  color: var(--text);
  font-family: 'Archivo', sans-serif;
}

.hl-serif { font-family: 'Red Rose', serif; }
.hl-mono { font-family: 'Saira', monospace; }

/* Brighter labels with glow */
.label-glow {
  color: #fff;
  text-shadow: 0 0 8px rgba(255,255,255,0.3);
  letter-spacing: 0.1em;
  font-weight: 600;
}

/* Dashboard Mockup Aesthetics */
.dashboard-wrap { position: relative; z-index: 2; margin-top: 4rem; max-width: 680px; margin-left: auto; margin-right: auto; }
.dash-glow { position: absolute; inset: -40px; background: radial-gradient(ellipse at center, rgba(32,201,151,0.08) 0%, transparent 70%); pointer-events: none; z-index: 0; }
.dashboard { background: var(--bg2); border: 1px solid var(--border-teal); border-radius: 14px; overflow: hidden; position: relative; z-index: 1; box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(32,201,151,0.08); }

/* Table styling from HTML */
.dash-table-head { display: grid; grid-template-columns: 1fr auto auto; gap: 0.5rem; padding: 0.6rem 1rem; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.07em; color: #fff; font-family: 'Saira'; border-bottom: 1px solid var(--border); margin-bottom: 0.3rem; text-shadow: 0 0 5px rgba(255,255,255,0.2); }
.dash-row { display: grid; grid-template-columns: 1fr auto auto; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.75rem; align-items: center; border-radius: 5px; transition: background .15s; }
.row-name { color: #fff; }
.row-qty { color: var(--text-muted); font-family: 'Saira'; text-align: right; }

/* Pillars */
.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-top: 4rem; }
.pillar { padding: 2.5rem 2rem; background: var(--bg2); position: relative; overflow: hidden; }
.pillar::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
.pillar:nth-child(1)::before { background: var(--teal); }
.pillar:nth-child(2)::before { background: var(--blue); }
.pillar:nth-child(3)::before { background: var(--orange); }

/* Divider */
.divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, var(--border-teal), transparent); margin: 0; }

@media (max-width: 900px) {
  .pillars { grid-template-columns: 1fr; }
}
`;

/* ─── TYPES ─── */
interface NavItem { label: string; href: string }
interface Feature { icon: React.ReactNode; title: string; desc: string }
interface PricingPlan {
  name: string; price: string; sub: string; desc: string; bestFor: string;
  color: string; textColor: string; features: string[]; badge?: string;
}
interface Testimonial { name: string; role: string; quote: string; initials: string }
interface WhoCard { icon: React.ReactNode; label: string }

/* ─── HOOKS ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── COMPONENTS ─── */
function FadeUp({ children, delay = 0, className = "", style = {} }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: inView ? 1 : 0, transform: inView ? "translateY(24px)" : "translateY(32px)",
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  );
}

function POSCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0, raf = 0, t = 0;

    const C = {
      teal: "rgba(32,201,151,",
      blue: "rgba(74,144,226,",
      orange: "rgba(255,140,66,",
    };

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string; twinkle: number; twinkleSpeed: number };
    type Stream   = { x: number; y: number; len: number; speed: number; alpha: number; width: number; color: string };
    type Hex      = { cx: number; cy: number; r: number; rot: number; rotSpeed: number; alpha: number; color: string; phase: number };
    type Ring     = { cx: number; cy: number; r: number; maxR: number; speed: number; alpha: number; color: string; t: number };
    type Floater  = { x: number; y: number; vy: number; alpha: number; size: number; text: string; color: string; phase: number };

    let particles: Particle[], streams: Stream[], hexes: Hex[], rings: Ring[], floaters: Floater[];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function init() {
      if (!canvas) return;
      W = canvas.width  = canvas.offsetWidth  * dpr;
      H = canvas.height = canvas.offsetHeight * dpr;

      particles = Array.from({ length: 90 }, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.25, 0.25), vy: rand(-0.5, -0.1),
        size: rand(1, 3.5) * dpr,
        alpha: rand(0.15, 0.85),
        color: [C.teal, C.blue, C.orange, "rgba(255,255,255,"][Math.floor(rand(0, 4))],
        twinkle: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.015, 0.05),
      }));

      streams = Array.from({ length: 22 }, (_, i) => ({
        x: rand(0, W), y: rand(-H, H),
        len: rand(80, 220) * dpr,
        speed: rand(0.5, 1.4),
        alpha: rand(0.04, 0.16),
        width: rand(0.5, 2) * dpr,
        color: [C.teal, C.blue, C.orange][i % 3],
      }));

      hexes = Array.from({ length: 12 }, (_, i) => ({
        cx: W * (0.08 + (i % 4) * 0.28),
        cy: H * (0.15 + Math.floor(i / 4) * 0.38),
        r: rand(24, 60) * dpr,
        rot: rand(0, Math.PI),
        rotSpeed: rand(-0.004, 0.004),
        alpha: rand(0.025, 0.09),
        color: [C.teal, C.blue, C.orange][i % 3],
        phase: rand(0, Math.PI * 2),
      }));

      rings = [
        { cx: W * 0.12, cy: H * 0.5,  color: C.teal,   maxR: 160 * dpr, t: 0 },
        { cx: W * 0.88, cy: H * 0.3,  color: C.blue,   maxR: 130 * dpr, t: -70 },
        { cx: W * 0.5,  cy: H * 0.85, color: C.orange, maxR: 110 * dpr, t: -140 },
        { cx: W * 0.25, cy: H * 0.12, color: C.teal,   maxR: 90  * dpr, t: -210 },
        { cx: W * 0.75, cy: H * 0.7,  color: C.blue,   maxR: 75  * dpr, t: -280 },
      ].map(r => ({ ...r, r: 0, speed: rand(0.7, 1.3), alpha: 0.5 }));

      const labels = ["KES", "+", "✓", "₊", "→", "%", "↑"];
      floaters = Array.from({ length: 22 }, (_, i) => ({
        x: rand(0, W), y: rand(0, H),
        vy: rand(-0.25, -0.75),
        alpha: rand(0.08, 0.45),
        size: rand(9, 17) * dpr,
        text: labels[i % labels.length],
        color: [C.teal, C.blue, C.orange][i % 3] + "1)",
        phase: rand(0, Math.PI * 2),
      }));
    }

    function hexPath(cx: number, cy: number, r: number, rot: number) {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = rot + (i / 6) * Math.PI * 2;
        i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath();
    }

    function drawMeshLines() {
      if (!ctx) return;
      const nodes = particles.slice(0, 32);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxD = 130 * dpr;
          if (dist < maxD) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = C.teal + (1 - dist / maxD) * 0.1 + ")";
            ctx.lineWidth = 0.5 * dpr;
            ctx.stroke();
          }
        }
      }
    }

    function draw() {
      if (!ctx) return;
      t++;
      ctx.clearRect(0, 0, W, H);

      // Atmosphere
      let g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, W * 0.7);
      g.addColorStop(0, "rgba(32,201,151,0.08)");
      g.addColorStop(0.45, "rgba(74,144,226,0.04)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      g = ctx.createRadialGradient(W * 0.08, H * 0.82, 0, W * 0.08, H * 0.82, W * 0.5);
      g.addColorStop(0, "rgba(255,140,66,0.06)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      g = ctx.createRadialGradient(W * 0.92, H * 0.15, 0, W * 0.92, H * 0.15, W * 0.4);
      g.addColorStop(0, "rgba(74,144,226,0.05)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // Hexagons
      hexes.forEach(h => {
        h.rot += h.rotSpeed;
        const pulse = Math.sin(t * 0.018 + h.phase) * 0.5 + 0.5;
        const a = h.alpha * (0.5 + pulse * 0.5);
        ctx.lineWidth = dpr;
        ctx.strokeStyle = h.color + a + ")";
        hexPath(h.cx, h.cy, h.r, h.rot); ctx.stroke();
        ctx.strokeStyle = h.color + (a * 0.45) + ")";
        hexPath(h.cx, h.cy, h.r * 0.58, h.rot + Math.PI / 6); ctx.stroke();
      });

      // Data streams
      streams.forEach(s => {
        s.y -= s.speed;
        if (s.y + s.len < 0) { s.y = H + s.len; s.x = rand(0, W); }
        const gr = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y);
        gr.addColorStop(0, s.color + "0)");
        gr.addColorStop(0.5, s.color + s.alpha + ")");
        gr.addColorStop(1, s.color + "0)");
        ctx.beginPath(); ctx.moveTo(s.x, s.y - s.len); ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = gr; ctx.lineWidth = s.width; ctx.stroke();
      });

      drawMeshLines();

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.twinkle += p.twinkleSpeed;
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        const ta = p.alpha * (0.45 + 0.55 * Math.sin(p.twinkle));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + ta + ")"; ctx.fill();
        if (p.size > 2.2 * dpr) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
          glow.addColorStop(0, p.color + ta * 0.35 + ")");
          glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
        }
      });

      // Rings
      rings.forEach(ring => {
        ring.t++;
        if (ring.t < 0) return;
        ring.r += ring.speed;
        ring.alpha = (1 - ring.r / ring.maxR) * 0.45;
        if (ring.r > ring.maxR) { ring.r = 0; ring.alpha = 0.45; ring.t = 0; }
        ctx.beginPath(); ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + ring.alpha + ")";
        ctx.lineWidth = 1.5 * dpr; ctx.stroke();
      });

      // Floaters
      floaters.forEach(f => {
        f.y += f.vy; f.phase += 0.018;
        if (f.y < -30) { f.y = H + 20; f.x = rand(0, W); }
        ctx.globalAlpha = f.alpha * (0.55 + 0.45 * Math.sin(f.phase));
        ctx.fillStyle = f.color;
        ctx.font = `${Math.round(f.size)}px "Saira", monospace`;
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      });

      raf = requestAnimationFrame(draw);
    }

    const handleResize = () => {
      cancelAnimationFrame(raf);
      init();
      draw();
    };

    init();
    draw();
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

  return sent ? (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-[#20C997]/10 flex items-center justify-center mx-auto mb-6 border border-[#20C997]/30">
        <Check size={28} className="text-[#20C997]" />
      </div>
      <p className="text-white font-bold text-lg hl-serif italic">Message Sent.</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <label className="text-[10px] hl-mono label-glow uppercase tracking-[0.2em] ml-1">Your Name</label>
        <input
          type="text"
          placeholder="Jane Wanjiku"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-5 py-4 rounded-xl bg-[#080C10] border border-white/5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#20C997]/40 transition-colors"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] hl-mono label-glow uppercase tracking-[0.2em] ml-1">Phone or Email</label>
        <input
          type="text"
          placeholder="07XX XXX XXX"
          required
          value={form.contact}
          onChange={e => setForm({ ...form, contact: e.target.value })}
          className="w-full px-5 py-4 rounded-xl bg-[#080C10] border border-white/5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#20C997]/40 transition-colors"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] hl-mono label-glow uppercase tracking-[0.2em] ml-1">Message</label>
        <textarea
          placeholder="How can we help your business?"
          rows={4}
          required
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          className="w-full px-5 py-4 rounded-xl bg-[#080C10] border border-white/5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#20C997]/40 transition-colors resize-none"
        />
      </div>
      <button type="submit" className="w-full py-5 rounded-xl bg-[#20C997] text-[#050D0A] font-bold text-[11px] uppercase tracking-widest hover:bg-[#1aad80] transition-colors">
        Send Message
      </button>
    </form>
  );
}

/* ─── DATA ─── */
const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Who Uses", href: "#who" },
  { label: "Pricing", href: "#pricing" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

const features: Feature[] = [
  { icon: <TrendingUp size={20} />, title: "See Your Daily Profit", desc: "Know exactly how much money you made after all costs. No more guessing." },
  { icon: <Receipt size={20} />, title: "Record Every Sale", desc: "Save every single sale instantly. Never lose a receipt or forget a payment." },
  { icon: <PackageSearch size={20} />, title: "Manage Your Stock", desc: "Stock updates as you sell. Get alerts when items are running low." },
  { icon: <BarChart3 size={20} />, title: "Track Your Expenses", desc: "List your rent, supplies, and wages. See where your cash is really going." },
  { icon: <LayoutDashboard size={20} />, title: "Easy Daily Reports", desc: "Get a simple summary of your business health every morning and evening." },
  { icon: <ShieldCheck size={20} />, title: "Safe In The Cloud", desc: "Your data is always backed up. It stays safe even if you lose your phone." },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter", price: "KES 1,000", sub: "/month",
    bestFor: "Small Shops", desc: "Perfect for single owners to finally track their profit.",
    color: "#FFB7C5", textColor: "#000", badge: "14-Day Free Trial",
    features: ["Record every sale", "Track every expense", "Basic stock tracking", "Daily profit dashboard", "Secure cloud backup"],
  },
  {
    name: "Growth", price: "KES 2,000", sub: "/month",
    bestFor: "Growing Teams", desc: "More control for businesses with staff or many products.",
    color: "#C0E8E0", textColor: "#000", badge: "Most Popular",
    features: ["Full inventory management", "Know when to restock", "Multiple user accounts", "Monthly profit reports", "Sales & expense logs"],
  },
  {
    name: "Business", price: "KES 5,000", sub: "/month",
    bestFor: "High Volume", desc: "Advanced tools for busy shops that need deeper insight.",
    color: "#FFF9C4", textColor: "#000",
    features: ["Advanced performance insights", "Export data to Excel/PDF", "Priority support", "Customer trends", "Built for busy operations"],
  },
];

const testimonials: Testimonial[] = [
  { name: "Mama Njeri", role: "Beauty Salon // Nairobi", initials: "MN", quote: "My salon grew 40% once I started tracking everything properly with hlynk." },
  { name: "John Kamau", role: "Auto Repair // Thika", initials: "JK", quote: "The stock alerts saved my workshop. Now I run like a proper business owner." },
  { name: "Aisha Osman", role: "Cleaning Services // Mombasa", initials: "AO", quote: "I finally know my real profit. This changed how I price my services." },
];

const whoCards: WhoCard[] = [
  { icon: <Scissors size={18} />, label: "Salons" },
  { icon: <Wrench size={18} />, label: "Mechanics" },
  { icon: <Smartphone size={18} />, label: "Phone Repair" },
  { icon: <Sparkles size={18} />, label: "Cleaning" },
  { icon: <Zap size={18} />, label: "Electricians" },
  { icon: <Utensils size={18} />, label: "Catering" },
  { icon: <Shirt size={18} />, label: "Tailors" },
  { icon: <Camera size={18} />, label: "Photography" },
  { icon: <Monitor size={18} />, label: "Freelancers" },
  { icon: <GraduationCap size={18} />, label: "Tutors" },
  { icon: <Cpu size={18} />, label: "Tech Repair" },
  { icon: <Plus size={18} />, label: "More..." },
];

/* ─── MAIN PAGE ─── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current <= 60) setNavVisible(true);
      else if (current > lastScroll.current + 4) setNavVisible(false);
      else if (current < lastScroll.current - 4) setNavVisible(true);
      lastScroll.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="hl-landing-wrap selection:bg-[#20C997] selection:text-[#080C10]">
      <style>{HL_AESTHETICS}</style>

      {/* ─── NAVIGATION ─── */}
      <header className={`fixed top-0 left-0 right-0 z-[100] bg-[#080C10]/85 backdrop-blur-xl border-b border-white/10 transition-transform duration-300 ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-6xl mx-auto px-8 h-[76px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" className="h-10 w-auto" alt="hlynk" />
          </Link>
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map(n => (
              <a key={n.label} href={n.href} className="text-[11px] font-bold uppercase tracking-widest text-[#7A8A96] hover:text-[#20C997] transition-colors">{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-[#7A8A96] hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="hidden md:flex px-5 py-2.5 rounded-lg bg-[#20C997] text-[#050D0A] text-xs font-bold uppercase tracking-wider hover:bg-[#1aad80] transition-all">Register</Link>
            <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg">
              <AlignRight size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      <div className={`fixed inset-0 z-[200] bg-[#080C10] p-8 flex flex-col gap-8 transition-transform duration-500 lg:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setMenuOpen(false)} className="self-end p-2 text-white hover:bg-white/5 rounded-lg"><X size={32} /></button>
        <nav className="flex flex-col gap-6">
          {navItems.map(n => (
            <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className="text-2xl font-bold hl-serif text-white hover:text-[#20C997] transition-colors">{n.label}</a>
          ))}
          <div className="h-[1px] bg-white/10 w-full" />
          <Link to="/login" onClick={() => setMenuOpen(false)} className="text-xl font-bold hl-serif text-[#20C997]">Log in</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full py-4 rounded-xl bg-[#20C997] text-[#050D0A] font-bold text-center text-lg">Start Free Trial</Link>
        </nav>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <POSCanvas />
        <div className="max-w-6xl mx-auto px-8 relative z-10 w-full text-center">
          <FadeUp className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#20C997]/20 bg-[#20C997]/5 text-[#20C997] text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse" />
            Built for Kenyan Business Owners
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-bold hl-serif text-white leading-[1.1] mb-8">
              Run Your Business.<br />
              <span className="italic text-[#20C997]">Know Your Numbers.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-lg md:text-xl text-[#A0B0C0] leading-relaxed mb-12 max-w-2xl mx-auto">
              Hard work alone isn't enough. You need to know your <span className="text-white font-bold italic">real profit</span> every day. hlynk is the simple system you've been waiting for.
            </p>
          </FadeUp>
          <FadeUp delay={0.3} className="flex flex-wrap items-center justify-center gap-4 mb-24">
            <Link to="/register" className="px-10 py-4 rounded-xl bg-[#20C997] text-[#050D0A] text-sm font-bold uppercase tracking-widest hover:bg-[#1aad80] transition-all">Start Free 14-Day Trial</Link>
            <a href="#how" className="px-10 py-4 rounded-xl border border-white/10 text-[#A0B0C0] text-sm font-bold uppercase tracking-widest hover:border-[#20C997]/30 hover:text-[#20C997] transition-all">See How It Works</a>
          </FadeUp>

          {/* Dashboard Preview */}
          <FadeUp delay={0.5} className="dashboard-wrap">
            <div className="dash-glow" />
            <div className="dashboard">
              <div className="bg-[#111820] px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FF5F57]" /><div className="w-2 h-2 rounded-full bg-[#FFBD2E]" /><div className="w-2 h-2 rounded-full bg-[#28C940]" /></div>
                <div className="flex-1 text-center text-[10px] hl-mono label-glow tracking-[0.3em]">HLYNK // DASHBOARD</div>
              </div>
              <div className="flex h-[400px] text-left">
                <div className="w-44 bg-[#080C10] p-6 border-r border-white/5 hidden md:block">
                  <div className="text-[#20C997] hl-mono text-sm font-bold mb-8">hlynk</div>
                  <div className="space-y-4">
                    <div className="text-[#20C997] text-[10px] font-bold hl-mono flex items-center gap-2 bg-[#20C997]/10 p-2 rounded"> <LayoutDashboard size={12} /> DASHBOARD</div>
                    <div className="text-[#506070] text-[10px] font-bold hl-mono flex items-center gap-2 p-2"> <PackageSearch size={12} /> INVENTORY</div>
                    <div className="text-[#506070] text-[10px] font-bold hl-mono flex items-center gap-2 p-2"> <Receipt size={12} /> SALES</div>
                  </div>
                </div>
                <div className="flex-1 bg-[#0D1319] p-8">
                  <div className="text-[10px] hl-mono text-[#506070] mb-4">Good morning · Thursday, 24 Apr</div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-xl border border-teal/20 shadow-2xl">
                      <div className="text-[9px] hl-mono label-glow uppercase mb-1">Today's Revenue</div>
                      <div className="text-xl hl-mono font-bold text-[#20C997]">KES 24,500</div>
                      <div className="text-[8px] hl-mono text-[#20C997] mt-1">↑ 12% vs yesterday</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-teal/20 shadow-2xl">
                      <div className="text-[9px] hl-mono label-glow uppercase mb-1">Net Profit</div>
                      <div className="text-xl hl-mono font-bold text-[#4A90E2]">KES 8,200</div>
                      <div className="text-[8px] hl-mono text-[#4A90E2] mt-1">After expenses</div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <div className="dash-table-head"><span>Item Sold</span><span>Qty</span><span>Status</span></div>
                    <div className="dash-row border-t border-white/5">
                      <span className="row-name">Haircut — Full</span>
                      <span className="row-qty">×4</span>
                      <span className="px-2 py-0.5 rounded bg-[#20C997]/10 text-[#20C997] text-[10px] hl-mono">Done</span>
                    </div>
                    <div className="dash-row border-t border-white/5">
                      <span className="row-name">Phone Screen</span>
                      <span className="row-qty">×1</span>
                      <span className="px-2 py-0.5 rounded bg-[#FF8C42]/10 text-[#FF8C42] text-[10px] hl-mono">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="divider" />

      {/* ─── PILLARS ─── */}
      <section className="py-24 bg-[#080C10]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="pillars">
            {[
              { n: "01", w: "Simple", d: "If you can send a WhatsApp message, you can use hlynk. No tech skills needed." },
              { n: "02", w: "Honest", d: "Real numbers. Real profit. See exactly what your business makes every single day." },
              { n: "03", w: "Reliable", d: "Built for Kenya. Works on any phone. Your data is always safe and backed up." },
            ].map((p, i) => (
              <FadeUp key={p.w} delay={i * 0.1} className="pillar">
                <div className="text-[10px] hl-mono label-glow uppercase tracking-widest mb-6">{p.n} · {p.w.toUpperCase()}</div>
                <div className="text-4xl hl-serif text-white mb-4 italic">{p.w}</div>
                <p className="text-sm text-[#A0B0C0] leading-relaxed">{p.d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-32 bg-[#0D1319]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="mb-20">
            <span className="text-xs font-bold hl-mono uppercase tracking-[0.3em] text-[#20C997] mb-4 block">How We Help</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white mb-8">Stop guessing.<br />Start <span className="italic text-[#20C997]">growing.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.05}>
                <div className="bg-[#080C10] p-10 rounded-2xl border border-white/5 hover:border-[#20C997]/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[#20C997]/10 flex items-center justify-center text-[#20C997] mb-8 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 hl-serif italic">{f.title}</h3>
                  <p className="text-sm text-[#A0B0C0] leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── WHO USES ─── */}
      <section id="who" className="py-32 bg-[#080C10]">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <FadeUp className="mb-16">
            <span className="text-xs font-bold hl-mono uppercase tracking-[0.3em] text-[#20C997] mb-4 block">Who Uses hlynk</span>
            <h2 className="text-4xl md:text-5xl hl-serif text-white leading-tight">Built for every <br className="hidden md:block" /> <span className="italic text-[#20C997]">business owner.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {whoCards.map((w, i) => (
              <FadeUp key={w.label} delay={i * 0.05} className="group">
                <div className="p-6 rounded-2xl bg-[#0D1319] border border-white/5 hover:border-[#20C997]/30 transition-all flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#20C997]/5 flex items-center justify-center text-[#20C997] group-hover:scale-110 transition-transform">
                    {w.icon}
                  </div>
                  <span className="text-[11px] hl-mono uppercase tracking-widest text-[#A0B0C0] group-hover:text-white transition-colors">{w.label}</span>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-32 bg-[#0D1319]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="text-center mb-20 text-white">
            <span className="text-[10px] font-bold hl-mono uppercase tracking-[0.4em] text-[#20C997] mb-4 block">Easy Start</span>
            <h2 className="text-4xl md:text-6xl hl-serif">Up and running in <span className="italic text-[#20C997]">3 minutes.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#20C997]/20 to-transparent" />
            {[
              { n: "01", t: "Sign Up Free", d: "Create your account in seconds. Add your business name. No card needed." },
              { n: "02", t: "Add Services", d: "List your products and prices. Set stock levels once and you're ready." },
              { n: "03", t: "Track Profit", d: "Record every sale and expense. Watch your real profit appear instantly." },
            ].map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.1} className="text-center">
                <div className="w-14 h-14 rounded-full border border-[#20C997]/30 bg-[#080C10] text-[#20C997] flex items-center justify-center hl-mono text-xs mb-8 mx-auto relative">
                  <div className="absolute inset-[-4px] rounded-full border border-[#20C997]/5" /> {s.n}
                </div>
                <h3 className="text-lg font-bold text-white mb-4 hl-serif italic">{s.t}</h3>
                <p className="text-sm text-[#A0B0C0] leading-relaxed px-4">{s.d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-32 bg-[#080C10]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="text-center mb-20">
            <span className="text-xs font-bold hl-mono uppercase tracking-[0.3em] text-[#20C997] mb-4 block">Pricing</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white mb-8">Simple, <span className="italic text-[#20C997]">honest</span> prices.</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.1}>
                <div style={{ backgroundColor: p.color }} className="p-10 rounded-2xl relative h-full flex flex-col shadow-2xl">
                  {p.badge && <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 bg-[#000] text-white text-[9px] font-bold hl-mono uppercase tracking-widest rounded-full">{p.badge}</div>}
                  <div className="text-[10px] hl-mono text-[#000]/60 uppercase font-bold mb-4">{p.name}</div>
                  <div className="text-4xl hl-serif text-[#000] mb-2">{p.price} <span className="text-xs font-normal opacity-60 hl-sans italic">/month</span></div>
                  <p className="text-xs text-[#000]/70 mb-8 font-medium">{p.desc}</p>
                  <ul className="space-y-4 mb-10 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-xs text-[#000]/80 font-semibold"> <Check size={14} className="text-[#000]/40" /> {f} </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block text-center py-4 rounded-xl bg-[#000] text-white text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all">
                    {p.name === "Starter" ? "Start Free 14-Day Trial" : "Get Started Now"}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── REVIEWS ─── */}
      <section id="reviews" className="py-32 bg-[#0D1319]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="mb-20">
            <span className="text-xs font-bold hl-mono uppercase tracking-[0.3em] text-[#20C997] mb-4 block">Reviews</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white leading-tight">Business owners who finally <br className="hidden md:block" /> know their <span className="italic text-[#20C997]">numbers.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="bg-[#080C10] p-10 rounded-2xl border border-white/5 hover:border-[#20C997]/30 transition-all group relative">
                  <div className="absolute top-4 right-8 text-4xl text-[#20C997]/10 hl-serif italic">"</div>
                  <p className="text-lg text-[#A0B0C0] italic mb-10 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#20C997] to-[#0d5534] flex items-center justify-center text-white font-black text-sm uppercase">{t.initials}</div>
                    <div>
                      <div className="text-white font-bold hl-serif">{t.name}</div>
                      <div className="text-[10px] hl-mono uppercase tracking-widest label-glow">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-32 bg-[#080C10]">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-24">
          <FadeUp>
            <span className="text-xs font-bold hl-mono uppercase tracking-[0.3em] text-[#20C997] mb-4 block">Contact</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white mb-8">Need help?<br /><span className="italic text-[#20C997]">We're here.</span></h2>
            <p className="text-[#A0B0C0] leading-relaxed mb-10">Have a question or need help setting up? Reach us anytime. We're ready to help your business grow.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white hl-mono text-sm">
                <div className="w-10 h-10 rounded-lg bg-[#20C997]/10 flex items-center justify-center text-[#20C997] border border-[#20C997]/20">
                  <Phone size={18} />
                </div>
                +254 XXX XXX XXX
              </div>
              <div className="flex items-center gap-4 text-white hl-mono text-sm">
                <div className="w-10 h-10 rounded-lg bg-[#20C997]/10 flex items-center justify-center text-[#20C997] border border-[#20C997]/20">
                  <Mail size={18} />
                </div>
                support@hlynk.co.ke
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.2} className="bg-[#0D1319] p-10 rounded-2xl border border-white/5 shadow-2xl">
            <ContactForm />
          </FadeUp>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 border-t border-white/5 bg-[#080C10]">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <img src="/logo.png" className="h-8 w-auto opacity-80" alt="hlynk" />
          <div className="text-[10px] hl-mono label-glow capitalize tracking-[0.2em]">© 2025 hlynk. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}