import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import About from '../components/landing/About'
import WhoUses from '../components/landing/WhoUses'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Pricing from '../components/landing/Pricing'
import FAQ from '../components/landing/FAQ'
import Contact from '../components/landing/Contact'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <Navbar />

      <main>
        <Hero />

        <div className="relative z-10 -mt-10 md:-mt-20">
          <WhoUses />
        </div>

        <About />

        <Features />

        <HowItWorks />

        <Pricing />

        <FAQ />

        <Contact />
      </main>

      <Footer />
    </div>
  )
}