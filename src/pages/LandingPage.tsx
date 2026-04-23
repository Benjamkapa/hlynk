import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Zap, LayoutDashboard, ShieldCheck, Phone, BarChart3, PackageSearch,
  TrendingUp, Receipt, Users, ArrowRight, Check, Menu, X,
  ShoppingCart, CreditCard, Wallet, Star, Bell, 
  Scissors, Wrench, Smartphone, Sparkles, Utensils, Shirt, Camera,
  Monitor, GraduationCap, Cpu, Plus
} from "lucide-react";

/* ─── TYPES ─── */
interface NavItem { label: string; href: string }
interface Feature { icon: React.ReactNode; title: string; desc: string }
interface PricingPlan {
  name: string; price: string; sub: string; desc: string;
  color: string; textColor: string; features: string[]; badge?: string;
}
interface Testimonial { name: string; role: string; quote: string; initials: string }
interface WhoCard { icon: React.ReactNode; label: string }

/* ─── COUNTER HOOK ─── */
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── INTERSECTION OBSERVER HOOK ─── */
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

/* ─── POS CANVAS ANIMATION ─── */
function POSCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    const W = canvas.width, H = canvas.height;

    // receipt lines floating up
    type ReceiptLine = { x: number; y: number; w: number; alpha: number; speed: number; color: string };
    const receipts: ReceiptLine[] = [];

    // coin/KES symbols
    type Coin = { x: number; y: number; vy: number; alpha: number; size: number; text: string };
    const coins: Coin[] = [];

    // orbiting nodes
    const nodeCount = 7;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      angle: (i / nodeCount) * Math.PI * 2,
      radius: Math.min(W, H) * 0.28 + (i % 2) * 30,
      speed: 0.003 + i * 0.0005,
      size: 6 + (i % 3) * 3,
      color: ["#20C997", "#0B5ED7", "#FD7E14", "#20C997", "#fff", "#20C997", "#0B5ED7"][i],
    }));

    for (let i = 0; i < 40; i++) {
      receipts.push({ x: Math.random() * W, y: Math.random() * H, w: 30 + Math.random() * 60, alpha: Math.random() * 0.15, speed: 0.2 + Math.random() * 0.4, color: i % 3 === 0 ? "#20C997" : i % 3 === 1 ? "#0B5ED7" : "#FD7E14" });
    }
    for (let i = 0; i < 12; i++) {
      coins.push({ x: Math.random() * W, y: Math.random() * H + H, vy: -(0.3 + Math.random() * 0.6), alpha: 0, size: 10 + Math.random() * 8, text: ["KES", "+", "₊", "✓"][Math.floor(Math.random() * 4)] });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.5);
      g.addColorStop(0, "rgba(32,201,151,0.07)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(W, H) * 0.38, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(32,201,151,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      nodes.forEach((n) => {
        n.angle += n.speed;
        const nx = cx + Math.cos(n.angle) * n.radius;
        const ny = cy + Math.sin(n.angle) * n.radius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `rgba(32,201,151,0.07)`;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });

      // center POS terminal icon
      ctx.save();
      ctx.translate(cx, cy);
      const ts = Math.min(W, H) * 0.07;
      ctx.fillStyle = "rgba(32,201,151,0.18)";
      ctx.beginPath();
      ctx.roundRect(-ts, -ts * 1.2, ts * 2, ts * 2.4, ts * 0.2);
      ctx.fill();
      ctx.strokeStyle = "rgba(32,201,151,0.5)";
      ctx.stroke();
      ctx.restore();

      receipts.forEach(r => {
        r.y -= r.speed;
        if (r.y < -20) r.y = H + 10;
        ctx.fillStyle = r.color;
        ctx.globalAlpha = Math.sin(r.y / H * Math.PI) * 0.18;
        ctx.fillRect(r.x, r.y, r.w, 1.5);
        ctx.globalAlpha = 1;
      });

      coins.forEach(c => {
        c.y += c.vy;
        if (c.y < -30) c.y = H + 10;
        ctx.globalAlpha = Math.sin(Math.abs(c.y / H) * Math.PI) * 0.55;
        ctx.fillStyle = "#20C997";
        ctx.font = `bold ${c.size}px sans-serif`;
        ctx.fillText(c.text, c.x, c.y);
        ctx.globalAlpha = 1;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", setSize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", setSize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─── FADE UP WRAPPER ─── */
function FadeUp({ children, delay = 0, className = "", style = {} }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`
    }}>
      {children}
    </div>
  );
}

/* ─── STAT COUNTER ─── */
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView(0.3);
  const count = useCounter(value, 2000, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="font-bold text-[clamp(1.8rem,4vw,2.8rem)] text-[#0D2419] leading-tight" style={{ fontFamily: "'Play', sans-serif" }}>
        <span className="text-[#20C997]">{count}{suffix}</span>
      </div>
      <div className="text-sm md:text-base text-[#7A8896] mt-1">{label}</div>
    </div>
  );
}

/* ─── DATA ─── */
const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it Works", href: "#how" },
  { label: "Reviews", href: "#reviews" },
];

const features: Feature[] = [
  { icon: <TrendingUp size={22} />, title: "Know Your Real Profit", desc: "See your daily and monthly profit after all expenses. hlynk does the math so you finally know what your business actually makes." },
  { icon: <PackageSearch size={22} />, title: "Stock That Updates Itself", desc: "Inventory levels deduct automatically as you record sales. Get low-stock alerts on your phone before you run out." },
  { icon: <Wallet size={22} />, title: "Track Every Expense", desc: "Record every shilling that leaves your business — rent, stock, or wages. Stay in control of your cash flow effortlessly." },
  { icon: <Receipt size={22} />, title: "Digital Sales Records", desc: "Full history of every transaction at your fingertips. No more paper books. See your best-selling items and busiest days instantly." },
  { icon: <ShieldCheck size={22} />, title: "Public Business Profile", desc: "A professional page at hlynk.com/your-business to share on WhatsApp and let customers find your services online." },
  { icon: <Bell size={22} />, title: "Customer Request Alerts", desc: "Get notified when customers find you online. Record and manage work requests directly from your management dashboard." },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "KES 1,000",
    sub: "/month",
    desc: "Perfect for single-owner shops starting out.",
    color: "#F9C7E0",
    textColor: "#1a1a1a",
    features: ["Public business profile", "Track sales & expenses", "Basic profit reports", "Customer request inbox", "WhatsApp & call ready"],
  },
  {
    name: "Growth",
    price: "KES 2,500",
    sub: "/month",
    desc: "For growing businesses with employees.",
    color: "#B2EDE0",
    textColor: "#1a1a1a",
    badge: "Most Popular",
    features: ["Everything in Starter", "Full inventory management", "Low-stock alerts", "Detailed growth reports", "Multi-user access", "Verified business badge"],
  },
  {
    name: "Enterprise",
    price: "KES 5,000",
    sub: "/month",
    desc: "For large shops and multiple locations.",
    color: "#FFD166",
    textColor: "#1a1a1a",
    features: ["Everything in Growth", "Multi-location management", "Advanced analytics", "Priority WhatsApp support", "Custom business branding", "Bulk data export"],
  },
];

const testimonials: Testimonial[] = [
  { name: "Mama Njeri", role: "Njeri Beauty Salon, Westlands", initials: "MN", quote: "I used to count cash at the end of the day and wonder where it all went. Now I see every sale, every expense. My salon actually grew 40% once I started tracking properly." },
  { name: "John Kamau", role: "Kamau Electronics Repair, Thika", initials: "JK", quote: "The inventory alerts alone saved me. I used to order parts I already had and run out of ones I needed. Now my workshop runs like a proper business." },
  { name: "Aisha Osman", role: "Clean & Shine Services, Mombasa", initials: "AO", quote: "I finally know my real profit. Not just what comes in — what stays after expenses. That changed everything about how I price my services." },
];

const whoCards: WhoCard[] = [
  { icon: <Scissors size={22} />, label: "Salons & Barbershops" },
  { icon: <Wrench size={22} />, label: "Mechanics" },
  { icon: <Smartphone size={22} />, label: "Phone Repair" },
  { icon: <Sparkles size={22} />, label: "Cleaning Services" },
  { icon: <Zap size={22} />, label: "Electricians & Plumbers" },
  { icon: <Utensils size={22} />, label: "Food & Catering" },
  { icon: <Shirt size={22} />, label: "Tailors & Designers" },
  { icon: <Camera size={22} />, label: "Photographers" },
  { icon: <Monitor size={22} />, label: "Freelancers" },
  { icon: <GraduationCap size={22} />, label: "Tutors" },
  { icon: <Cpu size={22} />, label: "Electronics Repair" },
  { icon: <Plus size={22} />, label: "And many more…" },
];

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
    <div className="bg-[#F5F7F8] text-[#161E2A] selection:bg-[#20C997] selection:text-white font-nunito">
      
      {/* ─── NAVIGATION ─── */}
      <header className={`fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-[#E5E9EC] transition-transform duration-300 ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="hlynk logo" className="h-10 w-auto transition-transform group-hover:scale-105" />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map(n => (
              <a key={n.label} href={n.href} className="text-sm font-semibold text-[#7A8896] hover:text-[#161E2A] transition-colors">{n.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-bold text-[#161E2A] hover:text-[#20C997] transition-colors">Log in</Link>
            <Link to="/register" className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#20C997] text-white text-sm font-bold shadow-lg shadow-[#20C997]/20 hover:bg-[#1ab785] hover:-translate-y-0.5 transition-all">Get Started Free</Link>
            <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 text-[#161E2A] hover:bg-[#F5F7F8] rounded-xl transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      <div className={`fixed inset-0 z-[200] bg-white p-8 flex flex-col gap-8 transition-transform duration-500 lg:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setMenuOpen(false)} className="self-end p-2 text-[#161E2A] hover:bg-[#F5F7F8] rounded-xl"><X size={32} /></button>
        <nav className="flex flex-col gap-6">
          {navItems.map(n => (
            <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className="text-3xl font-bold text-[#161E2A]">{n.label}</a>
          ))}
          <div className="h-[1px] bg-[#E5E9EC] w-full" />
          <Link to="/login" onClick={() => setMenuOpen(false)} className="text-3xl font-bold text-[#20C997]">Log in</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full py-4 rounded-2xl bg-[#20C997] text-white font-bold text-center text-xl shadow-xl shadow-[#20C997]/20">Get Started Free</Link>
        </nav>
      </div>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-[#0D2419] via-[#0a3d28] to-[#0d5534] overflow-hidden min-h-[92vh] flex items-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(32,201,151,0.15)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_50%,rgba(32,201,151,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <POSCanvas />
          <FadeUp className="text-center lg:text-left">
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#20C997]/15 border border-[#20C997]/30 text-[#20C997] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
              <span className="animate-pulse">●</span> 🇰🇪 Built for Kenyan Business
            </div> */}
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6 font-ubuntu">
              Go Online. <br />
              <span className="text-[#20C997]">Know Your</span> <br />
              Numbers.
            </h1>
            <p className="text-base md:text-lg text-white/60 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              hlynk gives Kenyan service providers a professional online presence and a real POS dashboard — so you can manage requests, track inventory, and finally know what your business actually makes.
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link to="/register" className="px-8 py-4 rounded-xl bg-[#20C997] text-white font-bold text-base shadow-xl shadow-[#20C997]/30 hover:bg-[#1ab785] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                Start Free — 14 Days <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-base hover:bg-white/15 transition-all flex items-center justify-center">
                Log in
              </Link>
            </div> */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-[10px] md:text-xs text-white/40 uppercase tracking-widest font-bold">
              <span className="flex items-center gap-2"><Check size={14} className="text-[#20C997]" /> No credit card</span>
              <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-2"><Check size={14} className="text-[#20C997]" /> M-Pesa payments</span>
              <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-2"><Check size={14} className="text-[#20C997]" /> Cancel anytime</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.2} className="hidden lg:block relative">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 transform perspective-[1200px] -rotate-y-[5deg] rotate-x-[2deg] hover:rotate-0 transition-transform duration-500">
              {/* Fake dashboard top bar */}
              <div className="bg-[#0D2419] px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C940]" />
                </div>
                <div className="text-[10px] text-white/30 font-medium ml-4">hlynk Dashboard</div>
              </div>
              <div className="flex h-[380px]">
                {/* Sidebar */}
                <div className="w-40 bg-[#0D2419] p-4 flex flex-col gap-1 border-r border-white/5">
                  <div className="text-[#20C997] font-bold text-xs mb-6 px-2">HLYNK</div>
                  {[
                    { icon: <LayoutDashboard size={14} />, label: "Dashboard", active: true },
                    { icon: <PackageSearch size={14} />, label: "Inventory" },
                    { icon: <Receipt size={14} />, label: "Sales" },
                    { icon: <BarChart3 size={14} />, label: "Reports" },
                    { icon: <Users size={14} />, label: "Requests" },
                  ].map(item => (
                    <div key={item.label} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-bold ${item.active ? "bg-[#20C997]/20 text-[#20C997]" : "text-white/40"}`}>
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 bg-[#F8FAF9] p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { val: "KES 24,500", label: "Today's Revenue", color: "text-[#20C997]" },
                      { val: "KES 8,200", label: "Net Profit", color: "text-[#0B5ED7]" },
                      { val: "18", label: "Low Stock", color: "text-[#FD7E14]" },
                      { val: "7", label: "Requests", color: "text-[#161E2A]" },
                    ].map(s => (
                      <div key={s.label} className="bg-white p-3 rounded-xl border border-[#E5E9EC]">
                        <div className={`text-sm font-black ${s.color}`}>{s.val}</div>
                        <div className="text-[9px] text-[#7A8896] font-bold uppercase mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-[#E5E9EC] overflow-hidden">
                    <div className="bg-[#F5F7F8] px-3 py-2 text-[8px] font-bold text-[#7A8896] uppercase tracking-widest flex justify-between">
                      <span>Item Sold</span><span>Qty</span><span>Status</span>
                    </div>
                    {[
                      { item: "Haircut — Full", qty: "x4", status: "Done", bg: "bg-[#E6FAF5]", text: "text-[#20C997]" },
                      { item: "Phone Screen", qty: "x1", status: "Pending", bg: "bg-[#FFF3E0]", text: "text-[#FD7E14]" },
                      { item: "Catering", qty: "x1", status: "New", bg: "bg-[#E8F0FE]", text: "text-[#0B5ED7]" },
                    ].map(r => (
                      <div key={r.item} className="px-3 py-2 border-t border-[#E5E9EC] text-[9px] flex justify-between items-center">
                        <span className="font-bold">{r.item}</span>
                        <span className="text-[#7A8896]">{r.qty}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${r.bg} ${r.text}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <div className="bg-white border-y border-[#E5E9EC]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 items-center">
          <div className="text-center">
            <div className="font-bold text-[clamp(1.2rem,3vw,1.8rem)] text-[#0D2419] uppercase tracking-widest font-ubuntu">Simple</div>
            <div className="text-sm text-[#7A8896] mt-1">No technical skills needed</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[clamp(1.2rem,3vw,1.8rem)] text-[#0D2419] uppercase tracking-widest font-ubuntu">Professional</div>
            <div className="text-sm text-[#7A8896] mt-1">Digital records for your shop</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[clamp(1.2rem,3vw,1.8rem)] text-[#0D2419] uppercase tracking-widest font-ubuntu">Reliable</div>
            <div className="text-sm text-[#7A8896] mt-1">Built for Kenyan businesses</div>
          </div>
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 md:py-32 bg-[#F5F7F8]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="mb-16">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#20C997] mb-4 block" style={{ fontFamily: "'Play', sans-serif" }}>Why hlynk</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#161E2A] leading-tight mb-6 font-ubuntu">Run your business. <br className="hidden md:block" /> Know your numbers.</h2>
            <p className="text-base md:text-lg text-[#7A8896] max-w-2xl leading-relaxed">
              Most Kenyan business owners work hard but never see real profit — because they have no system. hlynk gives you the tools to manage, track, and grow.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.05}>
                <div className="h-full bg-white p-8 rounded-2xl border border-[#E5E9EC] hover:border-[#20C997]/40 hover:shadow-2xl hover:shadow-[#0D2419]/5 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[#20C997]/10 flex items-center justify-center text-[#20C997] mb-6 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#161E2A] mb-3 font-ubuntu">{f.title}</h3>
                  <p className="text-sm md:text-base text-[#7A8896] leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16 md:mb-20">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#20C997] mb-4 block" style={{ fontFamily: "'Play', sans-serif" }}>How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#161E2A] mb-6 font-ubuntu">Up and running in 3 minutes</h2>
            <p className="text-base md:text-lg text-[#7A8896] max-w-xl mx-auto">No setup fees. No tech skills. Just create your account and start tracking.</p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[#20C997] via-[#20C997]/20 to-[#20C997]/5" />
            {[
              { n: "01", title: "Sign Up Free", desc: "Create your business profile in under 3 minutes. Add your name, category, and location." },
              { n: "02", title: "Add Services & Inventory", desc: "List your services and products with prices. Set stock levels and let the system track deductions automatically." },
              { n: "03", title: "Sell, Track & Grow", desc: "Record every sale. Watch your real profit grow on the dashboard. Get found by new customers online." },
            ].map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.1} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D2419] to-[#0d5534] text-[#20C997] flex items-center justify-center font-black text-xl mb-8 mx-auto shadow-xl shadow-[#0D2419]/20 relative z-10">
                  {s.n}
                </div>
                <h3 className="text-xl font-bold text-[#161E2A] mb-4 font-ubuntu">{s.title}</h3>
                <p className="text-[#7A8896] leading-relaxed px-4">{s.desc}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IS IT FOR ─── */}
      <section className="py-24 md:py-32 bg-[#F5F7F8]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#20C997] mb-4 block" style={{ fontFamily: "'Play', sans-serif" }}>Who Uses hlynk</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[#161E2A] mb-6 font-ubuntu">Built for every service provider</h2>
            <p className="text-base md:text-lg text-[#7A8896] max-w-xl mx-auto">Whether you cut hair, fix cars, or feed people — if money moves through your hands, you need hlynk.</p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {whoCards.map((w, i) => (
              <FadeUp key={w.label} delay={i * 0.03}>
                <div className="bg-white p-6 rounded-2xl text-center border border-transparent hover:border-[#20C997]/30 hover:shadow-xl hover:shadow-[#0D2419]/5 transition-all group">
                  <div className="text-[#20C997] mb-4 flex justify-center group-hover:scale-110 transition-transform">{w.icon}</div>
                  <div className="text-xs md:text-sm font-bold text-[#161E2A] uppercase tracking-wider">{w.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 md:py-32 bg-[#0D0D0D] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#20C997]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0B5ED7]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeUp className="text-center mb-20">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#20C997] mb-4 block" style={{ fontFamily: "'Play', sans-serif" }}>Pricing</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-ubuntu">Simple, honest pricing</h2>
            <p className="text-white/40 max-w-xl mx-auto">Start with a 14-day free trial. Upgrade via M-Pesa — no card needed.</p>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.1}>
                <div className={`h-full p-10 rounded-[32px] flex flex-col relative overflow-hidden transition-transform hover:-translate-y-2 duration-300 ${p.badge ? "scale-105 z-10 ring-2 ring-[#20C997]/50" : ""}`} style={{ backgroundColor: p.color }}>
                  {p.badge && (
                    <div className="absolute top-6 right-6 px-4 py-1.5 bg-[#0D0D0D] text-white text-[10px] font-black uppercase tracking-widest rounded-full">{p.badge}</div>
                  )}
                  <div className="text-xs font-black uppercase tracking-widest text-black/50 mb-2">{p.name}</div>
                  <div className="text-4xl md:text-5xl font-black text-black mb-1 font-ubuntu">{p.price}</div>
                  <div className="text-xs font-bold text-black/40 mb-2">{p.sub}</div>
                  <p className="text-sm text-black/70 mb-10 leading-relaxed">{p.desc}</p>
                  
                  <ul className="space-y-4 mb-12 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm text-black font-semibold leading-tight">
                        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} color="white" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className="w-full py-4 rounded-2xl bg-[#0D0D0D] text-white font-bold text-center hover:opacity-90 transition-opacity">
                    Get {p.name} Plan
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
          <p className="text-center text-xs font-bold text-white/30 uppercase tracking-widest mt-12">All plans include 14-day free trial · M-Pesa ready · Cancel anytime</p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="reviews" className="py-24 md:py-32 bg-[#0D2419]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="mb-16">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#20C997] mb-4 block" style={{ fontFamily: "'Play', sans-serif" }}>Reviews</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight font-ubuntu">Business owners who finally <br className="hidden md:block" /> know their numbers</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="h-full bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all">
                  <div className="flex gap-1 mb-6 text-[#20C997]">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-white/70 italic text-base leading-relaxed mb-10">"{t.quote}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#20C997] to-[#0d5534] flex items-center justify-center text-white font-black text-sm uppercase">{t.initials}</div>
                    <div>
                      <div className="text-white font-bold">{t.name}</div>
                      <div className="text-white/40 text-xs font-medium">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative py-24 md:py-40 bg-gradient-to-br from-[#0D2419] via-[#0a3d28] to-[#0d5534] flex items-center justify-center overflow-hidden">
        <POSCanvas />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <FadeUp>
            {/* <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#20C997]/15 border border-[#20C997]/30 text-[#20C997] text-xs font-bold uppercase tracking-widest mb-8">
              <ShoppingCart size={14} /> POS + Online Presence
            </div> */}
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight font-ubuntu">
              Ready to know what <br /> your business <span className="text-[#20C997]">really makes?</span>
            </h2>
            <p className="text-base md:text-lg text-white/50 mb-12 max-w-xl mx-auto">
              Join thousands of Kenyan service providers using hlynk to track sales, manage inventory, and grow with confidence.
            </p>
            <Link to="/register" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-[#20C997] text-white font-bold text-lg shadow-2xl shadow-[#20C997]/30 hover:bg-[#1ab785] hover:-translate-y-1 transition-all">
              Start Free 14-Day Trial <ArrowRight size={22} />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0D2419] py-16 md:py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="hlynk logo" className="h-10 w-auto" />
              </Link>
              <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Your Business. Online. Today.</p>
            </div>
            <div className="flex flex-wrap gap-8 md:gap-12">
              {[...navItems, { label: "Register", href: "/register" }, { label: "Log In", href: "/login" }].map(l => (
                <a key={l.label} href={l.href} className="text-sm font-bold text-white/40 hover:text-[#20C997] transition-colors uppercase tracking-widest">{l.label}</a>
              ))}
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            <span>© 2025 hlynk. All rights reserved.</span>
            <span>Built for Kenya 🇰🇪</span>
          </div>
        </div>
      </footer>
      
    </div>
  );
}