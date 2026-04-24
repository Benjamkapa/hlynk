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
  --teal-dim: rgba(32,201,151,0.15);
  --teal-glow: rgba(32,201,151,0.3);
  --blue: #4A90E2;
  --orange: #FF8C42;
  --bg: #0C1218;
  --bg2: #161F27;
  --bg3: #1C2630;
  --surface: rgba(255,255,255,0.05);
  --surface2: rgba(255,255,255,0.08);
  --border: rgba(255,255,255,0.1);
  --border-teal: rgba(32,201,151,0.3);
  --text: #FFFFFF;
  --text-muted: #C5D1DE;
  --text-dim: #8090A0;
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
  text-shadow: 0 0 10px rgba(255,255,255,0.4);
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* Dashboard Mockup Aesthetics */
.dashboard-wrap { position: relative; z-index: 2; margin-top: 4rem; max-width: 680px; margin-left: auto; margin-right: auto; }
.dash-glow { position: absolute; inset: -40px; background: radial-gradient(ellipse at center, rgba(32,201,151,0.12) 0%, transparent 70%); pointer-events: none; z-index: 0; }
.dashboard { background: var(--bg2); border: 1px solid var(--border-teal); border-radius: 14px; overflow: hidden; position: relative; z-index: 1; box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(32,201,151,0.15); }

/* Table styling */
.dash-table-head { display: grid; grid-template-columns: 1fr auto auto; gap: 0.5rem; padding: 0.6rem 1rem; font-size: 0.65rem; text-transform: capitalize; letter-spacing: 0.05em; color: #fff; font-family: 'Saira'; border-bottom: 1px solid var(--border); margin-bottom: 0.3rem; text-shadow: 0 0 5px rgba(255,255,255,0.3); }
.dash-row { display: grid; grid-template-columns: 1fr auto auto; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.75rem; align-items: center; border-radius: 5px; transition: background .15s; }
.row-name { color: #fff; font-weight: 500; }
.row-qty { color: var(--text-muted); font-family: 'Saira'; text-align: right; }

/* Pillars */
.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-top: 4rem; }
.pillar { padding: 2.5rem 2rem; background: var(--bg2); position: relative; overflow: hidden; }
.pillar::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
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
            ctx.strokeStyle = C.teal + (1 - dist / maxD) * 0.15 + ")";
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
      g.addColorStop(0, "rgba(32,201,151,0.12)");
      g.addColorStop(0.45, "rgba(74,144,226,0.06)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // Hexagons
      hexes.forEach(h => {
        h.rot += h.rotSpeed;
        const pulse = Math.sin(t * 0.018 + h.phase) * 0.5 + 0.5;
        const a = h.alpha * (0.6 + pulse * 0.4);
        ctx.lineWidth = dpr;
        ctx.strokeStyle = h.color + a + ")";
        hexPath(h.cx, h.cy, h.r, h.rot); ctx.stroke();
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
        const ta = p.alpha * (0.55 + 0.45 * Math.sin(p.twinkle));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + ta + ")"; ctx.fill();
      });

      // Rings
      rings.forEach(ring => {
        ring.t++;
        if (ring.t < 0) return;
        ring.r += ring.speed;
        ring.alpha = (1 - ring.r / ring.maxR) * 0.5;
        if (ring.r > ring.maxR) { ring.r = 0; ring.alpha = 0.5; ring.t = 0; }
        ctx.beginPath(); ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + ring.alpha + ")";
        ctx.lineWidth = 1.5 * dpr; ctx.stroke();
      });

      // Floaters
      floaters.forEach(f => {
        f.y += f.vy; f.phase += 0.018;
        if (f.y < -30) { f.y = H + 20; f.x = rand(0, W); }
        ctx.globalAlpha = f.alpha * (0.6 + 0.4 * Math.sin(f.phase));
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
      <p className="text-white font-semibold text-lg hl-serif italic">Message Sent.</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <label className="text-[11px] hl-mono label-glow capitalize tracking-wide ml-1">Your Name</label>
        <input
          type="text"
          placeholder="Jane Wanjiku"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-5 py-4 rounded-xl bg-[#080C10] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#20C997]/50 transition-colors"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] hl-mono label-glow capitalize tracking-wide ml-1">Phone or Email</label>
        <input
          type="text"
          placeholder="07XX XXX XXX"
          required
          value={form.contact}
          onChange={e => setForm({ ...form, contact: e.target.value })}
          className="w-full px-5 py-4 rounded-xl bg-[#080C10] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#20C997]/50 transition-colors"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] hl-mono label-glow capitalize tracking-wide ml-1">Message</label>
        <textarea
          placeholder="How can we help your business?"
          rows={4}
          required
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          className="w-full px-5 py-4 rounded-xl bg-[#080C10] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#20C997]/50 transition-colors resize-none"
        />
      </div>
      <button type="submit" className="w-full py-5 rounded-xl bg-[#20C997] text-[#050D0A] font-semibold text-[13px] capitalize tracking-wide hover:bg-[#1aad80] transition-colors">
        Send message
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
    color: "#FFD1DC", textColor: "#000", badge: "14-Day Free Trial",
    features: ["Record every sale", "Track every expense", "Basic stock tracking", "Daily profit dashboard", "Secure cloud backup"],
  },
  {
    name: "Growth", price: "KES 2,000", sub: "/month",
    bestFor: "Growing Teams", desc: "More control for businesses with staff or many products.",
    color: "#D1F2EB", textColor: "#000", badge: "Most Popular",
    features: ["Full inventory management", "Know when to restock", "Multiple user accounts", "Monthly profit reports", "Sales & expense logs"],
  },
  {
    name: "Business", price: "KES 5,000", sub: "/month",
    bestFor: "High Volume", desc: "Advanced tools for busy shops that need deeper insight.",
    color: "#FFFDE7", textColor: "#000",
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
      <header className={`fixed top-0 left-0 right-0 z-[100] bg-[#0C1218]/90 backdrop-blur-xl border-b border-white/10 transition-transform duration-300 ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-6xl mx-auto px-8 h-[84px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" className="h-11 w-auto" alt="hlynk" />
          </Link>
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map(n => (
              <a key={n.label} href={n.href} className="text-[15px] font-medium capitalize tracking-normal text-[#C5D1DE] hover:text-[#20C997] transition-colors">{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[15px] font-medium capitalize text-[#C5D1DE] hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="hidden md:flex px-6 py-3 rounded-lg bg-[#20C997] text-[#050D0A] text-[15px] font-semibold capitalize hover:bg-[#1aad80] transition-all">Register</Link>
            <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg">
              <AlignRight size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}

      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0C1218]/50 backdrop-blur-sm " />
      )}
      <div className={`fixed inset-0 z-[200] bg-transparent p-8 flex flex-col gap-8 transition-transform duration-500 lg:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setMenuOpen(false)} className="self-end p-2 text-white hover:bg-white/10 rounded-lg"><X size={36} /></button>
        <img src="/logo.png" className="h-11 mx-auto" alt="hlynk" />
        <nav className="flex flex-col gap-8">
          {navItems.map(n => (
            <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className="text-md font-sm hl-serif text-white hover:text-[#20C997] transition-colors self-center capitalize">{n.label}</a>
          ))}
          <div className="h-[1px] bg-white/10 w-full" />
          <Link to="/login" onClick={() => setMenuOpen(false)} className="text-md font-semibold hl-serif text-[#20C997] self-center capitalize">Log in</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} className="w-1/2 mx-auto py-5 rounded-xl bg-[#006849] text-black font-semibold text-center text-xl capitalize">Start free trial</Link>
        </nav>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <POSCanvas />
        <div className="max-w-6xl mx-auto px-8 relative z-10 w-full text-center">
          <FadeUp className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#20C997]/30 bg-[#20C997]/10 text-[#20C997] text-[11px] font-semibold capitalize tracking-wide mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse" />
            Built for Kenyan business owners
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-semibold hl-serif text-white leading-[1.15] mb-8">
              Run your business.<br />
              <span className="italic text-[#20C997]">Know your numbers.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-xl md:text-2xl text-[#C5D1DE] leading-relaxed mb-12 max-w-2xl mx-auto">
              Hard work alone isn't enough. You need to know your <span className="text-white font-semibold italic">real profit</span> every day. hlynk is the simple system you've been waiting for.
            </p>
          </FadeUp>
          <FadeUp delay={0.3} className="flex flex-wrap items-center justify-center gap-4 mb-24">
            <Link to="/register" className="px-10 py-5 rounded-xl bg-[#20C997] text-[#050D0A] text-base font-semibold capitalize tracking-wide hover:bg-[#1aad80] transition-all">Start free 14-day trial</Link>
            <a href="#how" className="px-10 py-5 rounded-xl border border-white/20 text-[#C5D1DE] text-base font-semibold capitalize tracking-wide hover:border-[#20C997]/40 hover:text-[#20C997] transition-all">See how it works</a>
          </FadeUp>

          {/* Dashboard Preview */}
          <FadeUp delay={0.5} className="dashboard-wrap">
            <div className="dash-glow" />
            <div className="dashboard">
              <div className="bg-[#1C2630] px-5 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28C940]" /></div>
                <div className="flex-1 text-center text-[11px] hl-mono label-glow capitalize tracking-wide">hlynk // Dashboard</div>
              </div>
              <div className="flex h-[420px] text-left">
                <div className="w-48 bg-[#0C1218] p-6 border-r border-white/10 hidden md:block">
                  <div className="text-[#20C997] hl-mono text-base font-semibold mb-8 capitalize">hlynk</div>
                  <div className="space-y-5">
                    <div className="text-[#20C997] text-[11px] font-semibold hl-mono flex items-center gap-3 bg-[#20C997]/15 p-2.5 rounded capitalize"> <LayoutDashboard size={14} /> Dashboard</div>
                    <div className="text-[#8090A0] text-[11px] font-semibold hl-mono flex items-center gap-3 p-2.5 capitalize"> <PackageSearch size={14} /> Inventory</div>
                    <div className="text-[#8090A0] text-[11px] font-semibold hl-mono flex items-center gap-3 p-2.5 capitalize"> <Receipt size={14} /> Sales</div>
                  </div>
                </div>
                <div className="flex-1 bg-[#161F27] p-8">
                  <div className="text-[11px] hl-mono text-[#8090A0] mb-6 capitalize font-medium">Good morning · Thursday, 24 Apr</div>
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-white/5 p-5 rounded-xl border border-teal/30 shadow-2xl">
                      <div className="text-[11px] hl-mono label-glow capitalize mb-1 font-medium">Today's Revenue</div>
                      <div className="text-2xl hl-mono font-semibold text-[#20C997]">KES 24,500</div>
                      <div className="text-[10px] hl-mono text-[#20C997] mt-1 font-medium">↑ 12% vs yesterday</div>
                    </div>
                    <div className="bg-white/5 p-5 rounded-xl border border-teal/30 shadow-2xl">
                      <div className="text-[11px] hl-mono label-glow capitalize mb-1 font-medium">Net Profit</div>
                      <div className="text-2xl hl-mono font-semibold text-[#4A90E2]">KES 8,200</div>
                      <div className="text-[10px] hl-mono text-[#4A90E2] mt-1 font-medium">After expenses</div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-lg">
                    <div className="dash-table-head"><span>Item sold</span><span>Qty</span><span>Status</span></div>
                    <div className="dash-row border-t border-white/10">
                      <span className="row-name">Haircut — Full</span>
                      <span className="row-qty">×4</span>
                      <span className="px-2.5 py-1 rounded bg-[#20C997]/20 text-[#20C997] text-[11px] hl-mono font-semibold">Done</span>
                    </div>
                    <div className="dash-row border-t border-white/10">
                      <span className="row-name">Phone Screen</span>
                      <span className="row-qty">×1</span>
                      <span className="px-2.5 py-1 rounded bg-[#FF8C42]/20 text-[#FF8C42] text-[11px] hl-mono font-semibold">Pending</span>
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
      <section className="py-24 bg-[#0C1218]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="pillars shadow-xl">
            {[
              { n: "01", w: "Simple", d: "If you can send a WhatsApp message, you can use hlynk. No technical skills needed." },
              { n: "02", w: "Honest", d: "Real numbers. Real profit. See exactly what your business makes every single day." },
              { n: "03", w: "Reliable", d: "Built for Kenya. Works on any phone. Your data is always safe and backed up." },
            ].map((p, i) => (
              <FadeUp key={p.w} delay={i * 0.1} className="pillar">
                <div className="text-[11px] hl-mono label-glow capitalize tracking-wide mb-6">{p.n} · {p.w}</div>
                <div className="text-4xl hl-serif text-white mb-5 italic font-semibold">{p.w}</div>
                <p className="text-base text-[#C5D1DE] leading-relaxed font-medium">{p.d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-32 bg-[#161F27]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="mb-20">
            <span className="text-[13px] font-semibold hl-mono capitalize tracking-normal text-[#20C997] mb-4 block">How we help</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white mb-8 font-semibold leading-tight">Stop guessing.<br />Start <span className="italic text-[#20C997]">growing.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.05}>
                <div className="bg-[#0C1218] p-10 rounded-2xl border border-white/10 hover:border-[#20C997]/40 transition-all group shadow-lg">
                  <div className="w-14 h-14 rounded-xl bg-[#20C997]/15 flex items-center justify-center text-[#20C997] mb-10 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-5 hl-serif italic">{f.title}</h3>
                  <p className="text-[15px] text-[#C5D1DE] leading-relaxed font-medium">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── WHO USES ─── */}
      <section id="who" className="py-32 bg-[#0C1218]">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <FadeUp className="mb-16">
            <span className="text-[13px] font-semibold hl-mono capitalize tracking-normal text-[#20C997] mb-4 block">Who uses hlynk</span>
            <h2 className="text-4xl md:text-5xl hl-serif text-white leading-snug font-semibold">Built for every <br className="hidden md:block" /> <span className="italic text-[#20C997]">business owner.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {whoCards.map((w, i) => (
              <FadeUp key={w.label} delay={i * 0.05} className="group">
                <div className="p-8 rounded-2xl bg-[#161F27] border border-white/10 hover:border-[#20C997]/40 transition-all flex flex-col items-center gap-5 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-[#20C997]/10 flex items-center justify-center text-[#20C997] group-hover:scale-110 transition-transform">
                    {w.icon}
                  </div>
                  <span className="text-[13px] hl-mono capitalize tracking-wide text-[#C5D1DE] group-hover:text-white transition-colors font-semibold">{w.label}</span>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-32 bg-[#161F27]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="text-center mb-20 text-white">
            <span className="text-[13px] font-semibold hl-mono capitalize tracking-normal text-[#20C997] mb-4 block">Easy start</span>
            <h2 className="text-4xl md:text-6xl hl-serif font-semibold leading-tight">Up and running in <span className="italic text-[#20C997]">3 minutes.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-[30px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#20C997]/40 to-transparent" />
            {[
              { n: "01", t: "Sign up free", d: "Create your account in seconds. Add your business name. No card needed." },
              { n: "02", t: "Add services", d: "List your products and prices. Set stock levels once and you're ready." },
              { n: "03", t: "Track profit", d: "Record every sale and expense. Watch your real profit appear instantly." },
            ].map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.1} className="text-center">
                <div className="w-16 h-16 rounded-full border border-[#20C997]/40 bg-[#0C1218] text-[#20C997] flex items-center justify-center hl-mono text-sm mb-10 mx-auto relative shadow-lg">
                  <div className="absolute inset-[-6px] rounded-full border border-[#20C997]/10" /> {s.n}
                </div>
                <h3 className="text-xl font-semibold text-white mb-5 hl-serif italic">{s.t}</h3>
                <p className="text-base text-[#C5D1DE] leading-relaxed px-4 font-medium">{s.d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-32 bg-[#0C1218]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="text-center mb-20">
            <span className="text-[13px] font-semibold hl-mono capitalize tracking-normal text-[#20C997] mb-4 block">Pricing</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white mb-8 font-semibold">Simple, <span className="italic text-[#20C997]">honest</span> prices.</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {pricingPlans.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.1}>
                <div style={{ backgroundColor: p.color }} className="p-12 rounded-3xl relative h-full flex flex-col shadow-2xl border border-white/5">
                  {p.badge && <div className="absolute top-0 right-10 -translate-y-1/2 px-5 py-1.5 bg-[#000] text-white text-[11px] font-semibold hl-mono capitalize tracking-wide rounded-full shadow-lg">{p.badge}</div>}
                  <div className="text-[11px] hl-mono text-[#000]/70 capitalize font-semibold mb-5">{p.name}</div>
                  <div className="text-5xl hl-serif text-[#000] mb-3 font-semibold">{p.price} <span className="text-sm font-medium opacity-60 hl-sans italic">/month</span></div>
                  <p className="text-[15px] text-[#000]/80 mb-10 font-semibold leading-relaxed">{p.desc}</p>
                  <ul className="space-y-5 mb-12 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-4 text-[15px] text-[#000]/90 font-bold"> <Check size={18} className="text-[#000]/30" /> {f} </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block text-center py-5 rounded-2xl bg-[#000] text-white text-[15px] font-semibold capitalize tracking-wide hover:scale-[1.03] transition-all shadow-xl">
                    {p.name === "Starter" ? "Start free 14-day trial" : "Get started now"}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ─── REVIEWS ─── */}
      <section id="reviews" className="py-32 bg-[#161F27]">
        <div className="max-w-6xl mx-auto px-8">
          <FadeUp className="mb-20">
            <span className="text-[13px] font-semibold hl-mono capitalize tracking-normal text-[#20C997] mb-4 block">Reviews</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white leading-tight font-semibold">Business owners who finally <br className="hidden md:block" /> know their <span className="italic text-[#20C997]">numbers.</span></h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="bg-[#0C1218] p-12 rounded-2xl border border-white/10 hover:border-[#20C997]/40 transition-all group relative shadow-lg">
                  <div className="absolute top-6 right-10 text-5xl text-[#20C997]/20 hl-serif italic">"</div>
                  <p className="text-lg text-[#C5D1DE] italic mb-12 leading-relaxed font-medium">"{t.quote}"</p>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#20C997] to-[#0d5534] flex items-center justify-center text-white font-black text-base uppercase shadow-lg">{t.initials}</div>
                    <div>
                      <div className="text-white font-semibold hl-serif text-lg">{t.name}</div>
                      <div className="text-[11px] hl-mono capitalize tracking-wide label-glow font-medium">{t.role}</div>
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
      <section id="contact" className="py-32 bg-[#0C1218]">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-24">
          <FadeUp>
            <span className="text-[13px] font-semibold hl-mono capitalize tracking-normal text-[#20C997] mb-4 block">Contact</span>
            <h2 className="text-4xl md:text-6xl hl-serif text-white mb-8 font-semibold leading-tight">Need help?<br /><span className="italic text-[#20C997]">We're here.</span></h2>
            <p className="text-[17px] text-[#C5D1DE] leading-relaxed mb-12 font-medium">Have a question or need help setting up? Reach us anytime. We're ready to help your business grow.</p>
            <div className="space-y-8">
              <div className="flex items-center gap-5 text-white hl-mono text-base font-medium">
                <div className="w-12 h-12 rounded-lg bg-[#20C997]/15 flex items-center justify-center text-[#20C997] border border-[#20C997]/30 shadow-md">
                  <Phone size={22} />
                </div>
                +254 XXX XXX XXX
              </div>
              <div className="flex items-center gap-5 text-white hl-mono text-base font-medium">
                <div className="w-12 h-12 rounded-lg bg-[#20C997]/15 flex items-center justify-center text-[#20C997] border border-[#20C997]/30 shadow-md">
                  <Mail size={22} />
                </div>
                support@hlynk.co.ke
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.2} className="bg-[#161F27] p-12 rounded-3xl border border-white/10 shadow-2xl">
            <ContactForm />
          </FadeUp>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 border-t border-white/10 bg-[#0C1218]">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <img src="/logo.png" className="h-10 w-auto opacity-90" alt="hlynk" />
          <div className="text-[11px] hl-mono label-glow capitalize tracking-normal font-medium opacity-80 text-white">© 2025 hlynk. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}