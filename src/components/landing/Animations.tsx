import { useState, useEffect, useRef } from "react"

export function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export function FadeUp({ children, delay = 0, className = "", style = {} }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(60px)",
      transition: `opacity 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  )
}

export function ScaleIn({ children, delay = 0, className = "", style = {} }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: inView ? 1 : 0,
      transform: inView ? "scale(1)" : "scale(0.85)",
      transition: `opacity 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  )
}

export function SlideIn({ children, delay = 0, direction = "left", className = "", style = {} }: { children: React.ReactNode; delay?: number; direction?: "left" | "right"; className?: string; style?: React.CSSProperties }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateX(0)" : direction === "left" ? "translateX(-60px)" : "translateX(60px)",
      transition: `opacity 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  )
}

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(100%)",
        transition: `opacity 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
      }}>
        {children}
      </div>
    </div>
  )
}

export function POSCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let W = 0, H = 0, raf = 0, t = 0

    const C = {
      teal: "rgba(16,185,129,", // emerald-500
      blue: "rgba(59,130,246,", // blue-500
      slate: "rgba(148,163,184,", // slate-400
    }

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string; twinkle: number; twinkleSpeed: number }
    type Stream = { x: number; y: number; len: number; speed: number; alpha: number; width: number; color: string }
    type Hex = { cx: number; cy: number; r: number; rot: number; rotSpeed: number; alpha: number; color: string; phase: number }
    type Ring = { cx: number; cy: number; r: number; maxR: number; speed: number; alpha: number; color: string; t: number }
    type Floater = { x: number; y: number; vy: number; alpha: number; size: number; text: string; color: string; phase: number }

    let particles: Particle[], streams: Stream[], hexes: Hex[], rings: Ring[], floaters: Floater[]

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    function init() {
      if (!canvas) return
      W = canvas.width = canvas.offsetWidth * dpr
      H = canvas.height = canvas.offsetHeight * dpr

      particles = Array.from({ length: 40 }, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.25, 0.25), vy: rand(-0.5, -0.1),
        size: rand(1, 2.5) * dpr,
        alpha: rand(0.1, 0.4),
        color: [C.teal, C.blue, C.slate][Math.floor(rand(0, 3))],
        twinkle: rand(0, Math.PI * 2),
        twinkleSpeed: rand(0.015, 0.05),
      }))

      streams = Array.from({ length: 10 }, (_, i) => ({
        x: rand(0, W), y: rand(-H, H),
        len: rand(80, 220) * dpr,
        speed: rand(0.5, 1.4),
        alpha: rand(0.04, 0.1),
        width: rand(0.5, 1.5) * dpr,
        color: [C.teal, C.blue, C.slate][i % 3],
      }))

      hexes = Array.from({ length: 6 }, (_, i) => ({
        cx: W * rand(0.1, 0.9),
        cy: H * rand(0.1, 0.9),
        r: rand(30, 80) * dpr,
        rot: rand(0, Math.PI),
        rotSpeed: rand(-0.002, 0.002),
        alpha: rand(0.02, 0.05),
        color: [C.teal, C.blue, C.slate][i % 3],
        phase: rand(0, Math.PI * 2),
      }))

      rings = []
      const labels = ["KES", "+", "✓", "₊", "→", "%", "↑"]
      floaters = Array.from({ length: 12 }, (_, i) => ({
        x: rand(0, W), y: rand(0, H),
        vy: rand(-0.2, -0.5),
        alpha: rand(0.05, 0.2),
        size: rand(10, 20) * dpr,
        text: labels[i % labels.length],
        color: [C.teal, C.blue, C.slate][i % 3] + "0.6)",
        phase: rand(0, Math.PI * 2),
      }))
    }

    function hexPath(cx: number, cy: number, r: number, rot: number) {
      if (!ctx) return
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = rot + (i / 6) * Math.PI * 2
        i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
          : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      }
      ctx.closePath()
    }

    function draw() {
      if (!ctx) return
      t++
      ctx.clearRect(0, 0, W, H)

      // Background glow
      let g = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, W * 0.6)
      g.addColorStop(0, "rgba(16,185,129,0.03)")
      g.addColorStop(1, "transparent")
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

      // Hexagons
      hexes.forEach(h => {
        h.rot += h.rotSpeed
        const pulse = Math.sin(t * 0.01 + h.phase) * 0.5 + 0.5
        const a = h.alpha * (0.5 + pulse * 0.5)
        ctx.lineWidth = dpr * 0.5
        ctx.strokeStyle = h.color + a + ")"
        hexPath(h.cx, h.cy, h.r, h.rot); ctx.stroke()
      })

      // Data streams
      streams.forEach(s => {
        s.y -= s.speed
        if (s.y + s.len < 0) { s.y = H + s.len; s.x = rand(0, W); }
        const gr = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y)
        gr.addColorStop(0, s.color + "0)")
        gr.addColorStop(0.5, s.color + s.alpha + ")")
        gr.addColorStop(1, s.color + "0)")
        ctx.beginPath(); ctx.moveTo(s.x, s.y - s.len); ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = gr; ctx.lineWidth = s.width; ctx.stroke()
      })

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.twinkle += p.twinkleSpeed
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
        const ta = p.alpha * (0.4 + 0.6 * Math.sin(p.twinkle))
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + ta + ")"
        ctx.fill()
      })

      // Floaters
      floaters.forEach(f => {
        f.y += f.vy; f.phase += 0.01
        if (f.y < -30) { f.y = H + 20; f.x = rand(0, W); }
        ctx.globalAlpha = f.alpha * (0.6 + 0.4 * Math.sin(f.phase))
        ctx.fillStyle = f.color
        ctx.font = `bold ${Math.round(f.size)}px "Nunito", sans-serif`
        ctx.fillText(f.text, f.x, f.y)
        ctx.globalAlpha = 1
      })

      raf = requestAnimationFrame(draw)
    }

    const handleResize = () => {
      cancelAnimationFrame(raf)
      init()
      draw()
    }

    init(); draw()
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0" />
}

// ─── Stacked Scroll Sections ───────────────────────────────────────────────────
// Each section sticks to the top and the next one slides over it, Apple-style.
export function StackedSections({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="relative">
      {children.map((child, i) => (
        <StackSection key={i} index={i} total={children.length}>
          {child}
        </StackSection>
      ))}
    </div>
  )
}

function StackSection({
  children,
  index,
  total,
}: {
  children: React.ReactNode
  index: number
  total: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Scale down slightly as newer cards stack over this one
    const scaleStep = 0.03
    const isLast = index === total - 1

    function onScroll() {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const parentTop = el.offsetTop
      const scrollY = window.scrollY

      // How much the user has scrolled past this section's entry point
      const progress = Math.max(0, Math.min(1, (scrollY - (parentTop - window.innerHeight * 0.8)) / (window.innerHeight * 0.5)))

      // After this card is pinned, scale it down as user scrolls further
      const pinned = rect.top <= 0
      const distancePastTop = pinned ? Math.abs(rect.top) : 0
      const sectionH = el.offsetHeight
      const exitProgress = Math.min(1, distancePastTop / sectionH)
      const scale = isLast ? 1 : Math.max(1 - scaleStep * (index + 1) * exitProgress * 3, 0.88)
      const opacity = isLast ? 1 : Math.max(1 - exitProgress * 0.25, 0.75)

      setStyle({
        opacity: progress,
        transform: `translateY(${(1 - progress) * 60}px) scale(${scale})`,
        transformOrigin: 'top center',
        filter: isLast ? 'none' : exitProgress > 0.05 ? `blur(${exitProgress * 1.5}px)` : 'none',
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [index, total])

  return (
    <div
      ref={ref}
      style={{
        position: 'sticky',
        top: `${index * 8}px`,
        zIndex: 10 + index,
      }}
    >
      <div
        style={{
          willChange: 'transform, opacity',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease, filter 0.4s ease',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}
