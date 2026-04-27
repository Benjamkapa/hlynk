import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import WhoUses from '../components/landing/WhoUses'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Pricing from '../components/landing/Pricing'
import Contact from '../components/landing/Contact'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* 
        LANDING PAGE ARCHITECTURE:
        - Header: Transparent to White Blur
        - Hero: Light (Slate-50) + Dynamic Canvas
        - WhoUses: Light (White) Grid
        - Features: Light (White) / Subtle Slate
        - HowItWorks: Dark (Emerald-900)
        - Pricing: Light (Slate-50)
        - Contact: Dark (Emerald-950)
        - Footer: Dark (Black-Emerald)
      */}
      
      <Navbar />
      
      <main>
        <Hero />
        
        <div className="relative z-10 -mt-10 md:-mt-20">
          <WhoUses />
        </div>

        <Features />
        
        <HowItWorks />
        
        <Pricing />
        
        <Contact />
      </main>

      <Footer />
    </div>
  )
}